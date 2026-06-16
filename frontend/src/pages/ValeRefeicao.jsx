import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getValeRefeicao, createValeRefeicao, updateValeRefeicao, deleteValeRefeicao } from '../api';
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
  width: 100%; border-collapse: collapse; min-width: 800px;
  th, td { padding: 12px 16px; text-align: left; font-size: 14px; }
  th { background: var(--gray-50); color: var(--gray-700); font-weight: 600; border-bottom: 2px solid var(--gray-200); }
  td { border-bottom: 1px solid var(--gray-100); color: var(--gray-800); }
  tr:hover td { background: var(--gray-50); }
`;
const Actions = styled.div` display: flex; gap: 6px; `;
const Badge = styled.span`
  display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;
  background: ${({ status }) => status === 'Recebido' ? 'var(--success-light)' : status === 'Pendente' ? 'var(--warning-light)' : 'var(--gray-100)'};
  color: ${({ status }) => status === 'Recebido' ? 'var(--success)' : status === 'Pendente' ? 'var(--warning)' : 'var(--gray-600)'};
`;
const ModalOverlay = styled.div`
  position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
`;
const Modal = styled.div`
  background: white; border-radius: var(--radius-lg); padding: 24px;
  max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg);
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

export default function ValeRefeicao() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [registros, setRegistros] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [form, setForm] = useState({
    funcionario_id: '', empresa_id: '', valor: '',
    mes_referencia: '', data_pagamento: '', status: 'Pendente', observacoes: '',
  });

  const loadEmpresas = useCallback(async () => { try { setEmpresas(await getEmpresas()); } catch {} }, []);
  const loadFuncionarios = useCallback(async (empresaId) => { try { setFuncionarios(await getFuncionarios({ empresa_id: empresaId || undefined })); } catch {} }, []);
  const loadRegistros = useCallback(async () => {
    try { setLoading(true); setRegistros(await getValeRefeicao({ empresa_id: filtroEmpresa || undefined })); }
    catch (e) { showToast(e.message, 'error'); } finally { setLoading(false); }
  }, [filtroEmpresa, showToast]);

  useEffect(() => { loadEmpresas(); }, [loadEmpresas]);
  useEffect(() => { loadRegistros(); }, [loadRegistros]);
  useEffect(() => { if (form.empresa_id) loadFuncionarios(form.empresa_id); else setFuncionarios([]); }, [form.empresa_id, loadFuncionarios]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const openNew = () => {
    setEditing(null);
    setForm({ funcionario_id: '', empresa_id: '', valor: '', mes_referencia: '', data_pagamento: '', status: 'Pendente', observacoes: '' });
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({
      funcionario_id: r.funcionario_id || '', empresa_id: r.empresa_id || '',
      valor: r.valor || '', mes_referencia: r.mes_referencia || '',
      data_pagamento: r.data_pagamento || '', status: r.status || 'Pendente', observacoes: r.observacoes || '',
    });
    setShowModal(true);
    if (r.empresa_id) loadFuncionarios(r.empresa_id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updateValeRefeicao(editing.id, form); showToast('Registro atualizado!'); }
      else { await createValeRefeicao(form); showToast('Registro criado!'); }
      setShowModal(false); loadRegistros();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    try { await deleteValeRefeicao(id); showToast('Registro excluído!'); setConfirmDelete(null); loadRegistros(); }
    catch (err) { showToast(err.message, 'error'); }
  };

  return (
    <div>
      <PageHeader>
        <Title>🍽️ Vale Refeição</Title>
        <div style={{ display: 'flex', gap: 8 }}>
          <BtnSecondary onClick={() => navigate('/valerefeicao/config')}>⚙️ Configurar</BtnSecondary>
          <BtnPrimary onClick={openNew}>+ Novo</BtnPrimary>
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
          registros.length === 0 ? <EmptyState>Nenhum registro encontrado</EmptyState> :
          <Table>
            <thead>
              <tr><th>Funcionário</th><th>Empresa</th><th>Valor</th><th>Mês Ref.</th><th>Pagamento</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {registros.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.funcionario_nome}</strong></td>
                  <td>{r.empresa_nome || '-'}</td>
                  <td>{formataBRL(r.valor)}</td>
                  <td>{r.mes_referencia}</td>
                  <td>{formataData(r.data_pagamento)}</td>
                  <td><Badge status={r.status}>{r.status}</Badge></td>
                  <td><Actions><BtnSecondary onClick={() => openEdit(r)}>✏️</BtnSecondary><BtnDanger onClick={() => setConfirmDelete(r)}>🗑️</BtnDanger></Actions></td>
                </tr>
              ))}
            </tbody>
          </Table>
        }
      </TableWrapper>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>{editing ? '✏️ Editar Vale Refeição' : '➕ Novo Vale Refeição'}</ModalTitle>
            <Form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup><Label>Empresa</Label><Select name="empresa_id" value={form.empresa_id} onChange={handleChange}><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.nome_fantasia || e.razao_social}</option>)}</Select></FormGroup>
                <FormGroup><Label>Funcionário *</Label><Select name="funcionario_id" value={form.funcionario_id} onChange={handleChange} required><option value="">Selecione...</option>{funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}</Select></FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup><Label>Valor (R$) *</Label><Input name="valor" type="number" step="0.01" value={form.valor} onChange={handleChange} required /></FormGroup>
                <FormGroup><Label>Mês Referência</Label><Input name="mes_referencia" value={form.mes_referencia} onChange={handleChange} placeholder="MM/AAAA" /></FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup><Label>Data Pagamento</Label><Input name="data_pagamento" type="date" value={form.data_pagamento} onChange={handleChange} /></FormGroup>
                <FormGroup><Label>Status</Label><Select name="status" value={form.status} onChange={handleChange}><option value="Pendente">Pendente</option><option value="Recebido">Recebido</option></Select></FormGroup>
              </FormRow>
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
            <p style={{ fontSize: 14, color: 'var(--gray-700)', marginBottom: 20 }}>Excluir registro de <strong>{confirmDelete.funcionario_nome}</strong>?</p>
            <FormActions><BtnSecondary onClick={() => setConfirmDelete(null)}>Cancelar</BtnSecondary><BtnDanger onClick={() => handleDelete(confirmDelete.id)}>Excluir</BtnDanger></FormActions>
          </Modal>
        </ModalOverlay>
      )}
    </div>
  );
}
