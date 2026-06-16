import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getEmprestimo, deleteEmprestimo } from '../api';
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
const BtnDanger = styled.button`
  padding: 10px 20px; background: var(--danger); color: white; border: none;
  border-radius: var(--radius-md); font-size: 14px; cursor: pointer;
  &:hover { background: #d33426; }
`;
const Card = styled.div`
  background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200); padding: 32px; max-width: 700px;
`;
const InfoGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; `;
const InfoItem = styled.div`
  padding: 8px 0;
`;
const InfoLabel = styled.span`
  font-size: 12px; color: var(--gray-500); display: block; margin-bottom: 2px;
  text-transform: uppercase; letter-spacing: 0.5px;
`;
const InfoValue = styled.span`
  font-size: 14px; color: var(--gray-800); font-weight: 500;
`;
const Badge = styled.span`
  display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;
  background: ${({ status }) =>
    status === 'Pago' ? 'var(--success-light)' :
    status === 'Ativo' ? 'var(--primary-light)' :
    status === 'Atrasado' ? 'var(--danger-light)' : 'var(--gray-100)'};
  color: ${({ status }) =>
    status === 'Pago' ? 'var(--success)' :
    status === 'Ativo' ? 'var(--primary)' :
    status === 'Atrasado' ? 'var(--danger)' : 'var(--gray-600)'};
`;
const Section = styled.div` margin-bottom: 24px; `;
const SectionTitle = styled.h3`
  font-size: 16px; color: var(--gray-800); margin-bottom: 12px;
  display: flex; align-items: center; gap: 8px;
`;
const ActionsBar = styled.div` display: flex; gap: 8px; `;
const ModalOverlay = styled.div`
  position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
`;
const Modal = styled.div`
  background: white; border-radius: var(--radius-lg); padding: 24px;
  max-width: 400px; width: 90%; box-shadow: var(--shadow-lg);
`;
const ModalTitle = styled.h2` font-size: 18px; color: var(--gray-900); margin-bottom: 16px; `;
const ConfirmMessage = styled.p` font-size: 14px; color: var(--gray-700); margin-bottom: 20px; `;
const FormActions = styled.div` display: flex; justify-content: flex-end; gap: 8px; `;

export default function EmprestimoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [emprestimo, setEmprestimo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadEmprestimo = useCallback(async () => {
    try { setLoading(true); const data = await getEmprestimo(id); setEmprestimo(data); }
    catch (e) { showToast(e.message, 'error'); navigate('/emprestimos'); }
    finally { setLoading(false); }
  }, [id, showToast, navigate]);

  useEffect(() => { loadEmprestimo(); }, [loadEmprestimo]);

  const handleDelete = async () => {
    try { await deleteEmprestimo(id); showToast('Empréstimo excluído!'); navigate('/emprestimos'); }
    catch (e) { showToast(e.message, 'error'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: 'var(--gray-500)' }}>Carregando...</div>;
  if (!emprestimo) return null;

  return (
    <div>
      <PageHeader>
        <Title>
          <BtnBack onClick={() => navigate('/emprestimos')}>← Voltar</BtnBack>
          💵 Detalhes do Empréstimo
        </Title>
        <ActionsBar>
          <BtnPrimary onClick={() => navigate(`/funcionarios/${emprestimo.funcionario_id ? `${emprestimo.funcionario_id}/editar` : ''}`)}>✏️ Editar</BtnPrimary>
          <BtnDanger onClick={() => setShowConfirm(true)}>🗑️ Excluir</BtnDanger>
        </ActionsBar>
      </PageHeader>

      <Card>
        <Section>
          <SectionTitle>👤 Funcionário</SectionTitle>
          <InfoGrid>
            <InfoItem><InfoLabel>Nome</InfoLabel><InfoValue>{emprestimo.funcionario_nome || '-'}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Empresa</InfoLabel><InfoValue>{emprestimo.empresa_nome || '-'}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Status</InfoLabel><InfoValue><Badge status={emprestimo.status}>{emprestimo.status}</Badge></InfoValue></InfoItem>
          </InfoGrid>
        </Section>

        <Section>
          <SectionTitle>💰 Valores</SectionTitle>
          <InfoGrid>
            <InfoItem><InfoLabel>Valor Total</InfoLabel><InfoValue style={{ fontSize: 20, color: 'var(--primary)' }}>{formataBRL(emprestimo.valor)}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Valor da Parcela</InfoLabel><InfoValue>{formataBRL(emprestimo.valor_parcela)}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>Nº Parcelas</InfoLabel><InfoValue>{emprestimo.numero_parcelas}</InfoValue></InfoItem>
          </InfoGrid>
        </Section>

        <Section>
          <SectionTitle>📅 Datas</SectionTitle>
          <InfoGrid>
            <InfoItem><InfoLabel>Solicitação</InfoLabel><InfoValue>{formataData(emprestimo.data_solicitacao)}</InfoValue></InfoItem>
            <InfoItem><InfoLabel>1ª Parcela</InfoLabel><InfoValue>{emprestimo.data_primeira_parcela ? formataData(emprestimo.data_primeira_parcela) : '-'}</InfoValue></InfoItem>
          </InfoGrid>
        </Section>

        {emprestimo.finalidade && (
          <Section>
            <SectionTitle>📝 Finalidade</SectionTitle>
            <p style={{ fontSize: 14, color: 'var(--gray-700)' }}>{emprestimo.finalidade}</p>
          </Section>
        )}

        {emprestimo.observacoes && (
          <Section>
            <SectionTitle>📋 Observações</SectionTitle>
            <p style={{ fontSize: 14, color: 'var(--gray-700)', whiteSpace: 'pre-wrap' }}>{emprestimo.observacoes}</p>
          </Section>
        )}
      </Card>

      {showConfirm && (
        <ModalOverlay onClick={() => setShowConfirm(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>🗑️ Confirmar Exclusão</ModalTitle>
            <ConfirmMessage>Tem certeza que deseja excluir este empréstimo?</ConfirmMessage>
            <FormActions><BtnBack onClick={() => setShowConfirm(false)}>Cancelar</BtnBack><BtnDanger onClick={handleDelete}>Excluir</BtnDanger></FormActions>
          </Modal>
        </ModalOverlay>
      )}
    </div>
  );
}
