const express = require('express');
const { getDatabase } = require('../database');

const router = express.Router();

function formatFunc(f) {
  return {
    ...f,
    ativo: !!f.ativo,
  };
}

// GET /api/funcionarios?empresa_id=X&q=Y
router.get('/', (req, res) => {
  const db = getDatabase();
  const { empresa_id, q } = req.query;

  let sql = `SELECT f.*, e.nome as empresa_nome FROM funcionarios f JOIN empresas e ON f.empresa_id = e.id WHERE 1=1`;
  const params = [];

  if (empresa_id) {
    sql += ` AND f.empresa_id = ?`;
    params.push(empresa_id);
  }
  if (q) {
    sql += ` AND f.nome LIKE ?`;
    params.push(`%${q}%`);
  }
  sql += ` ORDER BY f.nome`;

  const funcs = db.prepare(sql).all(...params);
  res.json(funcs.map(formatFunc));
});

// POST /api/funcionarios/reajuste - Aplicar reajuste salarial
router.post('/reajuste', (req, res) => {
  const db = getDatabase();
  const { empresa_id, percentual, piso_geral } = req.body;
  if (percentual === undefined) {
    return res.status(400).json({ error: 'percentual é obrigatório' });
  }
  const fator = 1 + (percentual / 100);

  let sql = 'SELECT * FROM funcionarios WHERE ativo = 1';
  const params = [];
  if (empresa_id) {
    sql += ' AND empresa_id = ?';
    params.push(empresa_id);
  }
  const funcionarios = db.prepare(sql).all(...params);

  let count = 0;
  let pisoAplicadoCount = 0;

  for (const f of funcionarios) {
    const salAtual = f.salario;
    const salCalc = Math.round(salAtual * fator * 100) / 100;

    // Update piso_geral if informed
    if (piso_geral) {
      db.prepare('UPDATE funcionarios SET piso_salarial = ? WHERE id = ?').run(piso_geral, f.id);
    }

    // Get piso_final: max between piso_cargo and piso_salarial
    const pisoCargo = db.prepare('SELECT valor_piso FROM piso_cargo WHERE empresa_id = ? AND cargo = ?').get(f.empresa_id, f.cargo);
    const pisoCargoVal = pisoCargo ? pisoCargo.valor_piso : 0;
    const pisoIndividual = f.piso_salarial || 0;
    let pisoFinal = Math.max(pisoCargoVal, pisoIndividual);
    if (piso_geral) {
      pisoFinal = Math.max(pisoFinal, parseFloat(piso_geral));
    }

    let salNovo;
    if (pisoFinal > 0 && salCalc < pisoFinal) {
      salNovo = pisoFinal;
      pisoAplicadoCount++;
    } else {
      salNovo = salCalc;
    }

    db.prepare('UPDATE funcionarios SET salario = ? WHERE id = ?').run(salNovo, f.id);
    count++;
  }

  res.json({
    message: `Reajuste de ${percentual}% aplicado em ${count} funcionário(s)! ${pisoAplicadoCount} receberam piso.`,
    count,
    piso_aplicado_count: pisoAplicadoCount,
  });
});

// GET /api/funcionarios/:id
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const func = db.prepare('SELECT f.*, e.nome as empresa_nome FROM funcionarios f JOIN empresas e ON f.empresa_id = e.id WHERE f.id = ?').get(req.params.id);
  if (!func) return res.status(404).json({ error: 'Funcionário não encontrado' });
  res.json(formatFunc(func));
});

// POST /api/funcionarios
router.post('/', (req, res) => {
  const db = getDatabase();
  const { nome, cargo, funcao, empresa_id, data_admissao, salario, piso_salarial, ativo } = req.body;
  if (!nome || !cargo || !empresa_id || !data_admissao || salario === undefined) {
    return res.status(400).json({ error: 'Nome, cargo, empresa_id, data_admissao e salario são obrigatórios' });
  }
  const result = db.prepare(
    'INSERT INTO funcionarios (nome, cargo, funcao, empresa_id, data_admissao, salario, piso_salarial, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(nome, cargo, funcao || '', empresa_id, data_admissao, salario, piso_salarial || null, ativo !== false ? 1 : 0);
  const func = db.prepare('SELECT * FROM funcionarios WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(formatFunc(func));
});

// PUT /api/funcionarios/:id
router.put('/:id', (req, res) => {
  const db = getDatabase();
  const func = db.prepare('SELECT * FROM funcionarios WHERE id = ?').get(req.params.id);
  if (!func) return res.status(404).json({ error: 'Funcionário não encontrado' });
  const { nome, cargo, funcao, empresa_id, data_admissao, salario, piso_salarial, ativo } = req.body;
  db.prepare(
    'UPDATE funcionarios SET nome = ?, cargo = ?, funcao = ?, empresa_id = ?, data_admissao = ?, salario = ?, piso_salarial = ?, ativo = ? WHERE id = ?'
  ).run(
    nome || func.nome,
    cargo || func.cargo,
    funcao !== undefined ? funcao : func.funcao,
    empresa_id || func.empresa_id,
    data_admissao || func.data_admissao,
    salario !== undefined ? salario : func.salario,
    piso_salarial !== undefined ? piso_salarial : func.piso_salarial,
    ativo !== undefined ? (ativo ? 1 : 0) : func.ativo,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM funcionarios WHERE id = ?').get(req.params.id);
  res.json(formatFunc(updated));
});

// DELETE /api/funcionarios/:id
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const func = db.prepare('SELECT * FROM funcionarios WHERE id = ?').get(req.params.id);
  if (!func) return res.status(404).json({ error: 'Funcionário não encontrado' });
  db.prepare('DELETE FROM funcionarios WHERE id = ?').run(req.params.id);
  res.json({ message: 'Funcionário excluído com sucesso' });
});

module.exports = router;
