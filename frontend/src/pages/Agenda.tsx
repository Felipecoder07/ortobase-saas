import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, X, Edit2, UserMinus, CheckCircle2, ChevronDown, Search, User } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { maskCurrency, maskNumber, parseCurrency } from '../utils/masks';

interface Appointment {
  id: string;
  date: string;
  durationInMinutes: number;
  serviceType: string;
  status: string;
  patient: { name: string; phone: string };
  dentist: { name: string };
}

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    SCHEDULED: { label: 'Agendada', cls: 'badge badge-blue' },
    CONFIRMED: { label: 'Confirmada', cls: 'badge badge-purple' },
    COMPLETED: { label: 'Realizada', cls: 'badge badge-green' },
    CANCELED: { label: 'Cancelada', cls: 'badge badge-red' },
    NO_SHOW: { label: 'Faltou', cls: 'badge badge-amber' },
  };
  const s = map[status] || { label: status, cls: 'badge badge-blue' };
  return <span className={s.cls}>{s.label}</span>;
};

const formatTime = (iso: string) => {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const SearchableSelect = ({ options, value, onChange, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOption = options.find((o: any) => o.id === value);
  const filteredOptions = options.filter((o: any) => o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        className={`form-input ${isOpen ? 'active-select' : ''}`}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
          borderColor: isOpen ? 'var(--primary)' : 'var(--border)',
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none',
          transition: 'all 0.2s ease',
          background: 'var(--card-bg)'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          fontWeight: selectedOption ? 500 : 400
        }}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {selectedOption && (
            <div
              onClick={(e) => { e.stopPropagation(); onChange(''); setSearch(''); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', padding: '2px', borderRadius: '50%'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-bg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <X size={14} />
            </div>
          )}
          <ChevronDown size={16} style={{ color: isOpen ? 'var(--primary)' : 'var(--text-muted)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
        </div>
      </div>

      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setIsOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: '100%',
            background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px',
            zIndex: 1000, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeIn 0.15s ease-out'
          }}>
            <div style={{ padding: '10px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                autoFocus
                type="text"
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%', border: 'none', background: 'transparent', outline: 'none',
                  fontSize: '13.5px', color: 'var(--text-primary)'
                }}
              />
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
              {filteredOptions.length === 0 ? (
                <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Nenhum resultado encontrado
                </div>
              ) : (
                filteredOptions.map((o: any) => (
                  <div
                    key={o.id}
                    style={{
                      padding: '10px 12px', cursor: 'pointer', fontSize: '13.5px', borderRadius: '6px',
                      background: value === o.id ? 'var(--blue-bg)' : 'transparent',
                      color: value === o.id ? 'var(--primary)' : 'var(--text-primary)',
                      fontWeight: value === o.id ? 600 : 400,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: '2px'
                    }}
                    onClick={() => { onChange(o.id); setIsOpen(false); setSearch(''); }}
                    onMouseEnter={(e) => { if (value !== o.id) e.currentTarget.style.background = 'var(--bg)'; }}
                    onMouseLeave={(e) => { if (value !== o.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {o.name}
                    {value === o.id && <Check size={14} />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const MultiSearchableSelect = ({ options, values, onChange, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOptions = options.filter((o: any) => values.includes(o.id));
  const filteredOptions = options.filter((o: any) => o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        className={`form-input ${isOpen ? 'active-select' : ''}`}
        style={{
          display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '42px', alignItems: 'center', cursor: 'pointer',
          borderColor: isOpen ? 'var(--primary)' : 'var(--border)',
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none',
          transition: 'all 0.2s ease',
          background: 'var(--card-bg)',
          padding: selectedOptions.length > 0 ? '4px 8px' : '0px 10px'
        }}
        onClick={() => setIsOpen(true)}
      >
        {selectedOptions.length === 0 && (
          <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>
        )}

        {selectedOptions.map((opt: any) => (
          <div key={opt.id} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--blue-bg)', color: 'var(--primary)',
            padding: '4px 10px', borderRadius: '16px', fontSize: '13px', fontWeight: 500
          }}>
            {opt.name}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onChange(values.filter((v: string) => v !== opt.id));
              }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '2px', borderRadius: '50%' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'inherit'; }}
            >
              <X size={12} />
            </div>
          </div>
        ))}

        <div style={{ flex: 1, minWidth: '30px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <ChevronDown size={16} style={{ color: isOpen ? 'var(--primary)' : 'var(--text-muted)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} />
        </div>
      </div>

      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setIsOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: '100%',
            background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px',
            zIndex: 1000, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeIn 0.15s ease-out'
          }}>
            <div style={{ padding: '10px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                autoFocus
                type="text"
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%', border: 'none', background: 'transparent', outline: 'none',
                  fontSize: '13.5px', color: 'var(--text-primary)'
                }}
              />
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
              {filteredOptions.length === 0 ? (
                <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Nenhum resultado encontrado
                </div>
              ) : (
                filteredOptions.map((o: any) => {
                  const isSelected = values.includes(o.id);
                  return (
                    <div
                      key={o.id}
                      style={{
                        padding: '10px 12px', cursor: 'pointer', fontSize: '13.5px', borderRadius: '6px',
                        background: isSelected ? 'var(--blue-bg)' : 'transparent',
                        color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                        fontWeight: isSelected ? 600 : 400,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: '2px'
                      }}
                      onClick={() => {
                        if (isSelected) {
                          onChange(values.filter((v: string) => v !== o.id));
                        } else {
                          onChange([...values, o.id]);
                        }
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg)'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {o.name}
                      {isSelected && <Check size={14} />}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Agenda: React.FC = () => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [selectedDentist, setSelectedDentist] = useState<string>('');

  // Daily view state
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  });

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { showToast } = useToast();
  const calendarRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    patientId: '', dentistId: '', date: '', time: '', durationInMinutes: 30, serviceType: '', price: '', procedureIds: [] as string[]
  });

  const openNewModal = (dateStr?: string) => {
    setEditId(null);
    let date = '';
    let time = '';
    if (dateStr) {
      const d = new Date(dateStr);
      // Pega data local para os inputs
      date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (dateStr.includes('T')) {
        time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      }
    } else {
      date = currentDate;
    }
    setFormData({ patientId: '', dentistId: '', date, time, durationInMinutes: 30, serviceType: '', price: '', procedureIds: [] });
    setShowModal(true);
  };

  const openEditModal = (appt: any) => {
    setEditId(appt.id);
    const d = new Date(appt.date);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    setFormData({
      patientId: appt.patientId,
      dentistId: appt.dentistId,
      date: dateStr,
      time: timeStr,
      durationInMinutes: appt.durationInMinutes,
      serviceType: appt.serviceType || '',
      price: appt.price ? maskCurrency(appt.price.toFixed(2).replace('.', '')) : '',
      procedureIds: appt.procedures?.map((p: any) => p.id) || []
    });
    setShowModal(true);
  };

  const fetchData = async (startStr?: string, endStr?: string) => {
    try {
      let url = '';
      if (startStr && endStr) {


        url = `/appointments?start=${startStr}&end=${endStr}`;
      } else {
        // Para visão diária, calcula o start e end em ISO strings para cobrir as 24h locais
        const [year, month, day] = currentDate.split('-');
        const startOfDay = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0).toISOString();
        const endOfDay = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59).toISOString();
        url = `/appointments?start=${startOfDay}&end=${endOfDay}`;
      }

      if (selectedDentist) {
        url += `&dentistId=${selectedDentist}`;
      }

      const [apptRes, patRes, dentRes, procRes] = await Promise.all([
        api.get(url),
        api.get('/patients'),
        api.get('/dentists'),
        api.get('/procedures')
      ]);
      setAppointments(apptRes.data);
      setPatients(patRes.data);
      setDentists(dentRes.data);
      setProcedures(procRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (viewMode === 'day') {
      fetchData();
    }
  }, [currentDate, viewMode, selectedDentist]);

  useEffect(() => {
    if (calendarRef.current && viewMode !== 'day') {
      const api = calendarRef.current.getApi();
      if (viewMode === 'week' && api.view.type !== 'timeGridWeek') {
        api.changeView('timeGridWeek');
      } else if (viewMode === 'month' && api.view.type !== 'dayGridMonth') {
        api.changeView('dayGridMonth');
      }
    }
  }, [viewMode]);

  const handleDatesSet = (arg: any) => {
    if (viewMode !== 'day') {
      fetchData(arg.startStr, arg.endStr);
    }
  };

  useEffect(() => {
    if (viewMode !== 'day' && calendarRef.current) {
      const view = calendarRef.current.getApi().view;
      fetchData(view.activeStart.toISOString(), view.activeEnd.toISOString());
    }
  }, [selectedDentist]);

  const handleSave = async () => {
    if (!formData.patientId || !formData.dentistId || !formData.date || !formData.time || !formData.durationInMinutes) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Usando Date no timezone local
      const [year, month, day] = formData.date.split('-');
      const [hours, minutes] = formData.time.split(':');
      const dateObj = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));

      const payload = {
        patientId: formData.patientId,
        dentistId: formData.dentistId,
        date: dateObj.toISOString(),
        durationInMinutes: Number(formData.durationInMinutes),
        serviceType: formData.serviceType,
        price: formData.price ? parseCurrency(formData.price) : 0,
        procedureIds: formData.procedureIds.length > 0 ? formData.procedureIds : undefined,
      };

      if (editId) {
        await api.put(`/appointments/${editId}`, payload);
        showToast('Consulta atualizada com sucesso!', 'success');
      } else {
        await api.post('/appointments', payload);
        showToast('Consulta agendada com sucesso!', 'success');
      }
      setShowModal(false);
      setEditId(null);

      if (viewMode === 'day') {
        fetchData();
      } else if (calendarRef.current) {
        const view = calendarRef.current.getApi().view;
        fetchData(view.activeStart.toISOString(), view.activeEnd.toISOString());
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao agendar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      showToast('Status atualizado!', 'success');

      if (viewMode === 'day') {
        fetchData();
      } else if (calendarRef.current) {
        const view = calendarRef.current.getApi().view;
        fetchData(view.activeStart.toISOString(), view.activeEnd.toISOString());
      }
    } catch { showToast('Erro ao atualizar.', 'error'); }
  };

  const handleEventDrop = async (info: any) => {
    const { event, revert } = info;
    const originalAppt = event.extendedProps;

    let newStart = new Date(event.start);
    let minutes = newStart.getMinutes();
    
    // Arredonda para o múltiplo de 5 mais próximo
    const remainder = minutes % 5;
    if (remainder !== 0) {
      if (remainder >= 3) minutes += (5 - remainder);
      else minutes -= remainder;
      newStart.setMinutes(minutes);
      newStart.setSeconds(0);
      newStart.setMilliseconds(0);
    }

    const novaDataIso = newStart.toISOString();

    try {
      const payload = {
        patientId: originalAppt.patientId,
        dentistId: originalAppt.dentistId,
        date: novaDataIso,
        durationInMinutes: originalAppt.durationInMinutes,
        serviceType: originalAppt.serviceType,
        price: originalAppt.price,
        procedureIds: originalAppt.procedures?.map((p: any) => p.id) || []
      };

      await api.put(`/appointments/${originalAppt.id}`, payload);
      showToast('Consulta reagendada com sucesso!', 'success');

      // Recarregar eventos para a visão atual
      if (viewMode === 'day') {
        fetchData();
      } else if (calendarRef.current) {
        const view = calendarRef.current.getApi().view;
        fetchData(view.activeStart.toISOString(), view.activeEnd.toISOString());
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro de conflito de horário.', 'error');
      revert();
    }
  };

  const handleEventResize = async (info: any) => {
    const { event, revert } = info;
    const originalAppt = event.extendedProps;
    
    const start = new Date(event.start);
    const end = new Date(event.end);
    const durationInMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

    try {
      const payload = {
        patientId: originalAppt.patientId,
        dentistId: originalAppt.dentistId,
        date: start.toISOString(),
        durationInMinutes: durationInMinutes,
        serviceType: originalAppt.serviceType,
        price: originalAppt.price,
        procedureIds: originalAppt.procedures?.map((p: any) => p.id) || []
      };

      await api.put(`/appointments/${originalAppt.id}`, payload);
      showToast('Duração da consulta atualizada!', 'success');

      if (viewMode === 'day') {
        fetchData();
      } else if (calendarRef.current) {
        const view = calendarRef.current.getApi().view;
        fetchData(view.activeStart.toISOString(), view.activeEnd.toISOString());
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro de conflito ao expandir o horário.', 'error');
      revert();
    }
  };

  const handleEventClick = (info: any) => {
    // Corrige o bug de remarcar e clicar imediatamente: info.event.start é atualizado no drag
    // mas o extendedProps guarda a info velha até a tela recarregar.
    const apptData = { ...info.event.extendedProps };
    if (info.event.start) {
      apptData.date = info.event.start.toISOString();
    }
    openEditModal(apptData);
  };

  const handleDateClick = (info: any) => {
    if (info.view.type === 'dayGridMonth') {
      // Ajusta a data clicada no calendário mensal para o timezone local
      const d = new Date(info.dateStr);
      const localDateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      setCurrentDate(localDateStr);
      setViewMode('day');
    } else {
      openNewModal(info.dateStr);
    }
  };

  const events = appointments.map((appt: any) => {
    const start = new Date(appt.date);
    const end = new Date(start.getTime() + appt.durationInMinutes * 60000);

    const colorBaseMap: Record<string, string> = {
      SCHEDULED: 'blue',
      CONFIRMED: 'purple',
      COMPLETED: 'green',
      CANCELED: 'red',
      NO_SHOW: 'amber',
    };
    const baseColor = colorBaseMap[appt.status] || 'blue';

    const prefix = appt.dentist.gender === 'F' ? 'Dra.' : 'Dr.';

    return {
      id: appt.id,
      title: `${appt.patient.name} - ${appt.serviceType || 'Consulta'} com ${prefix} ${appt.dentist.name}`,
      start: start.toISOString(),
      end: end.toISOString(),
      allDay: false,
      display: 'block',
      backgroundColor: `var(--${baseColor}-bg)`,
      borderColor: `var(--${baseColor})`,
      textColor: `var(--${baseColor})`,
      extendedProps: { ...appt, baseColor }
    };
  });

  const changeDate = (days: number) => {
    const d = new Date(`${currentDate}T12:00:00.000Z`);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const goToday = () => {
    const d = new Date();
    setCurrentDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
  };

  const todayStr = (() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  })();

  const isToday = currentDate === todayStr;

  const displayDate = new Date(`${currentDate}T12:00:00.000Z`).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Agenda e Consultas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Gerencie o fluxo de atendimento da clínica</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px' }}>
            <button
              className={`btn ${viewMode === 'day' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '13px' }}
              onClick={() => setViewMode('day')}
            >
              Visão Diária
            </button>
            <button
              className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '13px' }}
              onClick={() => setViewMode('week')}
            >
              Visão Semanal
            </button>
            <button
              className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '13px' }}
              onClick={() => setViewMode('month')}
            >
              Visão Mensal
            </button>
          </div>

          <select
            className="input"
            style={{ width: '180px', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}
            value={selectedDentist}
            onChange={(e) => setSelectedDentist(e.target.value)}
          >
            <option value="">Todos os Dentistas</option>
            {dentists.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name.split(' ').slice(0, 2).join(' ')}
              </option>
            ))}
          </select>

          <button className="btn btn-primary" onClick={() => openNewModal()}>
            <Plus size={15} />
            Nova Consulta
          </button>
        </div>
      </div>

      {viewMode !== 'day' ? (
        <div className="card" style={{ padding: '20px', minHeight: '600px' }}>
          <FullCalendar
            ref={calendarRef}
            timeZone="local"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={viewMode === 'week' ? 'timeGridWeek' : 'dayGridMonth'}
            locale="pt-br"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: '' // Removido pois usamos nossos próprios botões
            }}
            buttonText={{
              today: 'Hoje'
            }}
            events={events}
            editable={true}
            droppable={true}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
        slotDuration="00:30:00"
            slotLabelInterval="01:00"
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            snapDuration="00:05:00"
            allDaySlot={false}
            slotLabelFormat={{ hour: 'numeric', minute: '2-digit', hour12: false }}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            businessHours={[
              { daysOfWeek: [1,2,3,4,5,6], startTime: '07:00', endTime: '12:00' },
              { daysOfWeek: [1,2,3,4,5,6], startTime: '13:00', endTime: '20:00' }
            ]}
            dayHeaderContent={(arg) => {
              const day = arg.date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
              const date = arg.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              const isToday = new Date().toDateString() === arg.date.toDateString();
              return (
                <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ 
                    background: isToday ? 'var(--purple)' : 'transparent',
                    color: isToday ? '#fff' : 'var(--text-primary)',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}>
                    {day}. {date}
                  </div>
                </div>
              );
            }}
            slotEventOverlap={true}
            height="auto"
            nowIndicator={true}
            eventContent={(arg) => {
              const status = arg.event.extendedProps.status;
              let icon = null;
              if (status === 'CONFIRMED') icon = <Check size={12} style={{ marginRight: 4 }} />;
              if (status === 'COMPLETED') icon = <CheckCircle2 size={12} style={{ marginRight: 4 }} />;
              if (status === 'CANCELED') icon = <X size={12} style={{ marginRight: 4 }} />;
              if (status === 'NO_SHOW') icon = <UserMinus size={12} style={{ marginRight: 4 }} />;

              // Visão Mensal tem um estilo mais compacto padrão do FullCalendar
              if (arg.view.type === 'dayGridMonth') {
                return (
                  <div
                    title={`Paciente: ${arg.event.extendedProps.patient.name}\nServiço: ${arg.event.extendedProps.serviceType}\nDentista: ${arg.event.extendedProps.dentist.gender === 'F' ? 'Dra.' : 'Dr.'} ${arg.event.extendedProps.dentist.name}\nHorário: ${arg.timeText}`}
                    style={{
                      padding: '3px 6px',
                      fontSize: '11px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      color: `var(--${arg.event.extendedProps.baseColor})`,
                      borderLeft: `3px solid var(--${arg.event.extendedProps.baseColor})`,
                      borderRadius: '3px',
                      width: '100%'
                    }}>
                    <span style={{ fontWeight: 700, marginRight: '4px' }}>{arg.timeText}</span>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{arg.event.title.split('-')[0]}</span>
                  </div>
                );
              }

              if (arg.view.type === 'timeGridWeek' || arg.view.type === 'timeGridDay') {
                const prefix = arg.event.extendedProps.dentist.gender === 'F' ? 'Dra.' : 'Dr.';
                return (
                  <div
                    title={`Paciente: ${arg.event.extendedProps.patient.name}\nServiço: ${arg.event.extendedProps.serviceType}\nDentista: ${prefix} ${arg.event.extendedProps.dentist.name}\nHorário: ${arg.timeText}`}
                    style={{ 
                      padding: '2px 6px', 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', /* Centraliza o dot e o bloco de texto verticalmente */
                      gap: '6px',
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      boxShadow: 'var(--shadow-sm)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Dot Indicator */}
                    <div style={{ flexShrink: 0, width: '6px', height: '6px', borderRadius: '50%', background: `var(--${arg.event.extendedProps.baseColor})` }} />

                    {/* Text Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, justifyContent: 'center' }}>
                      
                      {/* Row 1: Patient and Time */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', lineHeight: 1.1 }}>
                        <span style={{ fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {arg.event.extendedProps.patient.name.split(' ')[0]}
                        </span>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '4px' }}>
                          {arg.timeText}
                        </span>
                      </div>

                      {/* Row 2: Dentist (Always visible, clean text without icon) */}
                      <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px', lineHeight: 1.1 }}>
                        {prefix} {arg.event.extendedProps.dentist.name.split(' ').slice(0, 2).join(' ')}
                      </span>

                      {/* Row 3: Procedure (Visible only if duration >= 60) */}
                      {arg.event.extendedProps.durationInMinutes >= 60 && (
                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px', lineHeight: 1.1 }}>
                          {arg.event.extendedProps.serviceType}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }
            }}
          />
        </div>
      ) : (
        <>
          {/* Menu de Data Diário */}
          <div className="flex-between mb-6" style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 auto' }}>
              <button className="btn btn-outline btn-sm" onClick={() => changeDate(-1)} style={{ padding: '5px 8px' }}>
                <ChevronLeft size={16} />
              </button>
              <div style={{ textAlign: 'center', minWidth: '150px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{displayDate}</div>
                {isToday ? (
                  <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500 }}>Hoje</div>
                ) : (
                  <button onClick={goToday} style={{ fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Ir para hoje
                  </button>
                )}
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => changeDate(1)} style={{ padding: '5px 8px' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Lista de Consultas Diárias (Original) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {appointments.length === 0 ? (
              <div className="card">
                <div className="empty-state">Nenhuma consulta para este dia.</div>
              </div>
            ) : (
              appointments.map((appt) => (
                <div key={appt.id} className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Time */}
                    <div style={{ minWidth: '70px' }}>
                      <div className="table-time">{formatTime(appt.date)}</div>
                      <div className="table-time-sub">{appt.durationInMinutes} min</div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{appt.patient.name}</div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        {appt.serviceType} · {appt.patient.phone}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Dr(a). {appt.dentist.name}
                      </div>
                    </div>

                    {/* Status + actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {statusBadge(appt.status)}
                      {appt.status !== 'CANCELED' && appt.status !== 'COMPLETED' && appt.status !== 'NO_SHOW' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'var(--blue-bg)', color: 'var(--primary)',
                              border: '1px solid var(--blue-border)', borderRadius: '6px',
                              padding: '6px', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onClick={() => openEditModal(appt)}
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>

                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            background: 'var(--bg)', border: '1px solid var(--border)',
                            padding: '4px', borderRadius: '8px'
                          }}>
                            {appt.status === 'SCHEDULED' && (
                              <button
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--purple)', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'var(--purple-bg)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                onClick={() => updateStatus(appt.id, 'CONFIRMED')}
                                title="Marcar como Confirmada"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--green)', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onMouseOver={(e) => e.currentTarget.style.background = 'var(--green-bg)'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                              onClick={() => updateStatus(appt.id, 'COMPLETED')}
                              title="Marcar como Realizada"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <button
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--amber)', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onMouseOver={(e) => e.currentTarget.style.background = 'var(--amber-bg)'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                              onClick={() => updateStatus(appt.id, 'NO_SHOW')}
                              title="Marcar como Faltou"
                            >
                              <UserMinus size={16} />
                            </button>
                            <button
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onMouseOver={(e) => e.currentTarget.style.background = 'var(--red-bg)'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                              onClick={() => updateStatus(appt.id, 'CANCELED')}
                              title="Cancelar Consulta"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Modal Genérico */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editId ? 'Editar Consulta' : 'Agendar Consulta'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Paciente *</label>
                <SearchableSelect
                  options={patients}
                  value={formData.patientId}
                  onChange={(val: string) => setFormData({ ...formData, patientId: val })}
                  placeholder="Buscar paciente..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Dentista *</label>
                <SearchableSelect
                  options={dentists}
                  value={formData.dentistId}
                  onChange={(val: string) => setFormData({ ...formData, dentistId: val })}
                  placeholder="Buscar dentista..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Data *</label>
                  <input type="date" className="form-input" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Horário *</label>
                  <input type="time" className="form-input" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Duração (min)</label>
                <input type="text" className="form-input" value={formData.durationInMinutes} onChange={(e) => setFormData({ ...formData, durationInMinutes: Number(maskNumber(e.target.value)) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Procedimentos</label>
                <MultiSearchableSelect
                  options={procedures}
                  values={formData.procedureIds}
                  onChange={(selectedIds: string[]) => {
                    const selectedProcs = procedures.filter(p => selectedIds.includes(p.id));
                    const totalBasePrice = selectedProcs.reduce((acc, p) => acc + p.basePrice, 0);
                    const procNames = selectedProcs.map(p => p.name).join(', ');

                    setFormData({
                      ...formData,
                      procedureIds: selectedIds,
                      serviceType: procNames || formData.serviceType,
                      price: maskCurrency(totalBasePrice.toFixed(2).replace('.', ''))
                    });
                  }}
                  placeholder="Vincular procedimentos..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Serviço / Motivo da Consulta</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  placeholder="Ex: Avaliação Inicial"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Valor / Preço (R$)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  placeholder="0,00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: maskCurrency(e.target.value) })}
                />
              </div>
              {editId && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => updateStatus(editId, 'CONFIRMED')} style={{ color: 'var(--purple)', borderColor: 'var(--purple)' }}><Check size={14} /> Confirmar</button>
                  <button className="btn btn-outline btn-sm" onClick={() => updateStatus(editId, 'COMPLETED')} style={{ color: 'var(--green)', borderColor: 'var(--green)' }}><CheckCircle2 size={14} /> Finalizar</button>
                  <button className="btn btn-outline btn-sm" onClick={() => updateStatus(editId, 'CANCELED')} style={{ color: 'var(--red)', borderColor: 'var(--red)' }}><X size={14} /> Cancelar</button>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Consulta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
