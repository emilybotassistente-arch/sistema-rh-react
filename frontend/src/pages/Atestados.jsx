import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getAtestados, createAtestado, updateAtestado, deleteAtestado } from '../api';
import { getEmpresas, getFuncionarios } from '../api';
import { useApp } from '../context/AppContext';
import { formataData } from '../styles/GlobalStyles';

const PageHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
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
`;
const Actions = styled.div` display: flex; gap: 6px; `;
const Badge = styled.span`
  display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;
  background: ${({ tipo }) => tipo === 'Atestado' ? 'var(--warning-light)' : 'var(--danger-light)'};
  color: ${({ tipo }) => tipo === 'Atestado' ? 'var(--warning)' : 'var(--danger)'};
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

export default function Atestados() {
  const { showToast } = useApp();
  const [atestados, setAtestados] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [form, setForm] = useState({
    funcionario_id: '', empresa_id: '', tipo: 'Atestado', data_inicio: '', data_fim: '',
    dias: '1', cid: '', observacoes: '',
  });

  const loadEmpresas = useCallback(async () => { try { setEmpresas(await getEmpresas()); } catch {} }, []);
  const loadFuncionarios = useCallback(async (empresaId) => { try { setFuncionarios(await getFuncionarios({ empresa_id: empresaId || undefined })); } catch {} }, []);
  const loadAtestados = useCallback(async () => {
    try { setLoading(true); setAtestados(await getAtestados({ empresa_id: filtroEmpresa || undefined })); }
    catch (e) { showToast(e.message, 'error'); } finally { setLoading(false); }
  }, [filtroEmpresa, showToast]);

  useEffect(() => { loadEmpresas(); }, [loadEmpresas]);
  useEffect(() => { loadAtestados(); }, [loadAtestados]);
  useEffect(() => { if (form.empresa_id) loadFuncionarios(form.empresa_id); else setFuncionarios([]); }, [form.empresa_id, loadFuncionarios]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const openNew = () => {
    setEditing(null);
    setForm({ funcionario_id: '', empresa_id: '', tipo: 'Atestado', data_inicio: '', data_fim: '', dias: '1', cid: '', observacoes: '' });
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      funcionario_id: a.funcionario_id || '', empresa_id: a.empresa_id || '',
      tipo: a.tipo || 'Atestado', data_inicio: a.data_inicio || '', data_fim: a.data_fim || '',
      dias: a.dias || '1', cid: a.cid || '', observacoes: a.observacoes || '',
    });
    setShowModal(true);
    if (a.empresa_id) loadFuncionarios(a.empresa_id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updateAtestado(editing.id, form); showToast('Atestado atualizado!'); }
      else { await createAtestado(form); showToast('Atestado cadastrado!'); }
      setShowModal(false); loadAtestados();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    try { await deleteAtestado(id); showToast('Atestado excluído!'); setConfirmDelete(null); loadAtestados(); }
    catch (err) { showToast(err.message, 'error'); }
  };

  return (
    <div>
      <PageHeader>
        <Title>📄 Atestados</Title>
        <BtnPrimary onClick={openNew}>+ Novo Atestado</BtnPrimary>
      </PageHeader>
      <FilterBar>
        <FilterSelect value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)}>
          <option value="">Todas as empresas</option>
          {empresas.map(e => <option key={e.id} value={e.id}>{e.nome_fantasia || e.razao_social}</option>)}
        </FilterSelect>
      </FilterBar>
      <TableWrapper>
        {loading ? <EmptyState>Carregando...</EmptyState> :
          atestados.length === 0 ? <EmptyState>Nenhum atestado registrado</EmptyState> :
          <Table>
            <thead>
              <tr><th>Funcionário</th><th>Empresa</th><th>Tipo</th><th>Início</th><th>Fim</th><th>Dias</th><th>CID</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {atestados.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.funcionario_nome}</strong></td>
                  <td>{a.empresa_nome || '-'}</td>
                  <td><Badge tipo={a.tipo}>{a.tipo}</Badge></td>
                  <td>{formataData(a.data_inicio)}</td>
                  <td>{formataData(a.data_fim)}</td>
                  <td>{a.dias}</td>
                  <td>{a.cid || '-'}</td>
                  <td><Actions><BtnSecondary onClick={() => openEdit(a)}>✏️</BtnSecondary><BtnDanger onClick={() => setConfirmDelete(a)}>🗑️</BtnDanger></Actions></td>
                </tr>
              ))}
            </tbody>
          </Table>
        }
      </TableWrapper>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>{editing ? '✏️ Editar Atestado' : '➕ Novo Atestado'}</ModalTitle>
            <Form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup><Label>Empresa</Label><Select name="empresa_id" value={form.empresa_id} onChange={handleChange}><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.nome_fantasia || e.razao_social}</option>)}</Select></FormGroup>
                <FormGroup><Label>Funcionário *</Label><Select name="funcionario_id" value={form.funcionario_id} onChange={handleChange} required><option value="">Selecione...</option>{funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}</Select></FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup><Label>Tipo</Label><Select name="tipo" value={form.tipo} onChange={handleChange}><option value="Atestado">Atestado</option><option value="Declaração">Declaração</option></Select></FormGroup>
                <FormGroup><Label>Data Início *</Label><Input name="data_inicio" type="date" value={form.data_inicio} onChange={handleChange} required /></FormGroup>
                <FormGroup><Label>Data Fim *</Label><Input name="data_fim" type="date" value={form.data_fim} onChange={handleChange} required /></FormGroup>
                <FormGroup><Label>Dias</Label><Input name="dias" type="number" value={form.dias} onChange={handleChange} /></FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup><Label>CID</Label><Input name="cid" value={form.cid} onChange={handleChange} /></FormGroup>
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
            <p style={{ fontSize: 14, color: 'var(--gray-700)', marginBottom: 20 }}>Excluir atestado de <strong>{confirmDelete.funcionario_nome}</strong>?</p>
            <FormActions><BtnSecondary onClick={() => setConfirmDelete(null)}>Cancelar</BtnSecondary><BtnDanger onClick={() => handleDelete(confirmDelete.id)}>Excluir</BtnDanger></FormActions>
          </Modal>
        </ModalOverlay>
      )}
    </div>
  );
}
