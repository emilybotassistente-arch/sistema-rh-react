import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getFuncionario, createFuncionario, updateFuncionario } from '../api';
import { getEmpresas } from '../api';
import { getCargos } from '../api';
import { useApp } from '../context/AppContext';

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

const FormCard = styled.div`
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  padding: 32px;
  max-width: 900px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const FormGroup = styled.div`
  flex: 1;
  min-width: 200px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 14px;
  transition: var(--transition);

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: white;
  transition: var(--transition);

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  transition: var(--transition);

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--gray-200);
`;

const BtnPrimary = styled.button`
  padding: 10px 24px;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BtnSecondary = styled.button`
  padding: 10px 24px;
  background: white;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: var(--gray-50);
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  color: var(--gray-800);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  gap: 8px;
`;

export default function FuncionarioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const isEditing = Boolean(id);
  const [empresas, setEmpresas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    email: '',
    telefone: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    empresa_id: '',
    cargo_id: '',
    data_admissao: '',
    data_demissao: '',
    salario: '',
    tipo_contrato: 'CLT',
    jornada_semanal: '44',
    ctps: '',
    serie_ctps: '',
    pis: '',
    conta_caixa: '',
    ativo: true,
    observacoes: '',
  });

  const loadEmpresas = useCallback(async () => {
    try {
      const data = await getEmpresas();
      setEmpresas(data);
      if (data.length > 0 && !isEditing) {
        setForm((prev) => ({ ...prev, empresa_id: data[0].id }));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, [isEditing, showToast]);

  const loadFuncionario = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getFuncionario(id);
      setForm({
        nome: data.nome || '',
        cpf: data.cpf || '',
        rg: data.rg || '',
        data_nascimento: data.data_nascimento || '',
        email: data.email || '',
        telefone: data.telefone || '',
        endereco: data.endereco || '',
        bairro: data.bairro || '',
        cidade: data.cidade || '',
        estado: data.estado || '',
        cep: data.cep || '',
        empresa_id: data.empresa_id || '',
        cargo_id: data.cargo_id || '',
        data_admissao: data.data_admissao || '',
        data_demissao: data.data_demissao || '',
        salario: data.salario || '',
        tipo_contrato: data.tipo_contrato || 'CLT',
        jornada_semanal: data.jornada_semanal || '44',
        ctps: data.ctps || '',
        serie_ctps: data.serie_ctps || '',
        pis: data.pis || '',
        conta_caixa: data.conta_caixa || '',
        ativo: data.ativo !== false,
        observacoes: data.observacoes || '',
      });
    } catch (err) {
      showToast(err.message, 'error');
      navigate('/funcionarios');
    }
  }, [id, showToast, navigate]);

  useEffect(() => {
    loadEmpresas();
  }, [loadEmpresas]);

  useEffect(() => {
    if (isEditing) loadFuncionario();
  }, [isEditing, loadFuncionario]);

  useEffect(() => {
    if (form.empresa_id) {
      getCargos(form.empresa_id)
        .then((data) => setCargos(data))
        .catch(() => setCargos([]));
    } else {
      setCargos([]);
    }
  }, [form.empresa_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateFuncionario(id, form);
        showToast('Funcionário atualizado com sucesso!');
      } else {
        await createFuncionario(form);
        showToast('Funcionário criado com sucesso!');
      }
      navigate('/funcionarios');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader>
        <Title>{isEditing ? '✏️ Editar Funcionário' : '➕ Novo Funcionário'}</Title>
        <BtnBack onClick={() => navigate('/funcionarios')}>← Voltar</BtnBack>
      </PageHeader>

      <FormCard>
        <Form onSubmit={handleSubmit}>
          {/* Dados Pessoais */}
          <SectionTitle>👤 Dados Pessoais</SectionTitle>
          <FormRow>
            <FormGroup style={{ flex: 2 }}>
              <Label>Nome Completo *</Label>
              <Input name="nome" value={form.nome} onChange={handleChange} required />
            </FormGroup>
            <FormGroup>
              <Label>CPF *</Label>
              <Input name="cpf" value={form.cpf} onChange={handleChange} required />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>RG</Label>
              <Input name="rg" value={form.rg} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <Label>Data de Nascimento</Label>
              <Input name="data_nascimento" type="date" value={form.data_nascimento} onChange={handleChange} />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup style={{ flex: 2 }}>
              <Label>Email</Label>
              <Input name="email" type="email" value={form.email} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <Label>Telefone</Label>
              <Input name="telefone" value={form.telefone} onChange={handleChange} />
            </FormGroup>
          </FormRow>

          {/* Endereço */}
          <SectionTitle>📍 Endereço</SectionTitle>
          <FormRow>
            <FormGroup style={{ flex: 2 }}>
              <Label>Endereço</Label>
              <Input name="endereco" value={form.endereco} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <Label>Bairro</Label>
              <Input name="bairro" value={form.bairro} onChange={handleChange} />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>Cidade</Label>
              <Input name="cidade" value={form.cidade} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <Label>Estado</Label>
              <Input name="estado" value={form.estado} onChange={handleChange} maxLength={2} />
            </FormGroup>
            <FormGroup>
              <Label>CEP</Label>
              <Input name="cep" value={form.cep} onChange={handleChange} />
            </FormGroup>
          </FormRow>

          {/* Dados Profissionais */}
          <SectionTitle>💼 Dados Profissionais</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Empresa *</Label>
              <Select name="empresa_id" value={form.empresa_id} onChange={handleChange} required>
                <option value="">Selecione...</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.nome_fantasia || emp.razao_social}</option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Cargo</Label>
              <Select name="cargo_id" value={form.cargo_id} onChange={handleChange}>
                <option value="">Selecione...</option>
                {cargos.map((cargo) => (
                  <option key={cargo.id} value={cargo.id}>{cargo.nome}</option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>Data de Admissão *</Label>
              <Input name="data_admissao" type="date" value={form.data_admissao} onChange={handleChange} required />
            </FormGroup>
            <FormGroup>
              <Label>Data de Demissão</Label>
              <Input name="data_demissao" type="date" value={form.data_demissao} onChange={handleChange} />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>Salário (R$)</Label>
              <Input name="salario" type="number" step="0.01" value={form.salario} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <Label>Tipo de Contrato</Label>
              <Select name="tipo_contrato" value={form.tipo_contrato} onChange={handleChange}>
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="Estágio">Estágio</option>
                <option value="Temporário">Temporário</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Jornada Semanal (h)</Label>
              <Input name="jornada_semanal" type="number" value={form.jornada_semanal} onChange={handleChange} />
            </FormGroup>
          </FormRow>

          {/* Documentos */}
          <SectionTitle>📄 Documentos</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>CTPS</Label>
              <Input name="ctps" value={form.ctps} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <Label>Série CTPS</Label>
              <Input name="serie_ctps" value={form.serie_ctps} onChange={handleChange} />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>PIS</Label>
              <Input name="pis" value={form.pis} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <Label>Conta Caixa</Label>
              <Input name="conta_caixa" value={form.conta_caixa} onChange={handleChange} />
            </FormGroup>
          </FormRow>

          {/* Observações */}
          <SectionTitle>📝 Observações</SectionTitle>
          <FormGroup>
            <TextArea name="observacoes" value={form.observacoes} onChange={handleChange} placeholder="Observações..." />
          </FormGroup>

          {/* Status */}
          <FormGroup>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" name="ativo" checked={form.ativo} onChange={handleChange} />
              Funcionário ativo
            </label>
          </FormGroup>

          <FormActions>
            <BtnSecondary type="button" onClick={() => navigate('/funcionarios')}>Cancelar</BtnSecondary>
            <BtnPrimary type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Cadastrar Funcionário'}
            </BtnPrimary>
          </FormActions>
        </Form>
      </FormCard>
    </div>
  );
}
