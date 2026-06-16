const express = require('express');
const { getDatabase } = require('../database');

const router = express.Router();

// GET /api/atestados?funcionario_id=X&status=Y&tipo_afastamento=Z
router.get('/', (req, res) => {
  const db = getDatabase();
  const { funcionario_id, status, tipo_afastamento } = req.query;
  let sql = `SELECT a.*, f.nome as funcionario_nome FROM atestados a JOIN funcionarios f ON a.funcionario_id = f.id WHERE 1=1`;
  const params = [];

  if (funcionario_id) {
    sql += ` AND a.funcionario_id = ?`;
    params.push(funcionario_id);
  }
  if (status) {
    sql += ` AND a.status = ?`;
    params.push(status);
  }
  if (tipo_afastamento) {
    sql += ` AND a.tipo_afastamento = ?`;
    params.push(tipo_afastamento);
  }
  sql += ` ORDER BY a.data_inicio DESC`;

  const atestados = db.prepare(sql).all(...params);
  res.json(atestados);
});

// GET /api/atestados/:id
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const at = db.prepare('SELECT a.*, f.nome as funcionario_nome FROM atestados a JOIN funcionarios f ON a.funcionario_id = f.id WHERE a.id = ?').get(req.params.id);
  if (!at) return res.status(404).json({ error: 'Atestado não encontrado' });
  res.json(at);
});

// POST /api/atestados
router.post('/', (req, res) => {
  const db = getDatabase();
  const { funcionario_id, data_inicio, data_fim, cid, diagnostico, dias_previstos, tipo_afastamento, observacoes, inss_afastamento } = req.body;
  if (!funcionario_id || !data_inicio || !data_fim || !dias_previstos) {
    return res.status(400).json({ error: 'funcionario_id, data_inicio, data_fim e dias_previstos são obrigatórios' });
  }
  let tipo = tipo_afastamento;
  if (!tipo) {
    if (dias_previstos > 60) tipo = 'outro';
    else if (dias_previstos > 14) tipo = '60_dias';
    else tipo = '14_dias';
  }
  const result = db.prepare(
    'INSERT INTO atestados (funcionario_id, data_inicio, data_fim, cid, diagnostico, dias_previstos, tipo_afastamento, status, observacoes, inss_afastamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(funcionario_id, data_inicio, data_fim, cid || '', diagnostico || '', dias_previstos, tipo, 'ativo', observacoes || '', inss_afastamento ? 1 : 0);
  const at = db.prepare('SELECT * FROM atestados WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(at);
});

// PUT /api/atestados/:id
router.put('/:id', (req, res) => {
  const db = getDatabase();
  const at = db.prepare('SELECT * FROM atestados WHERE id = ?').get(req.params.id);
  if (!at) return res.status(404).json({ error: 'Atestado não encontrado' });
  const { funcionario_id, data_inicio, data_fim, cid, diagnostico, dias_previstos, tipo_afastamento, observacoes, inss_afastamento } = req.body;
  db.prepare(
    'UPDATE atestados SET funcionario_id = ?, data_inicio = ?, data_fim = ?, cid = ?, diagnostico = ?, dias_previstos = ?, tipo_afastamento = ?, observacoes = ?, inss_afastamento = ? WHERE id = ?'
  ).run(
    funcionario_id || at.funcionario_id,
    data_inicio || at.data_inicio,
    data_fim || at.data_fim,
    cid !== undefined ? cid : at.cid,
    diagnostico !== undefined ? diagnostico : at.diagnostico,
    dias_previstos !== undefined ? dias_previstos : at.dias_previstos,
    tipo_afastamento || at.tipo_afastamento,
    observacoes !== undefined ? observacoes : at.observacoes,
    inss_afastamento !== undefined ? (inss_afastamento ? 1 : 0) : at.inss_afastamento,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM atestados WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// PATCH /api/atestados/:id/status/:novo_status
router.patch('/:id/status/:novo_status', (req, res) => {
  const db = getDatabase();
  const { id, novo_status } = req.params;
  if (!['ativo', 'encerrado'].includes(novo_status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }
  const at = db.prepare('SELECT * FROM atestados WHERE id = ?').get(id);
  if (!at) return res.status(404).json({ error: 'Atestado não encontrado' });
  db.prepare('UPDATE atestados SET status = ? WHERE id = ?').run(novo_status, id);
  const updated = db.prepare('SELECT * FROM atestados WHERE id = ?').get(id);
  res.json(updated);
});

// DELETE /api/atestados/:id
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const at = db.prepare('SELECT * FROM atestados WHERE id = ?').get(req.params.id);
  if (!at) return res.status(404).json({ error: 'Atestado não encontrado' });
  db.prepare('DELETE FROM atestados WHERE id = ?').run(req.params.id);
  res.json({ message: 'Atestado excluído com sucesso' });
});

module.exports = router;
