const express = require('express');
const cors = require('cors');
const { createTables } = require('./database');
const { seedData } = require('./seed');

const empresasRouter = require('./routes/empresas');
const cargosRouter = require('./routes/cargos');
const funcionariosRouter = require('./routes/funcionarios');
const examesRouter = require('./routes/exames');
const feriasRouter = require('./routes/ferias');
const atestadosRouter = require('./routes/atestados');
const emprestimosRouter = require('./routes/emprestimos');
const valerefeicaoRouter = require('./routes/valerefeicao');
const pisosRouter = require('./routes/pisos');
const eventosRouter = require('./routes/eventos');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create tables and seed data
createTables();
seedData();

// Routes
app.use('/api/empresas', empresasRouter);
app.use('/api/cargos', cargosRouter);
app.use('/api/funcionarios', funcionariosRouter);
app.use('/api/exames', examesRouter);
app.use('/api/ferias', feriasRouter);
app.use('/api/atestados', atestadosRouter);
app.use('/api/emprestimos', emprestimosRouter);
app.use('/api/valerefeicao', valerefeicaoRouter);
app.use('/api/pisos', pisosRouter);
app.use('/api/eventos', eventosRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', data_base: '2026-06-15' });
});

app.listen(PORT, () => {
  console.log(`[Server] Sistema RH Backend rodando em http://localhost:${PORT}`);
  console.log(`[Server] API endpoints disponíveis em /api/...`);
});

module.exports = app;
