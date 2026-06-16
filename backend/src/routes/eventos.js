const express = require('express');
const { getDatabase } = require('../database');

const router = express.Router();

function dateAddDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// GET /api/eventos?empresa_id=X
router.get('/', (req, res) => {
  const db = getDatabase();
  const { empresa_id } = req.query;
  const eventos = [];

  // Base query for funcionarios
  let funcs;
  if (empresa_id) {
    funcs = db.prepare('SELECT * FROM funcionarios WHERE empresa_id = ?').all(empresa_id);
  } else {
    funcs = db.prepare('SELECT * FROM funcionarios').all();
  }

  const funcIds = funcs.map(f => f.id);
  if (funcIds.length === 0) return res.json([]);

  // Helper to build IN clause
  const placeholders = funcIds.map(() => '?').join(',');

  // ─── Exames ─────────────────────────────────────────────────────
  let exames;
  if (empresa_id) {
    exames = db.prepare(
      `SELECT ex.*, f.nome as funcionario_nome FROM exames ex 
       JOIN funcionarios f ON ex.funcionario_id = f.id 
       WHERE f.empresa_id = ?`
    ).all(empresa_id);
  } else {
    exames = db.prepare(
      `SELECT ex.*, f.nome as funcionario_nome FROM exames ex 
       JOIN funcionarios f ON ex.funcionario_id = f.id`
    ).all();
  }

  for (const ex of exames) {
    const cores = { ok: '#0d6efd', pendente: '#ffc107', vencido: '#dc3545' };
    const cor = cores[ex.status] || '#6c757d';
    eventos.push({
      id: `exame-${ex.id}`,
      title: `📋 ${ex.funcionario_nome} - ${ex.tipo}`,
      start: ex.data_realizacao,
      end: dateAddDays(ex.data_realizacao, 1),
      backgroundColor: cor,
      borderColor: cor,
      textColor: '#fff',
      extendedProps: {
        tipo: 'exame',
        exame_id: ex.id,
        funcionario: ex.funcionario_nome,
        status: ex.status,
      },
    });
  }

  // ─── Férias ──────────────────────────────────────────────────────
  let ferias;
  if (empresa_id) {
    ferias = db.prepare(
      `SELECT fv.*, f.nome as funcionario_nome FROM ferias fv 
       JOIN funcionarios f ON fv.funcionario_id = f.id 
       WHERE f.empresa_id = ?`
    ).all(empresa_id);
  } else {
    ferias = db.prepare(
      `SELECT fv.*, f.nome as funcionario_nome FROM ferias fv 
       JOIN funcionarios f ON fv.funcionario_id = f.id`
    ).all();
  }

  for (const fv of ferias) {
    eventos.push({
      id: `ferias-${fv.id}`,
      title: `🏖️ ${fv.funcionario_nome} - Férias`,
      start: fv.data_inicio,
      end: dateAddDays(fv.data_fim, 1),
      backgroundColor: '#198754',
      borderColor: '#198754',
      textColor: '#fff',
      extendedProps: {
        tipo: 'ferias',
        ferias_id: fv.id,
        funcionario: fv.funcionario_nome,
        status: fv.status,
      },
    });
  }

  // ─── Atestados ───────────────────────────────────────────────────
  let atestados;
  if (empresa_id) {
    atestados = db.prepare(
      `SELECT a.*, f.nome as funcionario_nome FROM atestados a 
       JOIN funcionarios f ON a.funcionario_id = f.id 
       WHERE f.empresa_id = ?`
    ).all(empresa_id);
  } else {
    atestados = db.prepare(
      `SELECT a.*, f.nome as funcionario_nome FROM atestados a 
       JOIN funcionarios f ON a.funcionario_id = f.id`
    ).all();
  }

  for (const at of atestados) {
    eventos.push({
      id: `atestado-${at.id}`,
      title: `🩺 ${at.funcionario_nome} - Atestado`,
      start: at.data_inicio,
      end: dateAddDays(at.data_fim, 1),
      backgroundColor: '#dc3545',
      borderColor: '#dc3545',
      textColor: '#fff',
      extendedProps: {
        tipo: 'atestado',
        atestado_id: at.id,
        funcionario: at.funcionario_nome,
        dias: at.dias_previstos,
      },
    });
  }

  // ─── Admissões + Experiências ────────────────────────────────────
  for (const func of funcs) {
    eventos.push({
      id: `admissao-${func.id}`,
      title: `📅 Admissão: ${func.nome}`,
      start: func.data_admissao,
      end: dateAddDays(func.data_admissao, 1),
      backgroundColor: '#6f42c1',
      borderColor: '#6f42c1',
      textColor: '#fff',
      extendedProps: {
        tipo: 'admissao',
        funcionario_id: func.id,
        funcionario: func.nome,
      },
    });

    // Fim experiência 30 dias
    const dataExp30 = dateAddDays(func.data_admissao, 30);
    eventos.push({
      id: `experiencia30-${func.id}`,
      title: `⏱️ Fim Experiência (30d): ${func.nome}`,
      start: dataExp30,
      end: dateAddDays(dataExp30, 1),
      backgroundColor: '#fd7e14',
      borderColor: '#fd7e14',
      textColor: '#fff',
      extendedProps: {
        tipo: 'experiencia30',
        funcionario_id: func.id,
        funcionario: func.nome,
      },
    });

    // Fim experiência 90 dias
    const dataExp90 = dateAddDays(func.data_admissao, 90);
    eventos.push({
      id: `experiencia90-${func.id}`,
      title: `⏱️ Fim Experiência (90d): ${func.nome}`,
      start: dataExp90,
      end: dateAddDays(dataExp90, 1),
      backgroundColor: '#e83e8c',
      borderColor: '#e83e8c',
      textColor: '#fff',
      extendedProps: {
        tipo: 'experiencia90',
        funcionario_id: func.id,
        funcionario: func.nome,
      },
    });
  }

  res.json(eventos);
});

