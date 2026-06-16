import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  padding: 0 24px;
  display: flex;
  align-items: center;
  height: 60px;
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavBrand = styled(Link)`
  font-size: 20px;
  font-weight: 700;
  color: white;
  text-decoration: none;
  margin-right: 32px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    text-decoration: none;
    opacity: 0.9;
  }
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  gap: 4px;
  align-items: center;
  height: 100%;
`;

const NavItem = styled.li`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition);
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    text-decoration: none;
    color: white;
  }
`;

const DropdownTrigger = styled.button`
  color: rgba(255, 255, 255, 0.9);
  background: none;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  &::after {
    content: '▾';
    font-size: 10px;
    margin-left: 4px;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  padding: 8px 0;
  opacity: ${({ open }) => (open ? 1 : 0)};
  visibility: ${({ open }) => (open ? 'visible' : 'hidden')};
  transform: ${({ open }) => (open ? 'translateY(0)' : 'translateY(-8px)')};
  transition: var(--transition);
  z-index: 1001;
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 10px 16px;
  color: var(--gray-800);
  text-decoration: none;
  font-size: 14px;
  transition: var(--transition);

  &:hover {
    background: var(--primary-light);
    color: var(--primary);
    text-decoration: none;
  }
`;

export default function Navbar() {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <Nav>
      <NavBrand to="/">📋 RH Sistema</NavBrand>
      <NavList>
        <NavItem>
          <NavLink to="/" style={isActive('/') && location.pathname === '/' ? { background: 'rgba(255,255,255,0.2)', color: 'white' } : {}}>
            📊 Dashboard
          </NavLink>
        </NavItem>

        {/* Cadastros */}
        <NavItem ref={openDropdown === 'cadastros' ? dropdownRef : null}>
          <DropdownTrigger onClick={() => toggleDropdown('cadastros')}>📁 Cadastros</DropdownTrigger>
          <Dropdown open={openDropdown === 'cadastros'}>
            <DropdownItem to="/empresas">🏢 Empresas</DropdownItem>
            <DropdownItem to="/cargos">📋 Cargos</DropdownItem>
            <DropdownItem to="/funcionarios">👥 Funcionários</DropdownItem>
          </Dropdown>
        </NavItem>

        {/* Exames */}
        <NavItem>
          <NavLink to="/exames" style={isActive('/exames') ? { background: 'rgba(255,255,255,0.2)', color: 'white' } : {}}>
            🩺 Exames
          </NavLink>
        </NavItem>

        {/* Pessoal */}
        <NavItem ref={openDropdown === 'pessoal' ? dropdownRef : null}>
          <DropdownTrigger onClick={() => toggleDropdown('pessoal')}>👤 Pessoal</DropdownTrigger>
          <Dropdown open={openDropdown === 'pessoal'}>
            <DropdownItem to="/ferias">🏖️ Férias</DropdownItem>
            <DropdownItem to="/atestados">📄 Atestados</DropdownItem>
          </Dropdown>
        </NavItem>

        {/* Financeiro */}
        <NavItem ref={openDropdown === 'financeiro' ? dropdownRef : null}>
          <DropdownTrigger onClick={() => toggleDropdown('financeiro')}>💰 Financeiro</DropdownTrigger>
          <Dropdown open={openDropdown === 'financeiro'}>
            <DropdownItem to="/emprestimos">💵 Empréstimos</DropdownItem>
            <DropdownItem to="/valerefeicao">🍽️ Vale Refeição</DropdownItem>
            <DropdownItem to="/funcionarios/reajuste">📈 Reajuste Salarial</DropdownItem>
            <DropdownItem to="/funcionarios/pisos">📊 Piso por Cargo</DropdownItem>
          </Dropdown>
        </NavItem>
      </NavList>
    </Nav>
  );
}
