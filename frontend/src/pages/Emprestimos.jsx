import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getEmprestimos, createEmprestimo, updateEmprestimo, deleteEmprestimo } from '../api';
import { getEmpresas, getFuncionarios } from '../api';
import { useApp } from '../context/AppContext';
import { formataData, formataBRL } from '../styles/GlobalStyles';

const PageHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
  flex-wrap: wrap; gap: 12px;
`;
const Title = styled.h1`
  font-size: 24px; color: var(--gray-900); display: flex; align-items: center; gap: 10px;
`;
const BtnPrimary = styled.button`
  padding: 10px 20px; background: var(--primary); color: white; border: none;
  border-radius: var(--radius-md); font-size: 14px; font-weight: 500; cursor: pointer;
  transition: var(--transition); display: flex; align-items: center; gap: 6px;
  &:hover { background: var(--primary-dark); }
`;
const BtnSecondary = styled.button`
  padding: 8px 16px; background: white; color: var(--gray-700);
  border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: 13px; cursor: pointer;
  &:hover { background: var(--gray-50); }
`;
const BtnDanger = styled.button`
  padding: 8px 16px; background: var(--danger); color: white; border: none;
  border-radius: var(--radius-md); font-size: 13px; cursor: pointer;
  &:hover { background: #d33426; }
`;
const FilterBar = styled.div` display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; `;
const FilterSelect = styled.select`
  padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius-md);
  font-size: 14px; color: var(--gray-800); background: white; cursor: pointer; min-width: 250px;
  &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-light); }
`;
const TableWrapper = styled.div`
  background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200); overflow-x: auto;
`;
const Table = styled.table`
  width: 100%; border-collapse: collapse; min-width: 900px;
  th, td { padding: 12px 16px; text-align: left; font-size: 14px; }
  th { background: var(--gray-50); color: var(--gray-700); font-weight: 600; border-bottom: 2px solid var(--gray-200); }
  td { border-bottom: 1px solid var(--gray-100); color: var(--gray-800); }
  tr:hover td { background: var(--gray-50); }
  td:last-child { cursor: pointer; color: var(--primary); font-weight: 500; }
`;
const Actions = styled.div` display: flex; gap: 6px; `;
const Badge = styled.span`
  display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;
  background: ${({ status }) =>
    status === 'Pago' ? 'var(--success-light)' :
    status === 'Ativo' ? 'var(--primary-light)' :
    status === 'Atrasado' ? 'var(--danger-light)' : 'var(--gray-100)'};
  color: ${({ status }) =>
    status === 'Pago' ? 'var(--success)' :
    status === 'Ativo' ? 'var(--primary)' :
    status === 'Atrasado' ? 'var(--danger)' : 'var(--gray-600)'};
`;
const ModalOverlay = styled.div`
  position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
`;
const Modal = styled.div`
  background: white; border-radius: var(--radius-lg); padding: 24px;
  max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg);
`;
const ModalTitle = styled.h2` font-size: 18px; color: var(--gray-900); margin-bottom: 20px; `;
const Form = styled.form` display: flex; flex-direction: column; gap: 16px; `;
const FormRow = styled.div` display: flex; gap: 12px; flex-wrap: wrap; `;
const FormGroup = styled.div` flex: 1; min-width: 200px; `;
const Label = styled.label` display: block; font-size: 13px; font-weight: 500; color: var(--gray-700); margin-bottom: 4px; `;
const Input = styled.input`
  width: 100%; padding: 8px 12px; border: 1px solid var(--gray-300);
  border-radius: var(--radius-md); font-size: 14px;
  &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-light); }
`;
const Select = styled.select`
  width: 100%; padding: 8px 12px; border: 1px solid var(--gray-300);
  border-radius: var(--radius-md); font-size: 14px; background: white;
  &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-light); }
