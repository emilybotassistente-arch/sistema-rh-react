const express = require('express');
const { getDatabase } = require('../database');

const router = express.Router();

// GET /api/cargos?empresa_id=X
router.get('/', (req, res) => {
  const db = getDatabase();
  const { empresa_id } = req.query;
  let cargos;
  if (empresa_id) {
    cargos = db.prepare('SELECT * FROM cargos WHERE empresa_id = ? ORDER BY nome').all(empresa_id);
  } else {
    cargos = db.prepare('SELECT c.*, e.nome as empresa_nome FROM cargos c JOIN empresas e ON c.empresa_id = e.id ORDER BY e.nome, c.nome').all();
  }
  res.json(cargos);
});

// GET /api/cargos/:id
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const cargo = db.prepare('SELECT c.*, e.nome as empresa_nome FROM cargos c JOIN empresas e ON c.empresa_id = e.id WHERE c.id = ?').get(req.params.id);
  if (!cargo) return res.status(404).json({ error: 'Cargo não encontrado' });
  res.json(cargo);
});

// POST /api/cargos
router.post('/', (req, res) => {
  const db = getDatabase();
  const { nome, empresa_id } = req.body;
  if (!nome || !empresa_id) return res.status(400).json({ error: 'Nome e empresa_id são obrigatórios' });
  // Check duplicate
  const existente = db.prepare('SELECT id FROM cargos WHERE empresa_id = ? AND nome = ?').get(empresa_id, nome);
  if (existente) return res.status(409).json({ error: 'Este cargo já existe para esta empresa' });
  const result = db.prepare('INSERT INTO cargos (empresa_id, nome) VALUES (?, ?)').run(empresa_id, nome);
  const cargo = db.prepare('SELECT * FROM cargos WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(cargo);
});

// PUT /api/cargos/:id
router.put('/:id', (req, res) => {
  const db = getDatabase();
  const cargo = db.prepare('SELECT * FROM cargos WHERE id = ?').get(req.params.id);
  if (!cargo) return res.status(404).json({ error: 'Cargo não encontrado' });
  const { nome, empresa_id } = req.body;
  db.prepare('UPDATE cargos SET nome = ?, empresa_id = ? WHERE id = ?').run(
    nome || cargo.nome,
    empresa_id || cargo.empresa_id,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM cargos WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/cargos/:id
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const cargo = db.prepare('SELECT * FROM cargos WHERE id = ?').get(req.params.id);
  if (!cargo) return res.status(404).json({ error: 'Cargo não encontrado' });
  db.prepare('DELETE FROM cargos WHERE id = ?').run(req.params.id);
  res.json({ message: 'Cargo excluído com sucesso' });
});

module.exports = router;