// GET /api/evento_detalhe?tipo=X&id=Y
router.get('/detalhe', (req, res) => {
  const db = getDatabase();
  const { tipo, id } = req.query;

  if (tipo === 'exame') {
    const ex = db.prepare('SELECT ex.*, f.nome as funcionario_nome FROM exames ex JOIN funcionarios f ON ex.funcionario_id = f.id WHERE ex.id = ?').get(id);
    if (!ex) return res.status(404).json({ error: 'Exame não encontrado' });
    return res.json({
      tipo: 'Exame',
      funcionario: ex.funcionario_nome,
      tipo_exame: ex.tipo,
      data_realizacao: ex.data_realizacao,
      data_validade: ex.data_validade || '-',
      status: ex.status,
      observacoes: ex.observacoes || '-',
    });
  }

  if (tipo === 'ferias') {
    const fv = db.prepare('SELECT fv.*, f.nome as funcionario_nome FROM ferias fv JOIN funcionarios f ON fv.funcionario_id = f.id WHERE fv.id = ?').get(id);
    if (!fv) return res.status(404).json({ error: 'Férias não encontradas' });
    return res.json({
      tipo: 'Férias',
      funcionario: fv.funcionario_nome,
      inicio: fv.data_inicio,
      fim: fv.data_fim,
      periodo: fv.periodo_aquisitivo || '-',
      dias: fv.dias_solicitados,
      status: fv.status,
    });
  }

  if (tipo === 'atestado') {
    const at = db.prepare('SELECT a.*, f.nome as funcionario_nome FROM atestados a JOIN funcionarios f ON a.funcionario_id = f.id WHERE a.id = ?').get(id);
    if (!at) return res.status(404).json({ error: 'Atestado não encontrado' });
    return res.json({
      tipo: 'Atestado',
      funcionario: at.funcionario_nome,
      inicio: at.data_inicio,
      fim: at.data_fim,
      cid: at.cid || '-',
      diagnostico: at.diagnostico || '-',
      dias: at.dias_previstos,
      tipo_afastamento: at.tipo_afastamento,
      inss: at.inss_afastamento ? 'Sim' : 'Não',
      status: at.status,
    });
  }

  if (tipo === 'admissao') {
    const func = db.prepare('SELECT f.*, e.nome as empresa_nome FROM funcionarios f JOIN empresas e ON f.empresa_id = e.id WHERE f.id = ?').get(id);
    if (!func) return res.status(404).json({ error: 'Funcionário não encontrado' });
    return res.json({
      tipo: '📅 Admissão',
      funcionario: func.nome,
      empresa: func.empresa_nome,
      cargo: func.cargo,
      funcao: func.funcao || '-',
      data_admissao: func.data_admissao,
      salario: `R$ ${func.salario}`,
    });
  }

  if (tipo === 'experiencia30') {
    const func = db.prepare('SELECT f.*, e.nome as empresa_nome FROM funcionarios f JOIN empresas e ON f.empresa_id = e.id WHERE f.id = ?').get(id);
    if (!func) return res.status(404).json({ error: 'Funcionário não encontrado' });
    const dataExp30 = dateAddDays(func.data_admissao, 30);
    return res.json({
      tipo: '⏱️ Fim Experiência (30 dias)',
      funcionario: func.nome,
      empresa: func.empresa_nome,
      data_admissao: func.data_admissao,
      fim_experiencia_30d: dataExp30,
    });
  }

  if (tipo === 'experiencia90') {
    const func = db.prepare('SELECT f.*, e.nome as empresa_nome FROM funcionarios f JOIN empresas e ON f.empresa_id = e.id WHERE f.id = ?').get(id);
    if (!func) return res.status(404).json({ error: 'Funcionário não encontrado' });
    const dataExp90 = dateAddDays(func.data_admissao, 90);
    return res.json({
      tipo: '⏱️ Fim Experiência (90 dias)',
      funcionario: func.nome,
      empresa: func.empresa_nome,
      data_admissao: func.data_admissao,
      fim_experiencia_90d: dataExp90,
    });
  }

  res.json({});
});

module.exports = router;
