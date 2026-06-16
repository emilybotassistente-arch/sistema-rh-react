import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getFuncionario, deleteFuncionario } from '../api';
import { useApp } from '../context/AppContext';
import { formataData, formataCPF, formataBRL, formataTelefone } from '../styles/GlobalStyles';

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

const BtnBack = styled.button`
  padding: 10px 20px;
  background: white;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: var(--gray-50);
  }
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

  &:hover {
    background: var(--primary-dark);
  }
`;

const BtnDanger = styled.button`
  padding: 10px 20px;
  background: var(--danger);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: #d33426;
  }
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  padding: 32px;
  max-width: 900px;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--gray-200);
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  flex-shrink: 0;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h2`
  font-size: 22px;
  color: var(--gray-900);
  margin-bottom: 4px;
`;

const ProfileSubtitle = styled.p`
  color: var(--gray-600);
  font-size: 14px;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ ativo }) => (ativo ? 'var(--success-light)' : 'var(--danger-light)')};
  color: ${({ ativo }) => (ativo ? 'var(--success)' : 'var(--danger)')};
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  color: var(--gray-800);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
`;

const InfoItem = styled.div`
  padding: 8px 0;
`;

const InfoLabel = styled.span`
  font-size: 12px;
  color: var(--gray-500);
  display: block;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: var(--gray-800);
  font-weight: 500;
`;

const ActionsBar = styled.div`
  display: flex;
  gap: 8px;
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
  max-width: 400px;
  width: 90%;
  box-shadow: var(--shadow-lg);
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  color: var(--gray-900);
  margin-bottom: 16px;
`;

const ConfirmMessage = styled.p`
  font-size: 14px;
  color: var(--gray-700);
  margin-bottom: 20px;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export default function FuncionarioDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [funcionario, setFuncionario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadFuncionario = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFuncionario(id);
      setFuncionario(data);
    } catch (err) {
      showToast(err.message, 'error');
      navigate('/funcionarios');
    } finally {
      setLoading(false);
    }
  }, [id, showToast, navigate]);

  useEffect(() => { loadFuncionario(); }, [loadFuncionario]);

  const handleDelete = async () => {
    try {
      await deleteFuncionario(id);
      showToast('Funcionário excluído com sucesso!');
      navigate('/funcionarios');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: 'var(--gray-500)' }}>Carregando...</div>;
  if (!funcionario) return null;

  return (
    <div>
      <PageHeader>
        <Title>
          <BtnBack onClick={() => navigate('/funcionarios')}>← Voltar</BtnBack>
          {funcionario.nome}
        </Title>
        <ActionsBar>
          <BtnPrimary onClick={() => navigate(`/funcionarios/${id}/editar`)}>✏️ Editar</BtnPrimary>
          <BtnDanger onClick={() => setShowConfirm(true)}>🗑️ Excluir</BtnDanger>
        </ActionsBar>
      </PageHeader>

      <ProfileCard>
        <ProfileHeader>
          <Avatar>{funcionario.nome?.charAt(0)?.toUpperCase() || '?'}</Avatar>
          <ProfileInfo>
            <ProfileName>{funcionario.nome}</ProfileName>
            <ProfileSubtitle>
              {funcionario.cargo_nome || 'Sem cargo'} · {funcionario.empresa_nome || 'Sem empresa'}
            </ProfileSubtitle>
            <div style={{ marginTop: 8 }}>
              <Badge ativo={funcionario.ativo !== false}>
                {funcionario.ativo !== false ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </ProfileInfo>
        </ProfileHeader>

        {/* Dados Pessoais */}
        <Section>
          <SectionTitle>👤 Dados Pessoais</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>CPF</InfoLabel>
              <InfoValue>{formataCPF(funcionario.cpf)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>RG</InfoLabel>
              <InfoValue>{funcionario.rg || '-'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Data de Nascimento</InfoLabel>
              <InfoValue>{formataData(funcionario.data_nascimento)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Email</InfoLabel>
              <InfoValue>{funcionario.email || '-'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Telefone</InfoLabel>
              <InfoValue>{formataTelefone(funcionario.telefone) || '-'}</InfoValue>
            </InfoItem>
          </InfoGrid>
        </Section>

        {/* Endereço */}
        <Section>
          <SectionTitle>📍 Endereço</SectionTitle>
          <InfoGrid>
            <InfoItem style={{ gridColumn: '1 / -1' }}>
              <InfoValue>
                {[funcionario.endereco, funcionario.bairro, funcionario.cidade, funcionario.estado, funcionario.cep]
                  .filter(Boolean)
                  .join(', ') || 'Não informado'}
              </InfoValue>
            </InfoItem>
          </InfoGrid>
        </Section>

        {/* Dados Profissionais */}
        <Section>
          <SectionTitle>💼 Dados Profissionais</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Matrícula</InfoLabel>
              <InfoValue>{funcionario.matricula || '-'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Empresa</InfoLabel>
              <InfoValue>{funcionario.empresa_nome || '-'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Cargo</InfoLabel>
              <InfoValue>{funcionario.cargo_nome || '-'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Data de Admissão</InfoLabel>
              <InfoValue>{formataData(funcionario.data_admissao)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Data de Demissão</InfoLabel>
              <InfoValue>{funcionario.data_demissao ? formataData(funcionario.data_demissao) : '-'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Salário</InfoLabel>
              <InfoValue>{formataBRL(funcionario.salario)}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Tipo de Contrato</InfoLabel>
              <InfoValue>{funcionario.tipo_contrato || 'CLT'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Jornada Semanal</InfoLabel>
              <InfoValue>{funcionario.jornada_semanal || '44'}h</InfoValue>
            </InfoItem>
          </InfoGrid>
        </Section>

        {/* Documentos */}
        <Section>
          <SectionTitle>📄 Documentos</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>CTPS</InfoLabel>
              <InfoValue>{funcionario.ctps || '-'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Série CTPS</InfoLabel>
              <InfoValue>{funcionario.serie_ctps || '-'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>PIS</InfoLabel>
              <InfoValue>{funcionario.pis || '-'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Conta Caixa</InfoLabel>
              <InfoValue>{funcionario.conta_caixa || '-'}</InfoValue>
            </InfoItem>
          </InfoGrid>
        </Section>

        {/* Observações */}
        {funcionario.observacoes && (
          <Section>
            <SectionTitle>📝 Observações</SectionTitle>
            <p style={{ fontSize: 14, color: 'var(--gray-700)', whiteSpace: 'pre-wrap' }}>{funcionario.observacoes}</p>
          </Section>
        )}
      </ProfileCard>

      {showConfirm && (
        <ModalOverlay onClick={() => setShowConfirm(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>🗑️ Confirmar Exclusão</ModalTitle>
            <ConfirmMessage>
              Tem certeza que deseja excluir o funcionário <strong>{funcionario.nome}</strong>?
            </ConfirmMessage>
            <FormActions>
              <BtnBack onClick={() => setShowConfirm(false)}>Cancelar</BtnBack>
              <BtnDanger onClick={handleDelete}>Excluir</BtnDanger>
            </FormActions>
          </Modal>
        </ModalOverlay>
      )}
    </div>
  );
}
