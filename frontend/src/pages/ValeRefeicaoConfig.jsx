import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getValeRefeicaoConfig, updateValeRefeicaoConfig } from '../api';
import { getEmpresas } from '../api';
import { useApp } from '../context/AppContext';
import { formataBRL } from '../styles/GlobalStyles';

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
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
const FormCard = styled.div`
  background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200); padding: 32px; max-width: 600px;
`;
const Form = styled.form` display: flex; flex-direction: column; gap: 20px; `;
const FormGroup = styled.div` flex: 1; `;
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
const FormActions = styled.div` display: flex; justify-content: flex-end; gap: 8px; padding-top: 16px; border-top: 1px solid var(--gray-200); `;
const InfoBox = styled.div`
  background: var(--primary-light); border-left: 4px solid var(--primary);
  padding: 12px 16px; border-radius: var(--radius-md); font-size: 13px; color: var(--gray-700);
`;

export default function ValeRefeicaoConfig() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [empresas, setEmpresas] = useState([]);
  const [configuracoes, setConfiguracoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [empData, configData] = await Promise.all([getEmpresas(), getValeRefeicaoConfig()]);
      setEmpresas(empData);
      if (configData && configData.length > 0) {
        setConfiguracoes(configData);
      } else {
        setConfiguracoes(empData.map(e => ({ empresa_id: e.id, empresa_nome: e.nome_fantasia || e.razao_social, valor_diario: '', ativo: true, id: null })));
      }
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleChange = (index, field, value) => {
    const updated = [...configuracoes];
    updated[index] = { ...updated[index], [field]: value };
    setConfiguracoes(updated);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      for (const config of configuracoes) {
        if (config.id) {
          await updateValeRefeicaoConfig(config.id, { valor_diario: config.valor_diario, ativo: config.ativo });
        }
      }
      showToast('Configurações salvas com sucesso!');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: 'var(--gray-500)' }}>Carregando...</div>;

  return (
    <div>
      <PageHeader>
        <Title>
          <BtnBack onClick={() => navigate('/valerefeicao')}>← Voltar</BtnBack>
          ⚙️ Configurar Vale Refeição
        </Title>
      </PageHeader>

      <FormCard>
        <InfoBox style={{ marginBottom: 20 }}>
          Configure o valor diário do vale refeição para cada empresa.
        </InfoBox>
        <Form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {configuracoes.map((config, index) => (
            <div key={config.empresa_id} style={{ padding: '16px 0', borderBottom: index < configuracoes.length - 1 ? '1px solid var(--gray-200)' : 'none' }}>
              <h4 style={{ marginBottom: 8, fontSize: 15, color: 'var(--gray-800)' }}>{config.empresa_nome}</h4>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                <FormGroup>
                  <Label>Valor Diário (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.valor_diario}
                    onChange={e => handleChange(index, 'valor_diario', e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', paddingBottom: 8 }}>
                    <input type="checkbox" checked={config.ativo !== false} onChange={e => handleChange(index, 'ativo', e.target.checked)} />
                    Ativo
                  </label>
                </FormGroup>
              </div>
            </div>
          ))}
          <FormActions>
            <BtnBack type="button" onClick={() => navigate('/valerefeicao')}>Cancelar</BtnBack>
            <BtnPrimary type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar Configurações'}</BtnPrimary>
          </FormActions>
        </Form>
      </FormCard>
    </div>
  );
}
