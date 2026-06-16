const { getDatabase, createTables } = require('./database');

const DATA_ATUAL = new Date('2026-06-15');

const CARGO_FUNCAO = [
  ['Analista de RH', 'Responsável pelo recrutamento, seleção, treinamento e desenvolvimento de pessoas.'],
  ['Analista de DP', 'Responsável pelo departamento pessoal, folha de pagamento e obrigações trabalhistas.'],
  ['Analista Financeiro', 'Responsável pela análise financeira, fluxo de caixa e relatórios gerenciais.'],
  ['Analista de TI', 'Responsável pela manutenção de sistemas, infraestrutura e suporte técnico.'],
  ['Auxiliar Administrativo', 'Apoio nas atividades administrativas, organização de documentos e arquivos.'],
  ['Coordenador de RH', 'Coordenação das atividades de RH, implementação de políticas e gestão de equipe.'],
  ['Diretor de Operações', 'Gestão estratégica das operações da empresa.'],
  ['Estagiário de RH', 'Apoio nas rotinas de RH, arquivo de documentos e atendimento a funcionários.'],
  ['Gerente Comercial', 'Gestão de equipe comercial, metas de vendas e relacionamento com clientes.'],
  ['Recepcionista', 'Atendimento telefônico e presencial, recepção de visitantes.'],
  ['Secretária', 'Agenda, organização de reuniões e suporte à diretoria.'],
  ['Técnico de Segurança do Trabalho', 'Inspeções, treinamentos e elaboração de documentos de segurança.'],
  ['Advogado Trabalhista', 'Assessoria jurídica em questões trabalhistas e previdenciárias.'],
  ['Contador', 'Escrituração contábil, apuração de impostos e obrigações acessórias.'],
  ['Analista de Marketing', 'Gestão de redes sociais, campanhas e comunicação institucional.'],
];

const NOMES_FUNC = [
  'Ana Silva', 'Bruno Costa', 'Carla Oliveira', 'Daniel Santos', 'Eduarda Lima',
  'Felipe Souza', 'Gabriela Pereira', 'Henrique Almeida', 'Isabela Rocha', 'João Martins',
  'Karen Dias', 'Lucas Barbosa', 'Mariana Teixeira', 'Nathan Cardoso', 'Olivia Ribeiro',
  'Paulo Freitas', 'Quintino Gomes', 'Rafaela Campos', 'Samuel Azevedo', 'Tatiana Moreira',
  'Ulysses Braga', 'Valéria Peixoto', 'Wagner Nunes', 'Xavier Matos', 'Yasmin Araujo',
  'Adriano Faria', 'Bianca Castro', 'Caio Mendes', 'Débora Cunha', 'Erick Vargas',
  'Fernanda Lopes', 'Gabriel Assis', 'Heloísa Pires', 'Igor Cavalcanti', 'Juliana Nascimento',
  'Kevin Barbosa', 'Larissa Melo', 'Marcelo Duarte', 'Natália Fonseca', 'Otávio Correia',
  'Patrícia Barros', 'Ronaldo Medeiros', 'Sabrina Cardoso', 'Thiago Diniz', 'Ursula Evangelista',
  'Victor Hugo', 'Wanessa Brito', 'Yuri Cavalcante', 'Zélia Monteiro', 'Amanda Furtado',
];

// Simple seeded random (Python's random seed 42 produces specific sequence)
// We replicate the Python random module behavior with a simple LCG seeded at 42
function createRng(seed) {
  let s = seed;
  return {
    random: function() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    },
    randint: function(min, max) {
      return Math.floor(this.random() * (max - min + 1)) + min;
    },
    choice: function(arr) {
      return arr[Math.floor(this.random() * arr.length)];
    },
    uniform: function(min, max) {
      return min + this.random() * (max - min);
    },
    round: function(v, decimals) {
      const factor = Math.pow(10, decimals);
      return Math.round(v * factor) / factor;
    }
  };
}

function dateAddDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function dateToStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function monthRange(year, month) {
  return new Date(year, month, 0).getDate();
}

