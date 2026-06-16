const express = require('express');
const { getDatabase } = require('../database');

const router = express.Router();

// GET /api/pisos?empresa_id=X
router.get('/', (req, res) => {
  const db = getDatabase();
  const { empresa_id } = req.query;

  if (empresa_id) {
    const pisos = db.prepare(
      'SELECT p.*, e.nome as empresa_nome FROM piso_cargo p JOIN empresas e ON p.empresa_id = e.id WHERE p.empresa_id = ? ORDER BY p.cargo'
    ).all(empresa_id);
    return res.json(pisos);
  }

  const pisos = db.prepare(
    'SELECT p.*, e.nome as empresa_nome FROM piso_cargo p JOIN empresas e ON p.empresa_id = e.id ORDER BY e.nome, p.cargo'
  ).all();
  res.json(pisos);
});

// POST /api/pisos (bulk save)
router.post('/', (req, res) => {
  const db = getDatabase();
  const { empresa_id, pisos } = req.body;
  if (!empresa_id || !pisos) {
    return res.status(400).json({ error: 'empresa_id e pisos são obrigatórios' });
  }

  const insertPiso = db.prepare('INSERT INTO piso_cargo (empresa_id, cargo, valor_piso) VALUES (?, ?, ?)');
  const updatePiso = db.prepare('UPDATE piso_cargo SET valor_piso = ? WHERE id = ?');

  const transaction = db.transaction(() => {
    for (const item of pisos) {
      if (item.valor_piso) {
        const existente = db.prepare('SELECT * FROM piso_cargo WHERE empresa_id = ? AND cargo = ?').get(empresa_id, item.cargo);
        if (existente) {
          updatePiso.run(item.valor_piso, existente.id);
        } else {
          insertPiso.run(empresa_id, item.cargo, item.valor_piso);
        }
      }
    }
  });

  transaction();
  res.json({ message: 'Pisos salvos com sucesso!' });
});

// GET /api/pisos/:id
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const piso = db.prepare('SELECT * FROM piso_cargo WHERE id = ?').get(req.params.id);
  if (!piso) return res.status(404).json({ error: 'Piso não encontrado' });
  res.json(piso);
});

// DELETE /api/pisos/:id
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const piso = db.prepare('SELECT * FROM piso_cargo WHERE id = ?').get(req.params.id);
  if (!piso) return res.status(404).json({ error: 'Piso não encontrado' });
  db.prepare('DELETE FROM piso_cargo WHERE id = ?').run(req.params.id);
  res.json({ message: 'Piso excluído com sucesso' });
});

module.exports = router;
