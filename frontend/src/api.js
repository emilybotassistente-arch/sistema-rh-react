const API_BASE = 'http://localhost:4000/api';

async function request(url, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE}${url}`, config);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Erro de conexão com o servidor');
    }
    throw error;
  }
}

// Empresas
export const getEmpresas = () => request('/empresas');
export const getEmpresa = (id) => request(`/empresas/${id}`);
export const createEmpresa = (data) => request('/empresas', { method: 'POST', body: JSON.stringify(data) });
export const updateEmpresa = (id, data) => request(`/empresas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEmpresa = (id) => request(`/empresas/${id}`, { method: 'DELETE' });

// Cargos
export const getCargos = (empresaId) => request(`/cargos${empresaId ? `?empresa_id=${empresaId}` : ''}`);
export const getCargo = (id) => request(`/cargos/${id}`);
export const createCargo = (data) => request('/cargos', { method: 'POST', body: JSON.stringify(data) });
export const updateCargo = (id, data) => request(`/cargos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCargo = (id) => request(`/cargos/${id}`, { method: 'DELETE' });

// Funcionários
export const getFuncionarios = (params = {}) => {
  const query = new URLSearchParams();
  if (params.empresa_id) query.set('empresa_id', params.empresa_id);
  if (params.search) query.set('search', params.search);
  if (params.ativo !== undefined) query.set('ativo', params.ativo);
  const qs = query.toString();
  return request(`/funcionarios${qs ? `?${qs}` : ''}`);
};
export const getFuncionario = (id) => request(`/funcionarios/${id}`);
export const createFuncionario = (data) => request('/funcionarios', { method: 'POST', body: JSON.stringify(data) });
export const updateFuncionario = (id, data) => request(`/funcionarios/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteFuncionario = (id) => request(`/funcionarios/${id}`, { method: 'DELETE' });

// Exames
export const getExames = (params = {}) => {
  const query = new URLSearchParams();
  if (params.empresa_id) query.set('empresa_id', params.empresa_id);
  if (params.funcionario_id) query.set('funcionario_id', params.funcionario_id);
  const qs = query.toString();
  return request(`/exames${qs ? `?${qs}` : ''}`);
};
export const getExame = (id) => request(`/exames/${id}`);
export const createExame = (data) => request('/exames', { method: 'POST', body: JSON.stringify(data) });
export const updateExame = (id, data) => request(`/exames/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteExame = (id) => request(`/exames/${id}`, { method: 'DELETE' });

// Férias
export const getFerias = (params = {}) => {
  const query = new URLSearchParams();
  if (params.empresa_id) query.set('empresa_id', params.empresa_id);
  if (params.funcionario_id) query.set('funcionario_id', params.funcionario_id);
  const qs = query.toString();
  return request(`/ferias${qs ? `?${qs}` : ''}`);
};
export const getFeriasById = (id) => request(`/ferias/${id}`);
export const createFerias = (data) => request('/ferias', { method: 'POST', body: JSON.stringify(data) });
export const updateFerias = (id, data) => request(`/ferias/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteFerias = (id) => request(`/ferias/${id}`, { method: 'DELETE' });

// Atestados
export const getAtestados = (params = {}) => {
  const query = new URLSearchParams();
  if (params.empresa_id) query.set('empresa_id', params.empresa_id);
  if (params.funcionario_id) query.set('funcionario_id', params.funcionario_id);
  const qs = query.toString();
  return request(`/atestados${qs ? `?${qs}` : ''}`);
};
export const getAtestado = (id) => request(`/atestados/${id}`);
export const createAtestado = (data) => request('/atestados', { method: 'POST', body: JSON.stringify(data) });
export const updateAtestado = (id, data) => request(`/atestados/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAtestado = (id) => request(`/atestados/${id}`, { method: 'DELETE' });

// Empréstimos
export const getEmprestimos = (params = {}) => {
  const query = new URLSearchParams();
  if (params.empresa_id) query.set('empresa_id', params.empresa_id);
  if (params.funcionario_id) query.set('funcionario_id', params.funcionario_id);
  const qs = query.toString();
  return request(`/emprestimos${qs ? `?${qs}` : ''}`);
};
export const getEmprestimo = (id) => request(`/emprestimos/${id}`);
export const createEmprestimo = (data) => request('/emprestimos', { method: 'POST', body: JSON.stringify(data) });
export const updateEmprestimo = (id, data) => request(`/emprestimos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEmprestimo = (id) => request(`/emprestimos/${id}`, { method: 'DELETE' });
export const getEmprestimosHistorico = (params = {}) => {
  const query = new URLSearchParams();
  if (params.empresa_id) query.set('empresa_id', params.empresa_id);
  if (params.funcionario_id) query.set('funcionario_id', params.funcionario_id);
  const qs = query.toString();
  return request(`/emprestimos/historico${qs ? `?${qs}` : ''}`);
};

// Vale Refeição
export const getValeRefeicao = (params = {}) => {
  const query = new URLSearchParams();
  if (params.empresa_id) query.set('empresa_id', params.empresa_id);
  if (params.funcionario_id) query.set('funcionario_id', params.funcionario_id);
  const qs = query.toString();
  return request(`/valerefeicao${qs ? `?${qs}` : ''}`);
};
export const createValeRefeicao = (data) => request('/valerefeicao', { method: 'POST', body: JSON.stringify(data) });
export const updateValeRefeicao = (id, data) => request(`/valerefeicao/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteValeRefeicao = (id) => request(`/valerefeicao/${id}`, { method: 'DELETE' });

export const getValeRefeicaoConfig = (empresaId) => request(`/valerefeicao/config${empresaId ? `?empresa_id=${empresaId}` : ''}`);
export const updateValeRefeicaoConfig = (id, data) => request(`/valerefeicao/config/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// Reajuste Salarial
export const getReajustes = (params = {}) => {
  const query = new URLSearchParams();
  if (params.empresa_id) query.set('empresa_id', params.empresa_id);
  const qs = query.toString();
  return request(`/reajustes${qs ? `?${qs}` : ''}`);
};
export const createReajuste = (data) => request('/reajustes', { method: 'POST', body: JSON.stringify(data) });
export const getRelatorioReajuste = (params = {}) => {
  const query = new URLSearchParams();
  if (params.empresa_id) query.set('empresa_id', params.empresa_id);
  if (params.data_inicio) query.set('data_inicio', params.data_inicio);
  if (params.data_fim) query.set('data_fim', params.data_fim);
  const qs = query.toString();
  return request(`/reajustes/relatorio${qs ? `?${qs}` : ''}`);
};

// Piso por Cargo
export const getPisosCargo = (empresaId) => request(`/pisocargo${empresaId ? `?empresa_id=${empresaId}` : ''}`);
export const createPisoCargo = (data) => request('/pisocargo', { method: 'POST', body: JSON.stringify(data) });
export const updatePisoCargo = (id, data) => request(`/pisocargo/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePisoCargo = (id) => request(`/pisocargo/${id}`, { method: 'DELETE' });

// Eventos (Dashboard)
export const getEventos = (params = {}) => {
  const query = new URLSearchParams();
  if (params.empresa_id) query.set('empresa_id', params.empresa_id);
  const qs = query.toString();
  return request(`/eventos${qs ? `?${qs}` : ''}`);
};

export default request;
