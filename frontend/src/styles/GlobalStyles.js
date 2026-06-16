import { createGlobalStyle } from 'styled-components';

export const formataBRL = (valor) => {
  if (valor === null || valor === undefined || isNaN(valor)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
};

export const formataData = (data) => {
  if (!data) return '';
  const d = new Date(data + (data.includes('T') ? '' : 'T00:00:00'));
  return d.toLocaleDateString('pt-BR');
};

export const formataCPF = (cpf) => {
  if (!cpf) return '';
  const c = cpf.replace(/\D/g, '');
  return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formataRG = (rg) => {
  if (!rg) return '';
  const r = rg.replace(/\D/g, '');
  return r.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
};

export const formataTelefone = (tel) => {
  if (!tel) return '';
  const t = tel.replace(/\D/g, '');
  if (t.length === 11) return t.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (t.length === 10) return t.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return tel;
};

const GlobalStyles = createGlobalStyle`
  :root {
    --primary: #1a73e8;
    --primary-dark: #1557b0;
    --primary-light: #e8f0fe;
    --success: #0f9d58;
    --success-light: #e6f4ea;
    --warning: #f9ab00;
    --warning-light: #fef7e0;
    --danger: #ea4335;
    --danger-light: #fce8e6;
    --gray-50: #f8f9fa;
    --gray-100: #f1f3f4;
    --gray-200: #e8eaed;
    --gray-300: #dadce0;
    --gray-400: #bdc1c6;
    --gray-500: #9aa0a6;
    --gray-600: #80868b;
    --gray-700: #5f6368;
    --gray-800: #3c4043;
    --gray-900: #202124;
    --white: #ffffff;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.1);
    --shadow-md: 0 2px 8px rgba(0,0,0,0.12);
    --shadow-lg: 0 4px 16px rgba(0,0,0,0.15);
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --transition: all 0.2s ease;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: var(--gray-50);
    color: var(--gray-900);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: var(--primary);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  input, select, textarea, button {
    font-family: inherit;
  }
`;

export default GlobalStyles;
