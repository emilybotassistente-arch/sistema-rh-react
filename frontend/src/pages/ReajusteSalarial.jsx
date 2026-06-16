import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getReajustes, createReajuste } from '../api';
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
const Badge = styled.span`
  display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;
  background: ${({ status }) => status === 'Aplicado' ? 'var(--success-light)' : 'var(--warning-light)'};
  color: ${({ status }) => status === 'Aplicado' ? 'var(--success)' : 'var(--warning)'};
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

export default function ReajusteSalarial() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [reajustes, setReajustes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [form, setForm] = useState({
    funcionario_id: '', empresa_id: '', percentual: '', valor_reajuste: '',
    data_reajuste: '', tipo: 'Percentual', motivo: '', status: 'Pendente',
  });

  const loadEmpresas = useCallback(async () => { try { setEmpresas(await getEmpresas()); } catch {} }, []);
  const loadFuncionarios = useCallback(async (empresaId) => { try { setFuncionarios(await getFuncionarios({ empresa_id: empresaId || undefined })); } catch {} }, []);
  const loadReajustes = useCallback(async () => {
    try { setLoading(true); setReajustes(await getReajustes({ empresa_id: filtroEmpresa || undefined })); }
    catch (e) { showToast(e.message, 'error'); } finally { setLoading(false); }
  }, [filtroEmpresa, showToast]);

  useEffect(() => { loadEmpresas(); }, [loadEmpresas]);
  useEffect(() => { loadReajustes(); }, [loadReajustes]);
  useEffect(() => { if (form.empresa_id) loadFuncionarios(form.empresa_id); else setFuncionarios([]); }, [form.empresa_id, loadFuncionarios]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const openNew = () => {
    setForm({ funcionario_id: '', empresa_id: '', percentual: '', valor_reajuste: '', data_reajuste: '', tipo: 'Percentual', motivo: '', status: 'Pendente' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createReajuste(form);
      showToast('Reajuste cadastrado!');
      setShowModal(false);
      loadReajustes();
    } catch (err) { showToast(err.message, 'error'); }
  };

  return (
    <div>
      <PageHeader>
        <Title>📈 Reajuste Salarial</Title>
        <div style={{ display: 'flex', gap: 8 }}>
          <BtnSecondary onClick={() => navigate('/funcionarios/reajuste/relatorio')}>📊 Relatório</BtnSecondary>
          <BtnPrimary onClick={openNew}>+ Novo Reajuste</BtnPrimary>
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
          reajustes.length === 0 ? <EmptyState>Nenhum reajuste registrado</EmptyState> :
          <Table>
            <thead>
              <tr><th>Funcionário</th><th>Empresa</th><th>Percentual</th><th>Valor Reajuste</th><th>Data</th><th>Tipo</th><th>Status</th></tr>
            </thead>
            <tbody>
              {reajustes.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.funcionario_nome}</strong></td>
                  <td>{r.empresa_nome || '-'}</td>
                  <td>{r.percentual ? `${r.percentual}%` : '-'}</td>
                  <td>{formataBRL(r.valor_reajuste)}</td>
                  <td>{formataData(r.data_reajuste)}</td>
                  <td>{r.tipo}</td>
                  <td><Badge status={r.status}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </Table>
        }
      </TableWrapper>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>➕ Novo Reajuste Salarial</ModalTitle>
            <Form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup><Label>Empresa</Label><Select name="empresa_id" value={form.empresa_id} onChange={handleChange}><option value="">Selecione...</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.nome_fantasia || e.razao_social}</option>)}</Select></FormGroup>
                <FormGroup><Label>Funcionário *</Label><Select name="funcionario_id" value={form.funcionario_id} onChange={handleChange} required><option value="">Selecione...</option>{funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}</Select></FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup><Label>Tipo</Label><Select name="tipo" value={form.tipo} onChange={handleChange}><option value="Percentual">Percentual</option><option value="Valor Fixo">Valor Fixo</option></Select></FormGroup>
                <FormGroup><Label>Percentual (%)</Label><Input name="percentual" type="number" step="0.01" value={form.percentual} onChange={handleChange} /></FormGroup>
                <FormGroup><Label>Valor (R$)</Label><Input name="valor_reajuste" type="number" step="0.01" value={form.valor_reajuste} onChange={handleChange} /></FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup><Label>Data Reajuste *</Label><Input name="data_reajuste" type="date" value={form.data_reajuste} onChange={handleChange} required /></FormGroup>
                <FormGroup><Label>Status</Label><Select name="status" value={form.status} onChange={handleChange}><option value="Pendente">Pendente</option><option value="Aplicado">Aplicado</option></Select></FormGroup>
              </FormRow>
              <FormGroup><Label>Motivo</Label><TextArea name="motivo" value={form.motivo} onChange={handleChange} /></FormGroup>
              <FormActions><BtnSecondary type="button" onClick={() => setShowModal(false)}>Cancelar</BtnSecondary><BtnPrimary type="submit">Criar</BtnPrimary></FormActions>
            </Form>
          </Modal>
        </ModalOverlay>
      )}
    </div>
  );
}
