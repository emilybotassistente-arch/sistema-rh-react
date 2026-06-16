const express = require('express');
const { getDatabase } = require('../database');

const router = express.Router();

// GET /api/exames?funcionario_id=X&status=Y
router.get('/', (req, res) => {
  const db = getDatabase();
  const { funcionario_id, status } = req.query;
  let sql = `SELECT ex.*, f.nome as funcionario_nome FROM exames ex JOIN funcionarios f ON ex.funcionario_id = f.id WHERE 1=1`;
  const params = [];

  if (funcionario_id) {
    sql += ` AND ex.funcionario_id = ?`;
    params.push(funcionario_id);
  }
  if (status) {
    sql += ` AND ex.status = ?`;
    params.push(status);
  }
  sql += ` ORDER BY ex.data_realizacao DESC`;

  const exames = db.prepare(sql).all(...params);
  res.json(exames);
});

// GET /api/exames/:id
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const exame = db.prepare('SELECT ex.*, f.nome as funcionario_nome FROM exames ex JOIN funcionarios f ON ex.funcionario_id = f.id WHERE ex.id = ?').get(req.params.id);
  if (!exame) return res.status(404).json({ error: 'Exame não encontrado' });
  res.json(exame);
});

// POST /api/exames
router.post('/', (req, res) => {
  const db = getDatabase();
  const { funcionario_id, tipo, data_realizacao, data_validade, status, observacoes } = req.body;
  if (!funcionario_id || !tipo || !data_realizacao) {
    return res.status(400).json({ error: 'funcionario_id, tipo e data_realizacao são obrigatórios' });
  }
  const result = db.prepare(
    'INSERT INTO exames (funcionario_id, tipo, data_realizacao, data_validade, status, observacoes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(funcionario_id, tipo, data_realizacao, data_validade || null, status || 'pendente', observacoes || '');
  const exame = db.prepare('SELECT * FROM exames WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(exame);
});

// PUT /api/exames/:id
router.put('/:id', (req, res) => {
  const db = getDatabase();
  const exame = db.prepare('SELECT * FROM exames WHERE id = ?').get(req.params.id);
  if (!exame) return res.status(404).json({ error: 'Exame não encontrado' });
  const { funcionario_id, tipo, data_realizacao, data_validade, status, observacoes } = req.body;
  db.prepare(
    'UPDATE exames SET funcionario_id = ?, tipo = ?, data_realizacao = ?, data_validade = ?, status = ?, observacoes = ? WHERE id = ?'
  ).run(
    funcionario_id || exame.funcionario_id,
    tipo || exame.tipo,
    data_realizacao || exame.data_realizacao,
    data_validade !== undefined ? data_validade : exame.data_validade,
    status || exame.status,
    observacoes !== undefined ? observacoes : exame.observacoes,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM exames WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/exames/:id
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const exame = db.prepare('SELECT * FROM exames WHERE id = ?').get(req.params.id);
  if (!exame) return res.status(404).json({ error: 'Exame não encontrado' });
  db.prepare('DELETE FROM exames WHERE id = ?').run(req.params.id);
  res.json({ message: 'Exame excluído com sucesso' });
});

module.exports = router;
