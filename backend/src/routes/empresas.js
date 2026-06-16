const express = require('express');
const { getDatabase } = require('../database');

const router = express.Router();

// GET /api/empresas
router.get('/', (req, res) => {
  const db = getDatabase();
  const empresas = db.prepare('SELECT * FROM empresas ORDER BY nome').all();
  res.json(empresas);
});

// GET /api/empresas/:id
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ?').get(req.params.id);
  if (!empresa) return res.status(404).json({ error: 'Empresa não encontrada' });
  res.json(empresa);
});

// POST /api/empresas
router.post('/', (req, res) => {
  const db = getDatabase();
  const { nome, cnpj, endereco, telefone } = req.body;
  if (!nome || !cnpj) return res.status(400).json({ error: 'Nome e CNPJ são obrigatórios' });
  const result = db.prepare('INSERT INTO empresas (nome, cnpj, endereco, telefone) VALUES (?, ?, ?, ?)').run(
    nome, cnpj, endereco || '', telefone || ''
  );
  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(empresa);
});

// PUT /api/empresas/:id
router.put('/:id', (req, res) => {
  const db = getDatabase();
  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ?').get(req.params.id);
  if (!empresa) return res.status(404).json({ error: 'Empresa não encontrada' });
  const { nome, cnpj, endereco, telefone } = req.body;
  db.prepare('UPDATE empresas SET nome = ?, cnpj = ?, endereco = ?, telefone = ? WHERE id = ?').run(
    nome || empresa.nome,
    cnpj || empresa.cnpj,
    endereco !== undefined ? endereco : empresa.endereco,
    telefone !== undefined ? telefone : empresa.telefone,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM empresas WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/empresas/:id
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const empresa = db.prepare('SELECT * FROM empresas WHERE id = ?').get(req.params.id);
  if (!empresa) return res.status(404).json({ error: 'Empresa não encontrada' });
  db.prepare('DELETE FROM empresas WHERE id = ?').run(req.params.id);
  res.json({ message: 'Empresa excluída com sucesso' });
});

module.exports = router;