function seedData() {
  const db = getDatabase();
  createTables();

  // Check if already seeded
  const existing = db.prepare('SELECT COUNT(*) as count FROM empresas').get();
  if (existing.count > 0) {
    console.log('[Seed] Dados já existentes. Pulando seed.');
    return;
  }

  const rng = createRng(42);

  // ─── Empresas ───────────────────────────────────────────────────────
  const empresasData = [
    { nome: 'Tech Solutions Ltda', cnpj: '11.111.111/0001-01', endereco: 'Av. Paulista, 1000, São Paulo - SP', telefone: '(11) 1111-1111' },
    { nome: 'Comércio Digital S.A.', cnpj: '22.222.222/0001-02', endereco: 'Rua Augusta, 500, São Paulo - SP', telefone: '(11) 2222-2222' },
    { nome: 'Indústria Nacional Ltda', cnpj: '33.333.333/0001-03', endereco: 'Av. Brasil, 2000, Rio de Janeiro - RJ', telefone: '(21) 3333-3333' },
    { nome: 'Serviços Gerais Eireli', cnpj: '44.444.444/0001-04', endereco: 'Rua das Flores, 300, Belo Horizonte - MG', telefone: '(31) 4444-4444' },
    { nome: 'Agropecuária Verde Ltda', cnpj: '55.555.555/0001-05', endereco: 'Rodovia BR-101, km 50, Vitória - ES', telefone: '(27) 5555-5555' },
  ];

  const insertEmpresa = db.prepare('INSERT INTO empresas (nome, cnpj, endereco, telefone) VALUES (?, ?, ?, ?)');
  const empresaIds = [];
  for (const e of empresasData) {
    const result = insertEmpresa.run(e.nome, e.cnpj, e.endereco, e.telefone);
    empresaIds.push(result.lastInsertRowid);
  }
  console.log('[Seed] Criadas: 5 empresas.');

  // ─── Funcionários (50) ──────────────────────────────────────────────
  const insertFunc = db.prepare(
    'INSERT INTO funcionarios (nome, cargo, funcao, empresa_id, data_admissao, salario, piso_salarial, ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const funcIds = [];

  for (let i = 0; i < 50; i++) {
    const empId = empresaIds[i % 5];
    const [cargo, funcao] = CARGO_FUNCAO[i % CARGO_FUNCAO.length];
    const diasAtras = rng.randint(30, 1500);
    const dataAdm = dateAddDays(DATA_ATUAL, -diasAtras);
    const salario = rng.randint(3000, 15000);
    let piso = null;
    if (i % 4 === 0) {
      piso = rng.choice([1512, 1800, 2000]);
    }
    const result = insertFunc.run(
      NOMES_FUNC[i],
      cargo,
      funcao,
      empId,
      dateToStr(dataAdm),
      salario,
      piso,
      1
    );
    funcIds.push(result.lastInsertRowid);
  }
  console.log('[Seed] Criados: 50 funcionários.');

  // ─── Exames (~94) ───────────────────────────────────────────────────
  const tiposExame = ['Admissional', 'Periódico', 'Demissional'];
  const insertExame = db.prepare(
    'INSERT INTO exames (funcionario_id, tipo, data_realizacao, data_validade, status, observacoes) VALUES (?, ?, ?, ?, ?, ?)'
  );

  for (let i = 0; i < 94; i++) {
    const funcId = funcIds[i % 50];
    const tipo = rng.choice(tiposExame);
    const diasReal = rng.randint(-200, 100);
    const dataReal = dateAddDays(DATA_ATUAL, diasReal);
    const dataVal = dateAddDays(dataReal, 365);
    const status = rng.choice(['ok', 'ok', 'pendente', 'vencido']);
    const obs = rng.random() > 0.3 ? '' : 'Exame sem alterações.';
    insertExame.run(funcId, tipo, dateToStr(dataReal), dateToStr(dataVal), status, obs);
  }
  console.log('[Seed] Criados: 94 exames.');

  // ─── Férias (12) ────────────────────────────────────────────────────
  const feriasStatus = ['agendado', 'concluido', 'concluido', 'em_andamento', 'agendado', 'cancelado',
                         'agendado', 'concluido', 'agendado', 'concluido', 'agendado', 'agendado'];
  const insertFerias = db.prepare(
    'INSERT INTO ferias (funcionario_id, data_inicio, data_fim, periodo_aquisitivo, dias_solicitados, dias_restantes, status, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  for (let i = 0; i < 12; i++) {
    const funcId = funcIds[i % 50];
    const diasRest = rng.choice([30, 25, 20, 15, 10, 5]);
    const diasSol = 30 - diasRest;
    const diasOffset = rng.randint(-180, 180);
    const inicio = dateAddDays(DATA_ATUAL, diasOffset);
    const fim = dateAddDays(inicio, diasSol);
    const anoIni = rng.randint(2023, 2025);
    const anoFim = rng.randint(2024, 2026);
    const periodo = `${anoIni}-${anoFim}`;
    insertFerias.run(funcId, dateToStr(inicio), dateToStr(fim), periodo, diasSol, diasRest, feriasStatus[i], '');
  }
  console.log('[Seed] Criadas: 12 férias.');

  // ─── Atestados (7) ──────────────────────────────────────────────────
  const cids = ['J00', 'J02', 'M54', 'R51', 'A09', 'N39', 'S93'];
  const diags = ['Infecção viral', 'Lombalgia', 'Cefaleia', 'Gastroenterite', 'Infecção urinária', 'Entorse'];
  const insertAtestado = db.prepare(
    'INSERT INTO atestados (funcionario_id, data_inicio, data_fim, cid, diagnostico, dias_previstos, tipo_afastamento, status, observacoes, inss_afastamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  for (let i = 0; i < 7; i++) {
    const funcId = funcIds[i % 50];
    const diasPrev = rng.choice([5, 7, 10, 14, 15, 60, 30]);
    let tipo = '14_dias';
    if (diasPrev > 14 && diasPrev <= 60) tipo = '60_dias';
    else if (diasPrev > 60) tipo = 'outro';
    const diasOffset = rng.randint(-60, 30);
    const inicio = dateAddDays(DATA_ATUAL, diasOffset);
    const fim = dateAddDays(inicio, diasPrev);
    const ativo = DATA_ATUAL <= dateAddDays(inicio, diasPrev) && diasPrev > 5;
    insertAtestado.run(
      funcId,
      dateToStr(inicio),
      dateToStr(fim),
      rng.choice(cids),
      rng.choice(diags),
      diasPrev,
      tipo,
      ativo ? 'ativo' : 'encerrado',
      '',
      diasPrev >= 15 ? 1 : 0
    );
  }
  console.log('[Seed] Criados: 7 atestados.');

  // ─── Empréstimos Consignados (15) ───────────────────────────────────
  const insertEmp = db.prepare(
    'INSERT INTO emprestimo_consignado (funcionario_id, empresa_id, valor_total, numero_parcelas, data_inicio, data_fim, observacoes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const obsEmpOptions = ['', 'Consignado Banco X', 'Refinanciamento', 'Crédito Pessoal'];

  for (let i = 0; i < 15; i++) {
    const funcId = funcIds[i % 50];
    // Get empresa_id from the funcionario
    const funcRow = db.prepare('SELECT empresa_id FROM funcionarios WHERE id = ?').get(funcId);
    const empId = funcRow.empresa_id;
    const valorTotal = rng.round(rng.uniform(2000, 30000), 2);
    const numParcelas = rng.choice([6, 12, 24, 36, 48]);
    let mesInicio = rng.randint(1, 12);
    let anoInicio;
    if (mesInicio > DATA_ATUAL.getMonth() + 1) {
      anoInicio = 2025;
      mesInicio = rng.randint(1, 12);
    } else {
      anoInicio = 2026;
      mesInicio = rng.randint(1, DATA_ATUAL.getMonth() + 1);
    }
    const dataInicio = new Date(anoInicio, mesInicio - 1, 1);
    let mesFim = dataInicio.getMonth() + numParcelas; // 0-indexed
    let anoFim = dataInicio.getFullYear();
    while (mesFim > 11) {
      mesFim -= 12;
      anoFim++;
    }
    const ultimoDia = monthRange(anoFim, mesFim + 1);
    const dataFim = new Date(anoFim, mesFim, ultimoDia);
    const observacao = rng.choice(obsEmpOptions);
    insertEmp.run(funcId, empId, valorTotal, numParcelas, dateToStr(dataInicio), dateToStr(dataFim), observacao, 'ativo');
  }
  console.log('[Seed] Criados: 15 empréstimos consignados.');

  // ─── Vale Refeição - Configuração (50) ─────────────────────────────
  const insertConfigVR = db.prepare(
    'INSERT INTO config_vale_refeicao (funcionario_id, empresa_id, valor_mensal) VALUES (?, ?, ?)'
  );
  const vrOptions = [250, 300, 350, 400, 450, 500, 600, 700, 800, 1000, 1200];
  const configVRIds = [];

  for (let i = 0; i < 50; i++) {
    const funcId = funcIds[i];
    const funcRow = db.prepare('SELECT empresa_id FROM funcionarios WHERE id = ?').get(funcId);
    const vrValor = rng.choice(vrOptions);
    const result = insertConfigVR.run(funcId, funcRow.empresa_id, vrValor);
    configVRIds.push(result.lastInsertRowid);
  }
  console.log('[Seed] Criados: 50 configurações de Vale Refeição.');

  // ─── Vale Refeição - meses com valor diferente (12) ────────────────
  const vrObsOptions = ['Férias no período', 'Atestado 15 dias', 'Afastamento INSS', 'Férias'];
  const insertVRMes = db.prepare(
    'INSERT INTO vale_refeicao_mes (config_vr_id, competencia, valor_pago, observacoes) VALUES (?, ?, ?, ?)'
  );

  for (let i = 0; i < 12; i++) {
    const funcId = funcIds[i % 50];
    const configVR = db.prepare('SELECT id, valor_mensal FROM config_vale_refeicao WHERE funcionario_id = ?').get(funcId);
    let mesAnt = DATA_ATUAL.getMonth() + 1 - rng.randint(1, 3);
    let anoAnt = DATA_ATUAL.getFullYear();
    if (mesAnt < 1) {
      mesAnt += 12;
      anoAnt -= 1;
    }
    const competencia = new Date(anoAnt, mesAnt - 1, 1);
    const fator = rng.choice([0.5, 0.75, 0.6]);
    const valorPago = Math.round(configVR.valor_mensal * fator * 100) / 100;
    const obs = rng.choice(vrObsOptions);
    insertVRMes.run(configVR.id, dateToStr(competencia), valorPago, obs);
  }
  console.log('[Seed] Criados: 12 registros de VR com desconto.');

  // ─── Cargos padrão para cada empresa ────────────────────────────────
  const cargosPadrao = [
    'Analista de RH', 'Analista de DP', 'Analista Financeiro', 'Analista de TI',
    'Desenvolvedor', 'Assistente Administrativo', 'Coordenador de Projetos',
    'Gerente', 'Auxiliar de Escritório', 'Técnico de Segurança',
    'Analista de Marketing', 'Designer', 'Contador', 'Advogado',
    'Recepcionista', 'Motorista', 'Supervisor', 'Diretor',
    'Estagiário', 'Jovem Aprendiz', 'Consultor'
  ];
  const insertCargo = db.prepare('INSERT OR IGNORE INTO cargos (empresa_id, nome) VALUES (?, ?)');

  for (const empId of empresaIds) {
    for (const nomeCargo of cargosPadrao) {
      const existente = db.prepare('SELECT id FROM cargos WHERE empresa_id = ? AND nome = ?').get(empId, nomeCargo);
      if (!existente) {
        insertCargo.run(empId, nomeCargo);
      }
    }
  }
  console.log('[Seed] Criados: Cargos padrão para cada empresa.');

  // ─── Pisos por cargo ────────────────────────────────────────────────
  const insertPiso = db.prepare('INSERT INTO piso_cargo (empresa_id, cargo, valor_piso) VALUES (?, ?, ?)');
  const cargosPiso = [
    ['Auxiliar de Escritório', 1512],
    ['Recepcionista', 1512],
    ['Assistente Administrativo', 1800],
    ['Estagiário', 1200],
    ['Jovem Aprendiz', 900],
  ];

  for (const [cargoNome, pisoVal] of cargosPiso) {
    for (const empId of empresaIds) {
      const count = db.prepare('SELECT COUNT(*) as count FROM funcionarios WHERE empresa_id = ? AND cargo = ?').get(empId, cargoNome);
      if (count.count > 0) {
        const existente = db.prepare('SELECT id FROM piso_cargo WHERE empresa_id = ? AND cargo = ?').get(empId, cargoNome);
        if (!existente) {
          insertPiso.run(empId, cargoNome, pisoVal);
        }
      }
    }
  }
  console.log('[Seed] Criados: Pisos por cargo.');
}

if (require.main === module) {
  seedData();
  console.log('[Seed] Seed concluído!');
}

module.exports = { seedData, DATA_ATUAL, dateToStr, dateAddDays };
