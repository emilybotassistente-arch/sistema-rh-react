import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Empresas from './pages/Empresas';
import Cargos from './pages/Cargos';
import Funcionarios from './pages/Funcionarios';
import FuncionarioForm from './pages/FuncionarioForm';
import FuncionarioDetalhe from './pages/FuncionarioDetalhe';
import Exames from './pages/Exames';
import Ferias from './pages/Ferias';
import Atestados from './pages/Atestados';
import Emprestimos from './pages/Emprestimos';
import EmprestimosHistorico from './pages/EmprestimosHistorico';
import EmprestimoDetalhe from './pages/EmprestimoDetalhe';
import ValeRefeicao from './pages/ValeRefeicao';
import ValeRefeicaoConfig from './pages/ValeRefeicaoConfig';
import ReajusteSalarial from './pages/ReajusteSalarial';
import RelatorioReajuste from './pages/RelatorioReajuste';
import PisoCargo from './pages/PisoCargo';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/cargos" element={<Cargos />} />
        <Route path="/funcionarios" element={<Funcionarios />} />
        <Route path="/funcionarios/novo" element={<FuncionarioForm />} />
        <Route path="/funcionarios/:id" element={<FuncionarioDetalhe />} />
        <Route path="/funcionarios/:id/editar" element={<FuncionarioForm />} />
        <Route path="/funcionarios/reajuste" element={<ReajusteSalarial />} />
        <Route path="/funcionarios/reajuste/relatorio" element={<RelatorioReajuste />} />
        <Route path="/funcionarios/pisos" element={<PisoCargo />} />
        <Route path="/exames" element={<Exames />} />
        <Route path="/ferias" element={<Ferias />} />
        <Route path="/atestados" element={<Atestados />} />
        <Route path="/emprestimos" element={<Emprestimos />} />
        <Route path="/emprestimos/historico" element={<EmprestimosHistorico />} />
        <Route path="/emprestimos/:id" element={<EmprestimoDetalhe />} />
        <Route path="/valerefeicao" element={<ValeRefeicao />} />
        <Route path="/valerefeicao/config" element={<ValeRefeicaoConfig />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
