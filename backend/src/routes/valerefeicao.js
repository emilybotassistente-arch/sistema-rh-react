const express = require('express');
const { getDatabase } = require('../database');

const router = express.Router();

// GET /api/valerefeicao?empresa_id=X
router.get('/', (req, res) => {
  const db = getDatabase();
  const { empresa_id } = req.query;
  if (!empresa_id) return res.status(400).json({ error: 'empresa_id é obrigatório' });

  // All configs for this empresa
  const configs = db.prepare('SELECT * FROM config_vale_refeicao WHERE empresa_id = ?').all(empresa_id);
  const funcionarios = db.prepare('SELECT * FROM funcionarios WHERE empresa_id = ? AND ativo = 1 ORDER BY nome').all(empresa_id);

  // Last 12 months
  const DATA_ATUAL = new Date('2026-06-15');
  const meses = [];
  for (let i = 11; i >= 0; i--) {
    let m = DATA_ATUAL.getMonth() + 1 - i;
    let a = DATA_ATUAL.getFullYear();
    while (m < 1) { m += 12; a--; }
    while (m > 12) { m -= 12; a++; }
    meses.push({ ano: a, mes: m, label: `${a}-${String(m).padStart(2, '0')}` });
  }

  // For each funcionario, get registros from vale_refeicao_mes
  const result = [];
  for (const func of funcionarios) {
    const config = configs.find(c => c.funcionario_id === func.id);
    if (!config) continue;

    const registrosMes = db.prepare('SELECT * FROM vale_refeicao_mes WHERE config_vr_id = ?').all(config.id);
    const mesesRegistros = {};
    for (const r of registrosMes) {
      mesesRegistros[r.competencia] = { valor_pago: r.valor_pago, observacoes: r.observacoes, is_default: false };
    }

    const funcMeses = [];
    for (const mes of meses) {
      const chave = `${mes.ano}-${String(mes.mes).padStart(2, '0')}-01`;
      if (mesesRegistros[chave]) {
        funcMeses.push({
          competencia: chave,
          ...mesesRegistros[chave],
        });
      } else {
        funcMeses.push({
          competencia: chave,
          valor_pago: config.valor_mensal,
          observacoes: '',
          is_default: true,
        });
      }
    }

    result.push({
      funcionario_id: func.id,
      funcionario_nome: func.nome,
      config_id: config.id,
      valor_mensal: config.valor_mensal,
      meses: funcMeses,
    });
  }

  res.json({ meses, registros: result });
});

// GET /api/valerefeicao/config?empresa_id=X
router.get('/config', (req, res) => {
  const db = getDatabase();
  const { empresa_id } = req.query;
  if (!empresa_id) return res.status(400).json({ error: 'empresa_id é obrigatório' });

  const configs = db.prepare(
    'SELECT c.*, f.nome as funcionario_nome FROM config_vale_refeicao c JOIN funcionarios f ON c.funcionario_id = f.id WHERE c.empresa_id = ? ORDER BY f.nome'
  ).all(empresa_id);
  res.json(configs);
});

// POST /api/valerefeicao/config
router.post('/config', (req, res) => {
  const db = getDatabase();
  const { funcionario_id, empresa_id, valor_mensal } = req.body;
  if (!funcionario_id || !empresa_id || valor_mensal === undefined) {
    return res.status(400).json({ error: 'funcionario_id, empresa_id e valor_mensal são obrigatórios' });
  }
  const existente = db.prepare('SELECT * FROM config_vale_refeicao WHERE funcionario_id = ?').get(funcionario_id);
  if (existente) {
    db.prepare('UPDATE config_vale_refeicao SET valor_mensal = ?, empresa_id = ? WHERE funcionario_id = ?').run(valor_mensal, empresa_id, funcionario_id);
    const updated = db.prepare('SELECT * FROM config_vale_refeicao WHERE funcionario_id = ?').get(funcionario_id);
    return res.json(updated);
  }
  const result = db.prepare('INSERT INTO config_vale_refeicao (funcionario_id, empresa_id, valor_mensal) VALUES (?, ?, ?)').run(funcionario_id, empresa_id, valor_mensal);
  const nova = db.prepare('SELECT * FROM config_vale_refeicao WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(nova);
});

// POST /api/valerefeicao/editar_cela
router.post('/editar_cela', (req, res) => {
  const db = getDatabase();
  const { funcionario_id, competencia, valor_pago, observacoes } = req.body;
  if (!funcionario_id || !competencia || valor_pago === undefined) {
    return res.status(400).json({ error: 'funcionario_id, competencia e valor_pago são obrigatórios' });
  }
  const config = db.prepare('SELECT * FROM config_vale_refeicao WHERE funcionario_id = ?').get(funcionario_id);
  if (!config) return res.status(400).json({ error: 'Config não encontrada' });

  const existente = db.prepare('SELECT * FROM vale_refeicao_mes WHERE config_vr_id = ? AND competencia = ?').get(config.id, competencia);
  if (existente) {
    db.prepare('UPDATE vale_refeicao_mes SET valor_pago = ?, observacoes = ? WHERE id = ?').run(valor_pago, observacoes || '', existente.id);
  } else {
    db.prepare('INSERT INTO vale_refeicao_mes (config_vr_id, competencia, valor_pago, observacoes) VALUES (?, ?, ?, ?)').run(config.id, competencia, valor_pago, observacoes || '');
  }
  res.json({ success: true, valor_pago, observacoes: observacoes || '' });
});

// DELETE /api/valerefeicao/:funcionario_id/mes/:competencia
router.delete('/:funcionario_id/mes/:competencia', (req, res) => {
  const db = getDatabase();
  const { funcionario_id, competencia } = req.params;
  const config = db.prepare('SELECT * FROM config_vale_refeicao WHERE funcionario_id = ?').get(funcionario_id);
  if (config) {
    db.prepare('DELETE FROM vale_refeicao_mes WHERE config_vr_id = ? AND competencia = ?').run(config.id, competencia);
  }
  res.json({ message: 'Registro excluído' });
});

// POST /api/valerefeicao/reajuste
router.post('/reajuste', (req, res) => {
  const db = getDatabase();
  const { empresa_id, percentual } = req.body;
  if (!empresa_id || percentual === undefined) {
    return res.status(400).json({ error: 'empresa_id e percentual são obrigatórios' });
  }
  const fator = 1 + (percentual / 100);
  const configs = db.prepare('SELECT * FROM config_vale_refeicao WHERE empresa_id = ?').all(empresa_id);
  let count = 0;
  for (const c of configs) {
    const valorAntigo = c.valor_mensal;
    const valorNovo = Math.round(valorAntigo * fator * 100) / 100;
    db.prepare('UPDATE config_vale_refeicao SET valor_mensal = ? WHERE id = ?').run(valorNovo, c.id);
    count++;
  }
  res.json({ message: `Reajuste de ${percentual}% aplicado em ${count} funcionários!`, count });
});

module.exports = router;
