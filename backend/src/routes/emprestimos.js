const express = require('express');
const { getDatabase } = require('../database');

const router = express.Router();

function monthRange(year, month) {
  return new Date(year, month, 0).getDate();
}

function generateParcelas(emprestimo) {
  const parcelas = [];
  const dataInicio = new Date(emprestimo.data_inicio + 'T00:00:00');
  for (let i = 0; i < emprestimo.numero_parcelas; i++) {
    let mes = dataInicio.getMonth() + 1 + i;
    let ano = dataInicio.getFullYear();
    while (mes > 12) {
      mes -= 12;
      ano++;
    }
    const competencia = new Date(ano, mes - 1, 1);
    parcelas.push({
      numero: i + 1,
      competencia: competencia.toISOString().split('T')[0],
      valor: emprestimo.valor_total / emprestimo.numero_parcelas,
    });
  }
  return parcelas;
}

// GET /api/emprestimos?empresa_id=X&status=Y
router.get('/', (req, res) => {
  const db = getDatabase();
  const { empresa_id, status } = req.query;
  let sql = `SELECT ec.*, f.nome as funcionario_nome, e.nome as empresa_nome 
             FROM emprestimo_consignado ec 
             JOIN funcionarios f ON ec.funcionario_id = f.id 
             JOIN empresas e ON ec.empresa_id = e.id 
             WHERE 1=1`;
  const params = [];

  if (empresa_id) {
    sql += ` AND ec.empresa_id = ?`;
    params.push(empresa_id);
  }
  if (status) {
    sql += ` AND ec.status = ?`;
    params.push(status);
  }
  sql += ` ORDER BY ec.data_inicio DESC`;

  const emprestimos = db.prepare(sql).all(...params);
  const result = emprestimos.map(emp => ({
    ...emp,
    valor_parcela: emp.numero_parcelas > 0 ? emp.valor_total / emp.numero_parcelas : 0,
    parcelas: generateParcelas(emp),
  }));
  res.json(result);
});

// GET /api/emprestimos/:id
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const emp = db.prepare(
    'SELECT ec.*, f.nome as funcionario_nome, e.nome as empresa_nome FROM emprestimo_consignado ec JOIN funcionarios f ON ec.funcionario_id = f.id JOIN empresas e ON ec.empresa_id = e.id WHERE ec.id = ?'
  ).get(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Empréstimo não encontrado' });
  emp.parcelas = generateParcelas(emp);
  emp.valor_parcela = emp.numero_parcelas > 0 ? emp.valor_total / emp.numero_parcelas : 0;
  res.json(emp);
});

// POST /api/emprestimos
router.post('/', (req, res) => {
  const db = getDatabase();
  const { funcionario_id, empresa_id, valor_total, numero_parcelas, data_inicio, observacoes } = req.body;
  if (!funcionario_id || !empresa_id || !valor_total || !numero_parcelas || !data_inicio) {
    return res.status(400).json({ error: 'funcionario_id, empresa_id, valor_total, numero_parcelas e data_inicio são obrigatórios' });
  }
  const dataInicio = new Date(data_inicio + (data_inicio.length <= 7 ? '-01' : '').split('T')[0] + 'T00:00:00');
  if (data_inicio.length <= 7) {
    // YYYY-MM format
    const parts = data_inicio.split('-');
    dataInicio.setFullYear(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
  }
  dataInicio.setDate(1);
  
  let mesFim = dataInicio.getMonth() + numero_parcelas;
  let anoFim = dataInicio.getFullYear();
  while (mesFim > 12) {
    mesFim -= 12;
    anoFim++;
  }
  const ultimoDia = monthRange(anoFim, mesFim);
  const dataFim = new Date(anoFim, mesFim - 1, ultimoDia);

  const result = db.prepare(
    'INSERT INTO emprestimo_consignado (funcionario_id, empresa_id, valor_total, numero_parcelas, data_inicio, data_fim, observacoes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    funcionario_id, empresa_id, valor_total, numero_parcelas,
    dataInicio.toISOString().split('T')[0],
    dataFim.toISOString().split('T')[0],
    observacoes || '', 'ativo'
  );
  const emp = db.prepare('SELECT * FROM emprestimo_consignado WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(emp);
});

// PUT /api/emprestimos/:id
router.put('/:id', (req, res) => {
  const db = getDatabase();
  const emp = db.prepare('SELECT * FROM emprestimo_consignado WHERE id = ?').get(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Empréstimo não encontrado' });
  const { funcionario_id, empresa_id, valor_total, numero_parcelas, data_inicio, observacoes, status } = req.body;
  
  let dataInicio, dataFim;
  if (data_inicio) {
    dataInicio = new Date(data_inicio + (data_inicio.length <= 7 ? '-01' : '').split('T')[0] + 'T00:00:00');
    if (data_inicio.length <= 7) {
      const parts = data_inicio.split('-');
      dataInicio.setFullYear(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
    }
    dataInicio.setDate(1);
    const numParc = numero_parcelas || emp.numero_parcelas;
    let mesFim = dataInicio.getMonth() + numParc;
    let anoFim = dataInicio.getFullYear();
    while (mesFim > 12) { mesFim -= 12; anoFim++; }
    const ultimoDia = monthRange(anoFim, mesFim);
    dataFim = new Date(anoFim, mesFim - 1, ultimoDia);
  }

  db.prepare(
    `UPDATE emprestimo_consignado SET funcionario_id = ?, empresa_id = ?, valor_total = ?, 
     numero_parcelas = ?, data_inicio = ?, data_fim = ?, observacoes = ?, status = ? WHERE id = ?`
  ).run(
    funcionario_id || emp.funcionario_id,
    empresa_id || emp.empresa_id,
    valor_total !== undefined ? valor_total : emp.valor_total,
    numero_parcelas || emp.numero_parcelas,
    dataInicio ? dataInicio.toISOString().split('T')[0] : emp.data_inicio,
    dataFim ? dataFim.toISOString().split('T')[0] : emp.data_fim,
    observacoes !== undefined ? observacoes : emp.observacoes,
    status || emp.status,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM emprestimo_consignado WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// PATCH /api/emprestimos/:id/finalizar
router.patch('/:id/finalizar', (req, res) => {
  const db = getDatabase();
  const emp = db.prepare('SELECT * FROM emprestimo_consignado WHERE id = ?').get(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Empréstimo não encontrado' });
  db.prepare('UPDATE emprestimo_consignado SET status = ? WHERE id = ?').run('finalizado', req.params.id);
  const updated = db.prepare('SELECT * FROM emprestimo_consignado WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// PATCH /api/emprestimos/:id/restaurar
router.patch('/:id/restaurar', (req, res) => {
  const db = getDatabase();
  const emp = db.prepare('SELECT * FROM emprestimo_consignado WHERE id = ?').get(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Empréstimo não encontrado' });
  db.prepare('UPDATE emprestimo_consignado SET status = ? WHERE id = ?').run('ativo', req.params.id);
  const updated = db.prepare('SELECT * FROM emprestimo_consignado WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/emprestimos/:id (soft-delete: status = 'excluido')
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const emp = db.prepare('SELECT * FROM emprestimo_consignado WHERE id = ?').get(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Empréstimo não encontrado' });
  db.prepare('UPDATE emprestimo_consignado SET status = ? WHERE id = ?').run('excluido', req.params.id);
  res.json({ message: 'Empréstimo excluído com sucesso' });
});

module.exports = router;
