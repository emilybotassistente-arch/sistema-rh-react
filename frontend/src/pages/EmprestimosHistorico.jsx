import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getEmprestimosHistorico } from '../api';
import { getEmpresas } from '../api';
import { useApp } from '../context/AppContext';
import { formataData, formataBRL } from '../styles/GlobalStyles';

const PageHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
`;
const Title = styled.h1`
  font-size: 24px; color: var(--gray-900); display: flex; align-items: center; gap: 10px;
`;
const BtnBack = styled.button`
  padding: 10px 20px; background: white; color: var(--gray-700);
  border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: 14px;
  cursor: pointer; transition: var(--transition); display: flex; align-items: center; gap: 6px;
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
  background: ${({ status }) =>
    status === 'Pago' ? 'var(--success-light)' :
    status === 'Ativo' ? 'var(--primary-light)' :
    status === 'Atrasado' ? 'var(--danger-light)' : 'var(--gray-100)'};
  color: ${({ status }) =>
    status === 'Pago' ? 'var(--success)' :
    status === 'Ativo' ? 'var(--primary)' :
    status === 'Atrasado' ? 'var(--danger)' : 'var(--gray-600)'};
`;
const StatsCard = styled.div`
  background: white; border-radius: var(--radius-lg); padding: 20px;
  border: 1px solid var(--gray-200); box-shadow: var(--shadow-sm); margin-bottom: 20px;
`;
const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;
`;
const StatItem = styled.div`
  text-align: center; padding: 12px;
  h3 { font-size: 24px; color: ${({ color }) => color || 'var(--primary)'}; margin-bottom: 4px; }
  p { font-size: 13px; color: var(--gray-600); text-transform: uppercase; letter-spacing: 0.5px; }
`;
const EmptyState = styled.div` text-align: center; padding: 48px; color: var(--gray-500); font-size: 16px; `;

export default function EmprestimosHistorico() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [historico, setHistorico] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEmpresa, setFiltroEmpresa] = useState('');

  const loadEmpresas = useCallback(async () => { try { setEmpresas(await getEmpresas()); } catch {} }, []);
  const loadHistorico = useCallback(async () => {
    try { setLoading(true); setHistorico(await getEmprestimosHistorico({ empresa_id: filtroEmpresa || undefined })); }
    catch (e) { showToast(e.message, 'error'); } finally { setLoading(false); }
  }, [filtroEmpresa, showToast]);

  useEffect(() => { loadEmpresas(); }, [loadEmpresas]);
  useEffect(() => { loadHistorico(); }, [loadHistorico]);

  const totalAtivo = historico.filter(e => e.status === 'Ativo' || e.status === 'Atrasado').reduce((s, e) => s + Number(e.valor || 0), 0);
  const totalPago = historico.filter(e => e.status === 'Pago').reduce((s, e) => s + Number(e.valor || 0), 0);
  const ativos = historico.filter(e => e.status === 'Ativo' || e.status === 'Atrasado').length;

  return (
    <div>
      <PageHeader>
        <Title>
          <BtnBack onClick={() => navigate('/emprestimos')}>← Voltar</BtnBack>
          📊 Histórico de Empréstimos
        </Title>
      </PageHeader>

      <StatsCard>
        <StatsGrid>
          <StatItem color="var(--primary)">
            <h3>{ativos}</h3>
            <p>Empréstimos Ativos</p>
          </StatItem>
          <StatItem color="var(--success)">
            <h3>{formataBRL(totalPago)}</h3>
            <p>Total Pago</p>
          </StatItem>
          <StatItem color="var(--warning)">
            <h3>{formataBRL(totalAtivo)}</h3>
            <p>Total a Receber</p>
          </StatItem>
          <StatItem color="var(--gray-800)">
            <h3>{historico.length}</h3>
            <p>Total de Empréstimos</p>
          </StatItem>
        </StatsGrid>
      </StatsCard>

      <FilterBar>
        <FilterSelect value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)}>
          <option value="">Todas as empresas</option>
          {empresas.map(e => <option key={e.id} value={e.id}>{e.nome_fantasia || e.razao_social}</option>)}
        </FilterSelect>
      </FilterBar>

      <TableWrapper>
        {loading ? <EmptyState>Carregando...</EmptyState> :
          historico.length === 0 ? <EmptyState>Nenhum registro encontrado</EmptyState> :
          <Table>
            <thead>
              <tr><th>Funcionário</th><th>Empresa</th><th>Valor</th><th>Parcelas</th><th>Status</th><th>Solicitação</th><th>Pagamento</th></tr>
            </thead>
            <tbody>
              {historico.map(h => (
                <tr key={h.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/emprestimos/${h.id}`)}>
                  <td><strong>{h.funcionario_nome}</strong></td>
                  <td>{h.empresa_nome || '-'}</td>
                  <td>{formataBRL(h.valor)}</td>
                  <td>{h.numero_parcelas}x {formataBRL(h.valor_parcela)}</td>
                  <td><Badge status={h.status}>{h.status}</Badge></td>
                  <td>{formataData(h.data_solicitacao)}</td>
                  <td>{formataData(h.data_primeira_parcela)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        }
      </TableWrapper>
    </div>
  );
}
