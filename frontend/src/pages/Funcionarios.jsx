import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getFuncionarios, deleteFuncionario } from '../api';
import { getEmpresas } from '../api';
import { useApp } from '../context/AppContext';
import { formataData, formataCPF } from '../styles/GlobalStyles';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: var(--gray-900);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BtnPrimary = styled.button`
  padding: 10px 20px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }
`;

const BtnSecondary = styled.button`
  padding: 8px 16px;
  background: white;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: var(--gray-50);
  }
`;

const BtnDanger = styled.button`
  padding: 8px 16px;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: #d33426;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--gray-800);
  background: white;
  cursor: pointer;
  min-width: 250px;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
  }
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 14px;
  flex: 1;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
  }
`;

const TableWrapper = styled.div`
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;

  th, td {
    padding: 12px 16px;
    text-align: left;
    font-size: 14px;
  }

  th {
    background: var(--gray-50);
    color: var(--gray-700);
    font-weight: 600;
    border-bottom: 2px solid var(--gray-200);
  }

  td {
    border-bottom: 1px solid var(--gray-100);
    color: var(--gray-800);
    cursor: pointer;
  }

  tr:hover td {
    background: var(--gray-50);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 6px;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ ativo }) => (ativo ? 'var(--success-light)' : 'var(--danger-light)')};
  color: ${({ ativo }) => (ativo ? 'var(--success)' : 'var(--danger)')};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: var(--shadow-lg);
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  color: var(--gray-900);
  margin-bottom: 16px;
`;

const ConfirmMessage = styled.p`
  font-size: 14px;
  color: var(--gray-700);
  margin-bottom: 20px;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: var(--gray-500);
  font-size: 16px;
`;

export default function Funcionarios() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [funcionarios, setFuncionarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [search, setSearch] = useState('');

  const loadEmpresas = useCallback(async () => {
    try {
      const data = await getEmpresas();
      setEmpresas(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadFuncionarios = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroEmpresa) params.empresa_id = filtroEmpresa;
      if (search) params.search = search;
      const data = await getFuncionarios(params);
      setFuncionarios(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [filtroEmpresa, search, showToast]);

  useEffect(() => { loadEmpresas(); }, [loadEmpresas]);
  useEffect(() => { loadFuncionarios(); }, [loadFuncionarios]);

  const handleDelete = async (id) => {
    try {
      await deleteFuncionario(id);
      showToast('Funcionário excluído com sucesso!');
      setConfirmDelete(null);
      loadFuncionarios();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <PageHeader>
        <Title>👥 Funcionários</Title>
        <BtnPrimary onClick={() => navigate('/funcionarios/novo')}>+ Novo Funcionário</BtnPrimary>
      </PageHeader>

      <FilterBar>
        <FilterSelect value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)}>
          <option value="">Todas as empresas</option>
          {empresas.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.nome_fantasia || emp.razao_social}</option>
          ))}
        </FilterSelect>
        <SearchInput
          placeholder="🔍 Buscar por nome, CPF, matrícula..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </FilterBar>

      <TableWrapper>
        {loading ? (
          <EmptyState>Carregando...</EmptyState>
        ) : funcionarios.length === 0 ? (
          <EmptyState>Nenhum funcionário encontrado</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Cargo</th>
                <th>Empresa</th>
                <th>Admissão</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {funcionarios.map((func) => (
                <tr key={func.id} onClick={() => navigate(`/funcionarios/${func.id}`)}>
                  <td>{func.matricula || '-'}</td>
                  <td><strong>{func.nome}</strong></td>
                  <td>{formataCPF(func.cpf)}</td>
                  <td>{func.cargo_nome || '-'}</td>
                  <td>{func.empresa_nome || '-'}</td>
                  <td>{formataData(func.data_admissao)}</td>
                  <td><Badge ativo={func.ativo !== false}>{(func.ativo !== false) ? 'Ativo' : 'Inativo'}</Badge></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <Actions>
                      <BtnSecondary onClick={() => navigate(`/funcionarios/${func.id}/editar`)}>✏️</BtnSecondary>
                      <BtnDanger onClick={() => setConfirmDelete(func)}>🗑️</BtnDanger>
                    </Actions>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableWrapper>

      {confirmDelete && (
        <ModalOverlay onClick={() => setConfirmDelete(null)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>🗑️ Confirmar Exclusão</ModalTitle>
            <ConfirmMessage>
              Tem certeza que deseja excluir o funcionário <strong>{confirmDelete.nome}</strong>? Esta ação não pode ser desfeita.
            </ConfirmMessage>
            <FormActions>
              <BtnSecondary onClick={() => setConfirmDelete(null)}>Cancelar</BtnSecondary>
              <BtnDanger onClick={() => handleDelete(confirmDelete.id)}>Excluir</BtnDanger>
            </FormActions>
          </Modal>
        </ModalOverlay>
      )}
    </div>
  );
}
