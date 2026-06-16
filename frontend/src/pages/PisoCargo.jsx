import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getPisosCargo, createPisoCargo, updatePisoCargo, deletePisoCargo } from '../api';
import { getEmpresas, getCargos } from '../api';
import { useApp } from '../context/AppContext';
import { formataBRL } from '../styles/GlobalStyles';

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
  width: 100%; border-collapse: collapse; min-width: 700px;
  th, td { padding: 12px 16px; text-align: left; font-size: 14px; }
  th { background: var(--gray-50); color: var(--gray-700); font-weight: 600; border-bottom: 2px solid var(--gray-200); }
  td { border-bottom: 1px solid var(--gray-100); color: var(--gray-800); }
  tr:hover td { background: var(--gray-50); }
`;
const Actions = styled.div` display: flex; gap: 6px; `;
const Badge = styled.span`
  display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;
  background: ${({ ativo }) => ativo ? 'var(--success-light)' : 'var(--gray-100)'};
  color: ${({ ativo }) => ativo ? 'var(--success)' : 'var(--gray-600)'};
`;
const ModalOverlay = styled.div`
  position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
`;
const Modal = styled.div`
  background: white; border-radius: var(--radius-lg); padding: 24px;
  max-width: 500px; width: 90%; box-shadow: var(--shadow-lg);
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
const FormActions = styled.div` display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; `;
const EmptyState = styled.div` text-align: center; padding: 48px; color: var(--gray-500); font-size: 16px; `;

export default function PisoCargo() {
  const { showToast } = useApp();
  const [pisos, setPisos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [form, setForm] = useState({ empresa_id: '', cargo_id: '', valor_piso: '', ativo: true });

  const loadEmpresas = useCallback(async () => { try { setEmpresas(await getEmpresas()); } catch {} }, []);
  const loadCargos = useCallback(async (empresaId) => { try { setCargos(await getCargos(empresaId || undefined)); } catch {} }, []);
  const loadPisos = useCallback(async () => {
    try { setLoading(true); setPisos(await getPisosCargo(filtroEmpresa || undefined)); }
    catch (e) { showToast(e.message, 'error'); } finally { setLoading(false); }
  }, [filtroEmpresa, showToast]);

  useEffect(() => { loadEmpresas(); }, [loadEmpresas]);
  useEffect(() => { loadPisos(); }, [loadPisos]);

  useEffect(() => {
    if (form.empresa_id || editing?.empresa_id) {
      loadCargos(form.empresa_id || editing?.empresa_id);
    }
  }, [form.empresa_id, editing?.empresa_id, loadCargos]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openNew = () => {
    setEditing(null);
    setForm({ empresa_id: '', cargo_id: '', valor_piso: '', ativo: true });
    setShowModal(true);
  };

  const openEdit = (piso) => {
    setEditing(piso);
    setForm({ empresa_id: piso.empresa_id, cargo_id: piso.cargo_id, valor_piso: piso.valor_piso || '', ativo: piso.ativo !== false });
    setShowModal(true);
    loadCargos(piso.empresa_id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updatePisoCargo(editing.id, form); showToast('Piso atualizado!'); }
      else { await createPisoCargo(form); showToast('Piso criado!'); }
      setShowModal(false); loadPisos();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    try { await deletePisoCargo(id); showToast('Piso excluído!'); setConfirmDelete(null); loadPisos(); }
    catch (err) { showToast(err.message, 'error'); }
  };

  return (
    <div>
      <PageHeader>
        <Title>📊 Piso por Cargo</Title>
        <BtnPrimary onClick={openNew}>+ Novo Piso</BtnPrimary>
      </PageHeader>
      <FilterBar>
        <FilterSelect value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)}>
          <option value="">Todas as empresas</option>
          {empresas.map(e => <option key={e.id} value={e.id}>{e.nome_fantasia || e.razao_social}</option>)}
        </FilterSelect>
      </FilterBar>
      <TableWrapper>
        {loading ? <EmptyState>Carregando...</EmptyState> :
          pisos.length === 0 ? <EmptyState>Nenhum piso cadastrado</EmptyState> :
          <Table>
            <thead>
              <tr><th>Empresa</th><th>Cargo</th><th>Valor Piso</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {pisos.map(p => (
                <tr key={p.id}>
                  <td>{p.empresa_nome || '-'}</td>
                  <td><strong>{p.cargo_nome}</strong></td>
                  <td>{formataBRL(p.valor_piso)}</td>
                  <td><Badge ativo={p.ativo !== false}>{p.ativo !== false ? 'Ativo' : 'Inativo'}</Badge></td>
                  <td><Actions><BtnSecondary onClick={() => openEdit(p)}>✏️</BtnSecondary><BtnDanger onClick={() => setConfirmDelete(p)}>🗑️</BtnDanger></Actions></td>
                </tr>
              ))}
            </tbody>
          </Table>
        }
      </TableWrapper>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>{editing ? '✏️ Editar Piso' : '➕ Novo Piso'}</ModalTitle>
            <Form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup><Label>Empresa *</Label><Select name="empresa_id" value={form.empresa_id} onChange={handleChange} required><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.nome_fantasia || e.razao_social}</option>)}</Select></FormGroup>
                <FormGroup><Label>Cargo *</Label><Select name="cargo_id" value={form.cargo_id} onChange={handleChange} required><option value="">Selecione...</option>{cargos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</Select></FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup><Label>Valor Piso (R$) *</Label><Input name="valor_piso" type="number" step="0.01" value={form.valor_piso} onChange={handleChange} required /></FormGroup>
                <FormGroup>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', marginTop: 24 }}>
                    <input type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange} />
                    Ativo
                  </label>
                </FormGroup>
              </FormRow>
              <FormActions><BtnSecondary type="button" onClick={() => setShowModal(false)}>Cancelar</BtnSecondary><BtnPrimary type="submit">{editing ? 'Salvar' : 'Criar'}</BtnPrimary></FormActions>
            </Form>
          </Modal>
        </ModalOverlay>
      )}

      {confirmDelete && (
        <ModalOverlay onClick={() => setConfirmDelete(null)}>
          <Modal onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <ModalTitle>🗑️ Confirmar Exclusão</ModalTitle>
            <p style={{ fontSize: 14, color: 'var(--gray-700)', marginBottom: 20 }}>Excluir piso do cargo <strong>{confirmDelete.cargo_nome}</strong>?</p>
            <FormActions><BtnSecondary onClick={() => setConfirmDelete(null)}>Cancelar</BtnSecondary><BtnDanger onClick={() => handleDelete(confirmDelete.id)}>Excluir</BtnDanger></FormActions>
          </Modal>
        </ModalOverlay>
      )}
    </div>
  );
}