`;
const TextArea = styled.textarea`
  width: 100%; padding: 8px 12px; border: 1px solid var(--gray-300);
  border-radius: var(--radius-md); font-size: 14px; resize: vertical; min-height: 60px;
  &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-light); }
`;
const FormActions = styled.div` display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; `;
const EmptyState = styled.div` text-align: center; padding: 48px; color: var(--gray-500); font-size: 16px; `;

export default function Emprestimos() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [emprestimos, setEmprestimos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [form, setForm] = useState({
    funcionario_id: '', empresa_id: '', valor: '', data_solicitacao: '',
    data_primeira_parcela: '', numero_parcelas: '1', valor_parcela: '',
    finalidade: '', status: 'Ativo', observacoes: '',
  });

  const loadEmpresas = useCallback(async () => { try { setEmpresas(await getEmpresas()); } catch {} }, []);
  const loadFuncionarios = useCallback(async (empresaId) => { try { setFuncionarios(await getFuncionarios({ empresa_id: empresaId || undefined })); } catch {} }, []);
  const loadEmprestimos = useCallback(async () => {
    try { setLoading(true); setEmprestimos(await getEmprestimos({ empresa_id: filtroEmpresa || undefined })); }
    catch (e) { showToast(e.message, 'error'); } finally { setLoading(false); }
  }, [filtroEmpresa, showToast]);

  useEffect(() => { loadEmpresas(); }, [loadEmpresas]);
  useEffect(() => { loadEmprestimos(); }, [loadEmprestimos]);
  useEffect(() => { if (form.empresa_id) loadFuncionarios(form.empresa_id); else setFuncionarios([]); }, [form.empresa_id, loadFuncionarios]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const openNew = () => {
    setEditing(null);
    setForm({ funcionario_id: '', empresa_id: '', valor: '', data_solicitacao: '', data_primeira_parcela: '', numero_parcelas: '1', valor_parcela: '', finalidade: '', status: 'Ativo', observacoes: '' });
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setForm({
      funcionario_id: emp.funcionario_id || '', empresa_id: emp.empresa_id || '',
      valor: emp.valor || '', data_solicitacao: emp.data_solicitacao || '',
      data_primeira_parcela: emp.data_primeira_parcela || '', numero_parcelas: emp.numero_parcelas || '1',
      valor_parcela: emp.valor_parcela || '', finalidade: emp.finalidade || '',
      status: emp.status || 'Ativo', observacoes: emp.observacoes || '',
    });
    setShowModal(true);
    if (emp.empresa_id) loadFuncionarios(emp.empresa_id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updateEmprestimo(editing.id, form); showToast('Empréstimo atualizado!'); }
      else { await createEmprestimo(form); showToast('Empréstimo cadastrado!'); }
      setShowModal(false); loadEmprestimos();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    try { await deleteEmprestimo(id); showToast('Empréstimo excluído!'); setConfirmDelete(null); loadEmprestimos(); }
    catch (err) { showToast(err.message, 'error'); }
  };

  return (
    <div>
      <PageHeader>
        <Title>💵 Empréstimos</Title>
        <div style={{ display: 'flex', gap: 8 }}>
          <BtnSecondary onClick={() => navigate('/emprestimos/historico')}>📊 Histórico</BtnSecondary>
          <BtnPrimary onClick={openNew}>+ Novo Empréstimo</BtnPrimary>
        </div>
      </PageHeader>
      <FilterBar>
        <FilterSelect value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)}>
          <option value="">Todas as empresas</option>
          {empresas.map(e => <option key={e.id} value={e.id}>{e.nome_fantasia || e.razao_social}</option>)}
        </FilterSelect>
      </FilterBar>
      <TableWrapper>
        {loading ? <EmptyState>Carregando...</EmptyState> :
          emprestimos.length === 0 ? <EmptyState>Nenhum empréstimo registrado</EmptyState> :
          <Table>
            <thead>
              <tr><th>Funcionário</th><th>Empresa</th><th>Valor</th><th>Parcelas</th><th>Status</th><th>Solicitação</th><th>Detalhes</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {emprestimos.map(emp => (
                <tr key={emp.id}>
                  <td><strong>{emp.funcionario_nome}</strong></td>
                  <td>{emp.empresa_nome || '-'}</td>
                  <td>{formataBRL(emp.valor)}</td>
                  <td>{emp.numero_parcelas}x {formataBRL(emp.valor_parcela)}</td>
                  <td><Badge status={emp.status}>{emp.status}</Badge></td>
                  <td>{formataData(emp.data_solicitacao)}</td>
                  <td onClick={() => navigate(`/emprestimos/${emp.id}`)}>👁️ Ver</td>
                  <td onClick={e => e.stopPropagation()}>
                    <Actions><BtnSecondary onClick={() => openEdit(emp)}>✏️</BtnSecondary><BtnDanger onClick={() => setConfirmDelete(emp)}>🗑️</BtnDanger></Actions>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        }
      </TableWrapper>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>{editing ? '✏️ Editar Empréstimo' : '➕ Novo Empréstimo'}</ModalTitle>
            <Form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup><Label>Empresa</Label><Select name="empresa_id" value={form.empresa_id} onChange={handleChange}><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.nome_fantasia || e.razao_social}</option>)}</Select></FormGroup>
                <FormGroup><Label>Funcionário *</Label><Select name="funcionario_id" value={form.funcionario_id} onChange={handleChange} required><option value="">Selecione...</option>{funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}</Select></FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup><Label>Valor (R$) *</Label><Input name="valor" type="number" step="0.01" value={form.valor} onChange={handleChange} required /></FormGroup>
                <FormGroup><Label>Nº Parcelas</Label><Input name="numero_parcelas" type="number" value={form.numero_parcelas} onChange={handleChange} /></FormGroup>
                <FormGroup><Label>Valor Parcela (R$)</Label><Input name="valor_parcela" type="number" step="0.01" value={form.valor_parcela} onChange={handleChange} /></FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup><Label>Data Solicitação *</Label><Input name="data_solicitacao" type="date" value={form.data_solicitacao} onChange={handleChange} required /></FormGroup>
                <FormGroup><Label>1ª Parcela</Label><Input name="data_primeira_parcela" type="date" value={form.data_primeira_parcela} onChange={handleChange} /></FormGroup>
                <FormGroup><Label>Status</Label><Select name="status" value={form.status} onChange={handleChange}><option value="Ativo">Ativo</option><option value="Pago">Pago</option><option value="Atrasado">Atrasado</option><option value="Cancelado">Cancelado</option></Select></FormGroup>
              </FormRow>
              <FormGroup><Label>Finalidade</Label><Input name="finalidade" value={form.finalidade} onChange={handleChange} /></FormGroup>
              <FormGroup><Label>Observações</Label><TextArea name="observacoes" value={form.observacoes} onChange={handleChange} /></FormGroup>
              <FormActions><BtnSecondary type="button" onClick={() => setShowModal(false)}>Cancelar</BtnSecondary><BtnPrimary type="submit">{editing ? 'Salvar' : 'Criar'}</BtnPrimary></FormActions>
            </Form>
          </Modal>
        </ModalOverlay>
      )}

      {confirmDelete && (
        <ModalOverlay onClick={() => setConfirmDelete(null)}>
          <Modal onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <ModalTitle>🗑️ Confirmar Exclusão</ModalTitle>
            <p style={{ fontSize: 14, color: 'var(--gray-700)', marginBottom: 20 }}>Excluir empréstimo de <strong>{confirmDelete.funcionario_nome}</strong>?</p>
            <FormActions><BtnSecondary onClick={() => setConfirmDelete(null)}>Cancelar</BtnSecondary><BtnDanger onClick={() => handleDelete(confirmDelete.id)}>Excluir</BtnDanger></FormActions>
          </Modal>
        </ModalOverlay>
      )}
    </div>
  );
}
