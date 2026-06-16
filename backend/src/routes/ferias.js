const express = require('express');
const { getDatabase } = require('../database');

const router = express.Router();

// GET /api/ferias?funcionario_id=X&status=Y
router.get('/', (req, res) => {
  const db = getDatabase();
  const { funcionario_id, status } = req.query;
  let sql = `SELECT fv.*, f.nome as funcionario_nome FROM ferias fv JOIN funcionarios f ON fv.funcionario_id = f.id WHERE 1=1`;
  const params = [];

  if (funcionario_id) {
    sql += ` AND fv.funcionario_id = ?`;
    params.push(funcionario_id);
  }
  if (status) {
    sql += ` AND fv.status = ?`;
    params.push(status);
  }
  sql += ` ORDER BY fv.data_inicio DESC`;

  const ferias = db.prepare(sql).all(...params);
  res.json(ferias);
});

// GET /api/ferias/:id
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const fv = db.prepare('SELECT fv.*, f.nome as funcionario_nome FROM ferias fv JOIN funcionarios f ON fv.funcionario_id = f.id WHERE fv.id = ?').get(req.params.id);
  if (!fv) return res.status(404).json({ error: 'Férias não encontradas' });
  res.json(fv);
});

// POST /api/ferias
router.post('/', (req, res) => {
  const db = getDatabase();
  const { funcionario_id, data_inicio, data_fim, periodo_aquisitivo, dias_solicitados, observacoes } = req.body;
  if (!funcionario_id || !data_inicio || !data_fim || !dias_solicitados) {
    return res.status(400).json({ error: 'funcionario_id, data_inicio, data_fim e dias_solicitados são obrigatórios' });
  }
  const diasRestantes = Math.max(0, 30 - dias_solicitados);
  const result = db.prepare(
    'INSERT INTO ferias (funcionario_id, data_inicio, data_fim, periodo_aquisitivo, dias_solicitados, dias_restantes, status, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(funcionario_id, data_inicio, data_fim, periodo_aquisitivo || '', dias_solicitados, diasRestantes, 'agendado', observacoes || '');
  const fv = db.prepare('SELECT * FROM ferias WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(fv);
});

// PUT /api/ferias/:id
router.put('/:id', (req, res) => {
  const db = getDatabase();
  const fv = db.prepare('SELECT * FROM ferias WHERE id = ?').get(req.params.id);
  if (!fv) return res.status(404).json({ error: 'Férias não encontradas' });
  const { funcionario_id, data_inicio, data_fim, periodo_aquisitivo, dias_solicitados, status, observacoes } = req.body;
  const diasSol = dias_solicitados !== undefined ? dias_solicitados : fv.dias_solicitados;
  const diasRest = Math.max(0, 30 - diasSol);
  db.prepare(
    `UPDATE ferias SET funcionario_id = ?, data_inicio = ?, data_fim = ?, periodo_aquisitivo = ?, 
     dias_solicitados = ?, dias_restantes = ?, status = ?, observacoes = ? WHERE id = ?`
  ).run(
    funcionario_id || fv.funcionario_id,
    data_inicio || fv.data_inicio,
    data_fim || fv.data_fim,
    periodo_aquisitivo !== undefined ? periodo_aquisitivo : fv.periodo_aquisitivo,
    diasSol,
    diasRest,
    status || fv.status,
    observacoes !== undefined ? observacoes : fv.observacoes,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM ferias WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// PATCH /api/ferias/:id/status/:novo_status
router.patch('/:id/status/:novo_status', (req, res) => {
  const db = getDatabase();
  const { id, novo_status } = req.params;
  const validos = ['agendado', 'em_andamento', 'concluido', 'cancelado'];
  if (!validos.includes(novo_status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }
  const fv = db.prepare('SELECT * FROM ferias WHERE id = ?').get(id);
  if (!fv) return res.status(404).json({ error: 'Férias não encontradas' });
  db.prepare('UPDATE ferias SET status = ? WHERE id = ?').run(novo_status, id);
  const updated = db.prepare('SELECT * FROM ferias WHERE id = ?').get(id);
  res.json(updated);
});

// DELETE /api/ferias/:id
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const fv = db.prepare('SELECT * FROM ferias WHERE id = ?').get(req.params.id);
  if (!fv) return res.status(404).json({ error: 'Férias não encontradas' });
  db.prepare('DELETE FROM ferias WHERE id = ?').run(req.params.id);
  res.json({ message: 'Férias excluídas com sucesso' });
});

module.exports = router;
