import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getRelatorioReajuste } from '../api';
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
  border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: 14px; cursor: pointer;
  &:hover { background: var(--gray-50); }
`;
const BtnPrimary = styled.button`
  padding: 10px 20px; background: var(--primary); color: white; border: none;
  border-radius: var(--radius-md); font-size: 14px; font-weight: 500; cursor: pointer;
  &:hover { background: var(--primary-dark); }
`;
const FilterBar = styled.div` display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: flex-end; `;
const FilterSelect = styled.select`
  padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius-md);
  font-size: 14px; color: var(--gray-800); background: white; cursor: pointer; min-width: 250px;
  &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-light); }
`;
const DateInput = styled.input`
  padding: 8px 12px; border: 1px solid var(--gray-300); border-radius: var(--radius-md);
  font-size: 14px; color: var(--gray-800);
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

export default function RelatorioReajuste() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [relatorio, setRelatorio] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const loadEmpresas = useCallback(async () => { try { setEmpresas(await getEmpresas()); } catch {} }, []);

  useEffect(() => { loadEmpresas(); }, [loadEmpresas]);

  const loadRelatorio = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroEmpresa) params.empresa_id = filtroEmpresa;
      if (dataInicio) params.data_inicio = dataInicio;
      if (dataFim) params.data_fim = dataFim;
      setRelatorio(await getRelatorioReajuste(params));
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [filtroEmpresa, dataInicio, dataFim, showToast]);

  const totalReajustes = relatorio.reduce((s, r) => s + Number(r.valor_reajuste || 0), 0);
  const mediaPercentual = relatorio.filter(r => r.percentual).reduce((s, r, _, arr) => s + Number(r.percentual || 0) / arr.length, 0);

  return (
    <div>
      <PageHeader>
        <Title>
          <BtnBack onClick={() => navigate('/funcionarios/reajuste')}>← Voltar</BtnBack>
          📊 Relatório de Reajustes
        </Title>
      </PageHeader>

      <StatsCard>
        <StatsGrid>
          <StatItem color="var(--primary)"><h3>{relatorio.length}</h3><p>Reajustes</p></StatItem>
          <StatItem color="var(--success)"><h3>{formataBRL(totalReajustes)}</h3><p>Total em Reajustes</p></StatItem>
          <StatItem color="var(--warning)"><h3>{mediaPercentual ? `${mediaPercentual.toFixed(2)}%` : '0%'}</h3><p>Média Percentual</p></StatItem>
        </StatsGrid>
      </StatsCard>

      <FilterBar>
        <FilterSelect value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)}>
          <option value="">Todas as empresas</option>
          {empresas.map(e => <option key={e.id} value={e.id}>{e.nome_fantasia || e.razao_social}</option>)}
        </FilterSelect>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--gray-500)', marginBottom: 2 }}>Data Início</label>
          <DateInput type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--gray-500)', marginBottom: 2 }}>Data Fim</label>
          <DateInput type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
        </div>
        <BtnPrimary onClick={loadRelatorio}>🔍 Filtrar</BtnPrimary>
      </FilterBar>

      <TableWrapper>
        {loading ? <EmptyState>Carregando...</EmptyState> :
          relatorio.length === 0 ? <EmptyState>Nenhum resultado encontrado. Clique em "Filtrar" para gerar o relatório.</EmptyState> :
          <Table>
            <thead>
              <tr><th>Funcionário</th><th>Empresa</th><th>Percentual</th><th>Valor</th><th>Data</th><th>Tipo</th><th>Status</th></tr>
            </thead>
            <tbody>
              {relatorio.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.funcionario_nome}</strong></td>
                  <td>{r.empresa_nome || '-'}</td>
                  <td>{r.percentual ? `${r.percentual}%` : '-'}</td>
                  <td>{formataBRL(r.valor_reajuste)}</td>
                  <td>{formataData(r.data_reajuste)}</td>
                  <td>{r.tipo}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        }
      </TableWrapper>
    </div>
  );
}
