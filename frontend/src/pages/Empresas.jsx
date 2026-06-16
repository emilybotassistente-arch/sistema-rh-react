import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa } from '../api';
import { useApp } from '../context/AppContext';
import { formataTelefone } from '../styles/GlobalStyles';

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

const TableWrapper = styled.div`
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

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
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
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

const FormRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const FormGroup = styled.div`
  flex: 1;
  min-width: 200px;
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

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 48px;
  color: var(--gray-500);
`;

export default function Empresas() {
  const { showToast } = useApp();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    contato_nome: '',
    contato_telefone: '',
  });

  const loadEmpresas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEmpresas();
      setEmpresas(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadEmpresas();
  }, [loadEmpresas]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openNew = () => {
    setEditing(null);
    setForm({
      razao_social: '',
      nome_fantasia: '',
      cnpj: '',
      inscricao_estadual: '',
      inscricao_municipal: '',
      endereco: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      email: '',
      contato_nome: '',
      contato_telefone: '',
    });
    setShowModal(true);
  };

  const openEdit = (empresa) => {
    setEditing(empresa);
    setForm({
      razao_social: empresa.razao_social || '',
      nome_fantasia: empresa.nome_fantasia || '',
      cnpj: empresa.cnpj || '',
      inscricao_estadual: empresa.inscricao_estadual || '',
      inscricao_municipal: empresa.inscricao_municipal || '',
      endereco: empresa.endereco || '',
      bairro: empresa.bairro || '',
      cidade: empresa.cidade || '',
      estado: empresa.estado || '',
      cep: empresa.cep || '',
      telefone: empresa.telefone || '',
      email: empresa.email || '',
      contato_nome: empresa.contato_nome || '',
      contato_telefone: empresa.contato_telefone || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateEmpresa(editing.id, form);
        showToast('Empresa atualizada com sucesso!');
      } else {
        await createEmpresa(form);
        showToast('Empresa criada com sucesso!');
      }
      setShowModal(false);
      loadEmpresas();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEmpresa(id);
      showToast('Empresa excluída com sucesso!');
      setConfirmDelete(null);
      loadEmpresas();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <PageHeader>
        <Title>🏢 Empresas</Title>
        <BtnPrimary onClick={openNew}>+ Nova Empresa</BtnPrimary>
      </PageHeader>

      <TableWrapper>
        {loading ? (
          <LoadingSpinner>Carregando...</LoadingSpinner>
        ) : empresas.length === 0 ? (
          <EmptyState>Nenhuma empresa cadastrada</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Razão Social</th>
                <th>Nome Fantasia</th>
                <th>CNPJ</th>
                <th>Cidade/UF</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.razao_social}</td>
                  <td>{emp.nome_fantasia}</td>
                  <td>{emp.cnpj}</td>
                  <td>{emp.cidade}{emp.cidade && emp.estado ? '/' : ''}{emp.estado}</td>
                  <td>{formataTelefone(emp.telefone)}</td>
                  <td>
                    <Actions>
                      <BtnSecondary onClick={() => openEdit(emp)}>✏️ Editar</BtnSecondary>
                      <BtnDanger onClick={() => setConfirmDelete(emp)}>🗑️ Excluir</BtnDanger>
                    </Actions>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableWrapper>

      {/* Modal CRUD */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>{editing ? '✏️ Editar Empresa' : '➕ Nova Empresa'}</ModalTitle>
            <Form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup>
                  <Label>Razão Social *</Label>
                  <Input name="razao_social" value={form.razao_social} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                  <Label>Nome Fantasia</Label>
                  <Input name="nome_fantasia" value={form.nome_fantasia} onChange={handleChange} />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <Label>CNPJ *</Label>
                  <Input name="cnpj" value={form.cnpj} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                  <Label>Inscrição Estadual</Label>
                  <Input name="inscricao_estadual" value={form.inscricao_estadual} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Inscrição Municipal</Label>
                  <Input name="inscricao_municipal" value={form.inscricao_municipal} onChange={handleChange} />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup style={{ flex: 2 }}>
                  <Label>Endereço</Label>
                  <Input name="endereco" value={form.endereco} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Bairro</Label>
                  <Input name="bairro" value={form.bairro} onChange={handleChange} />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <Label>Cidade</Label>
                  <Input name="cidade" value={form.cidade} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Estado</Label>
                  <Input name="estado" value={form.estado} onChange={handleChange} maxLength={2} />
                </FormGroup>
                <FormGroup>
                  <Label>CEP</Label>
                  <Input name="cep" value={form.cep} onChange={handleChange} />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <Label>Telefone</Label>
                  <Input name="telefone" value={form.telefone} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Email</Label>
                  <Input name="email" type="email" value={form.email} onChange={handleChange} />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <Label>Contato</Label>
                  <Input name="contato_nome" value={form.contato_nome} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Tel. Contato</Label>
                  <Input name="contato_telefone" value={form.contato_telefone} onChange={handleChange} />
                </FormGroup>
              </FormRow>
              <FormActions>
                <BtnSecondary type="button" onClick={() => setShowModal(false)}>Cancelar</BtnSecondary>
                <BtnPrimary type="submit">{editing ? 'Salvar' : 'Criar'}</BtnPrimary>
              </FormActions>
            </Form>
          </Modal>
        </ModalOverlay>
      )}

      {/* Modal Confirmar Exclusão */}
      {confirmDelete && (
        <ConfirmOverlay onClick={() => setConfirmDelete(null)}>
          <ConfirmModal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>🗑️ Confirmar Exclusão</ModalTitle>
            <ConfirmMessage>
              Tem certeza que deseja excluir a empresa <strong>{confirmDelete.razao_social}</strong>?
              Esta ação não pode ser desfeita.
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
