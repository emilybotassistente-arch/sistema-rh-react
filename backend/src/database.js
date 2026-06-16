const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'sistema_rh.db');

let db;

function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function createTables() {
  const db = getDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS empresas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cnpj TEXT NOT NULL,
      endereco TEXT DEFAULT '',
      telefone TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS cargos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    );

    CREATE TABLE IF NOT EXISTS funcionarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cargo TEXT NOT NULL,
      funcao TEXT DEFAULT '',
      empresa_id INTEGER NOT NULL,
      data_admissao TEXT NOT NULL,
      salario REAL NOT NULL,
      piso_salarial REAL,
      ativo INTEGER DEFAULT 1,
      FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    );

    CREATE TABLE IF NOT EXISTS exames (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      funcionario_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      data_realizacao TEXT NOT NULL,
      data_validade TEXT,
      status TEXT DEFAULT 'pendente',
      observacoes TEXT DEFAULT '',
      FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
    );

    CREATE TABLE IF NOT EXISTS ferias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      funcionario_id INTEGER NOT NULL,
      data_inicio TEXT NOT NULL,
      data_fim TEXT NOT NULL,
      periodo_aquisitivo TEXT DEFAULT '',
      dias_solicitados INTEGER NOT NULL,
      dias_restantes INTEGER DEFAULT 30,
      status TEXT DEFAULT 'agendado',
      observacoes TEXT DEFAULT '',
      FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
    );

    CREATE TABLE IF NOT EXISTS atestados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      funcionario_id INTEGER NOT NULL,
      data_inicio TEXT NOT NULL,
      data_fim TEXT NOT NULL,
      cid TEXT DEFAULT '',
      diagnostico TEXT DEFAULT '',
      dias_previstos INTEGER NOT NULL,
      tipo_afastamento TEXT DEFAULT '14_dias',
      status TEXT DEFAULT 'ativo',
      observacoes TEXT DEFAULT '',
      inss_afastamento INTEGER DEFAULT 0,
      FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
    );

    CREATE TABLE IF NOT EXISTS emprestimo_consignado (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      funcionario_id INTEGER NOT NULL,
      empresa_id INTEGER NOT NULL,
      valor_total REAL NOT NULL,
      numero_parcelas INTEGER NOT NULL,
      data_inicio TEXT NOT NULL,
      data_fim TEXT NOT NULL,
      observacoes TEXT DEFAULT '',
      status TEXT DEFAULT 'ativo',
      FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id),
      FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    );

    CREATE TABLE IF NOT EXISTS config_vale_refeicao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      funcionario_id INTEGER NOT NULL UNIQUE,
      empresa_id INTEGER NOT NULL,
      valor_mensal REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id),
      FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    );

    CREATE TABLE IF NOT EXISTS vale_refeicao_mes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_vr_id INTEGER NOT NULL,
      competencia TEXT NOT NULL,
      valor_pago REAL NOT NULL,
      observacoes TEXT DEFAULT '',
      FOREIGN KEY (config_vr_id) REFERENCES config_vale_refeicao(id)
    );

    CREATE TABLE IF NOT EXISTS piso_cargo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER NOT NULL,
      cargo TEXT NOT NULL,
      valor_piso REAL NOT NULL,
      FOREIGN KEY (empresa_id) REFERENCES empresas(id)
    );
  `);

  console.log('[DB] Tabelas criadas/verificadas.');
}

module.exports = { getDatabase, createTables };
