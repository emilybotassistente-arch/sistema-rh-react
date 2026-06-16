import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getEventos } from '../api';
import { useApp } from '../context/AppContext';
import { getEmpresas } from '../api';
import { formataData } from '../styles/GlobalStyles';

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

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--gray-800);
  background: white;
  cursor: pointer;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px var(--primary-light);
  }
`;

const CalendarWrapper = styled.div`
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);

  .fc {
    font-family: inherit;
  }

  .fc-toolbar-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--gray-800);
  }

  .fc-button-primary {
    background: var(--primary);
    border-color: var(--primary);
    &:hover {
      background: var(--primary-dark);
      border-color: var(--primary-dark);
    }
  }

  .fc-daygrid-event {
    background: var(--primary);
    border: none;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    font-size: 12px;
    cursor: pointer;
  }

  .fc-day-today {
    background: var(--primary-light) !important;
  }

  .fc-daygrid-day-number {
    color: var(--gray-700);
    font-size: 14px;
  }

  .fc-col-header-cell-cushion {
    color: var(--gray-700);
    font-weight: 600;
    font-size: 13px;
  }
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
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-lg);
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  color: var(--gray-900);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModalBody = styled.div`
  margin-bottom: 20px;
`;

const ModalRow = styled.div`
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--gray-700);

  strong {
    min-width: 120px;
    color: var(--gray-800);
  }
`;

const ModalClose = styled.button`
  padding: 8px 20px;
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: var(--gray-200);
  }
`;

export default function Dashboard() {
  const { empresaSelecionada, setEmpresaSelecionada } = useApp();
  const [eventos, setEventos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const DATA_ATUAL = '2026-06-15';

  const loadEmpresas = useCallback(async () => {
    try {
      const data = await getEmpresas();
      setEmpresas(data);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
    }
  }, []);

  const loadEventos = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (empresaSelecionada) params.empresa_id = empresaSelecionada;
      const data = await getEventos(params);
      setEventos(
        data.map((ev) => ({
          id: ev.id,
          title: ev.titulo || ev.descricao || 'Evento',
          start: ev.data_evento || ev.data,
          end: ev.data_fim,
          backgroundColor: ev.cor || '#1a73e8',
          borderColor: ev.cor || '#1a73e8',
          extendedProps: ev,
        }))
      );
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    } finally {
      setLoading(false);
    }
  }, [empresaSelecionada]);

  useEffect(() => {
    loadEmpresas();
  }, [loadEmpresas]);

  useEffect(() => {
    loadEventos();
  }, [loadEventos]);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
  };

  const closeModal = () => setSelectedEvent(null);

  return (
    <div>
      <PageHeader>
        <Title>📊 Dashboard</Title>
        <FilterSelect
          value={empresaSelecionada || ''}
          onChange={(e) => setEmpresaSelecionada(e.target.value || null)}
        >
          <option value="">Todas as empresas</option>
          {empresas.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.nome_fantasia || emp.razao_social}
            </option>
          ))}
        </FilterSelect>
      </PageHeader>

      <CalendarWrapper>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={DATA_ATUAL}
          events={eventos}
          eventClick={handleEventClick}
          locale="pt-br"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          }}
          buttonText={{
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
          }}
          height="auto"
          dayMaxEvents={3}
          moreLinkText={(num) => `+${num} mais`}
          noEventsText="Nenhum evento encontrado"
        />
      </CalendarWrapper>

      {selectedEvent && (
        <ModalOverlay onClick={closeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>📅 {selectedEvent.titulo || 'Detalhes do Evento'}</ModalTitle>
            <ModalBody>
              <ModalRow>
                <strong>Data:</strong>
                <span>{formataData(selectedEvent.data_evento || selectedEvent.data)}</span>
              </ModalRow>
              {selectedEvent.descricao && (
                <ModalRow>
                  <strong>Descrição:</strong>
                  <span>{selectedEvent.descricao}</span>
                </ModalRow>
              )}
              {selectedEvent.empresa_nome && (
                <ModalRow>
                  <strong>Empresa:</strong>
                  <span>{selectedEvent.empresa_nome}</span>
                </ModalRow>
              )}
              {selectedEvent.tipo && (
                <ModalRow>
                  <strong>Tipo:</strong>
                  <span>{selectedEvent.tipo}</span>
                </ModalRow>
              )}
              {selectedEvent.status && (
                <ModalRow>
                  <strong>Status:</strong>
                  <span>{selectedEvent.status}</span>
                </ModalRow>
              )}
            </ModalBody>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ModalClose onClick={closeModal}>Fechar</ModalClose>
            </div>
          </Modal>
        </ModalOverlay>
      )}
    </div>
  );
}
