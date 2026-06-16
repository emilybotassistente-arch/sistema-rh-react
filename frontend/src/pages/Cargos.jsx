import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getCargos, createCargo, updateCargo, deleteCargo } from '../api';
import { getEmpresas } from '../api';
import { useApp } from '../context/AppContext';
import { formataBRL } from '../styles/GlobalStyles';

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
  min-width: 700px;

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
  background: ${({ ativo }) => (ativo ? 'var(--success-light)' : 'var(--gray-100)')};
  color: ${({ ativo }) => (ativo ? 'var(--success)' : 'var(--gray-600)')};
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
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-lg);
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  color: var(--gray-900);
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  flex: 1;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 14px;
  transition: var(--transition);

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: white;
  transition: var(--transition);

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

const ConfirmOverlay = styled(ModalOverlay)``;
const ConfirmModal = styled(Modal)`
  max-width: 400px;
`;
const ConfirmMessage = styled.p`
  font-size: 14px;
  color: var(--gray-700);
  margin-bottom: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: var(--gray-500);
  font-size: 16px;
`;

export default function Cargos() {
  const { showToast } = useApp();
  const [cargos, setCargos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [form, setForm] = useState({ nome: '', empresa_id: '', ativo: true });

  const loadEmpresas = useCallback(async () => {
    try {
      const data = await getEmpresas();
      setEmpresas(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadCargos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCargos(filtroEmpresa || undefined);
      setCargos(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [filtroEmpresa, showToast]);

  useEffect(() => {
    loadEmpresas();
  }, [loadEmpresas]);

  useEffect(() => {
    loadCargos();
  }, [loadCargos]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const openNew = () => {
    setEditing(null);
    setForm({ nome: '', empresa_id: empresas.length > 0 ? empresas[0].id : '', ativo: true });
    setShowModal(true);
  };

  const openEdit = (cargo) => {
    setEditing(cargo);
    setForm({ nome: cargo.nome, empresa_id: cargo.empresa_id, ativo: cargo.ativo !== false });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateCargo(editing.id, form);
        showToast('Cargo atualizado com sucesso!');
      } else {
        await createCargo(form);
        showToast('Cargo criado com sucesso!');
      }
      setShowModal(false);
      loadCargos();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCargo(id);
      showToast('Cargo excluído com sucesso!');
      setConfirmDelete(null);
      loadCargos();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <PageHeader>
        <Title>📋 Cargos</Title>
        <BtnPrimary onClick={openNew}>+ Novo Cargo</BtnPrimary>
      </PageHeader>

      <FilterBar>
        <FilterSelect value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)}>
          <option value="">Todas as empresas</option>
          {empresas.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.nome_fantasia || emp.razao_social}</option>
          ))}
        </FilterSelect>
      </FilterBar>

      <TableWrapper>
        {loading ? (
          <EmptyState>Carregando...</EmptyState>
        ) : cargos.length === 0 ? (
          <EmptyState>Nenhum cargo cadastrado</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Empresa</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {cargos.map((cargo) => (
                <tr key={cargo.id}>
                  <td><strong>{cargo.nome}</strong></td>
                  <td>{cargo.empresa_nome || '-'}</td>
                  <td><Badge ativo={cargo.ativo !== false}>{(cargo.ativo !== false) ? 'Ativo' : 'Inativo'}</Badge></td>
                  <td>
                    <Actions>
                      <BtnSecondary onClick={() => openEdit(cargo)}>✏️ Editar</BtnSecondary>
                      <BtnDanger onClick={() => setConfirmDelete(cargo)}>🗑️ Excluir</BtnDanger>
                    </Actions>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableWrapper>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>{editing ? '✏️ Editar Cargo' : '➕ Novo Cargo'}</ModalTitle>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Nome do Cargo *</Label>
                <Input name="nome" value={form.nome} onChange={handleChange} required />
              </FormGroup>
              <FormGroup>
                <Label>Empresa *</Label>
                <Select name="empresa_id" value={form.empresa_id} onChange={handleChange} required>
                  <option value="">Selecione...</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.nome_fantasia || emp.razao_social}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange} />
                  Cargo ativo
                </label>
              </FormGroup>
              <FormActions>
                <BtnSecondary type="button" onClick={() => setShowModal(false)}>Cancelar</BtnSecondary>
                <BtnPrimary type="submit">{editing ? 'Salvar' : 'Criar'}</BtnPrimary>
              </FormActions>
            </Form>
          </Modal>
        </ModalOverlay>
      )}

      {confirmDelete && (
        <ConfirmOverlay onClick={() => setConfirmDelete(null)}>
          <ConfirmModal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>🗑️ Confirmar Exclusão</ModalTitle>
            <ConfirmMessage>
              Tem certeza que deseja excluir o cargo <strong>{confirmDelete.nome}</strong>?
            </ConfirmMessage>
            <FormActions>
              <BtnSecondary onClick={() => setConfirmDelete(null)}>Cancelar</BtnSecondary>
              <BtnDanger onClick={() => handleDelete(confirmDelete.id)}>Excluir</BtnDanger>
            </FormActions>
          </ConfirmModal>
        </ConfirmOverlay>
      )}
    </div>
  );
}
