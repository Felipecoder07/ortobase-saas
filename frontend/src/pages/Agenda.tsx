import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, X, Edit2, UserMinus, CheckCircle2, ChevronDown } from 'lucide-react';
import axios from 'axios';
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
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
};

const SearchableSelect = ({ options, value, onChange, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const selectedOption = options.find((o: any) => o.id === value);
  const filteredOptions = options.filter((o: any) => o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div 
        className="form-input"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: selectedOption ? 'inherit' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      </div>
      
      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setIsOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, width: '100%',
            background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            zIndex: 1000, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
              <input 
                autoFocus
                type="text" 
                className="form-input" 
                placeholder="Buscar..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '6px 10px' }}
              />
            </div>
            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
              {filteredOptions.length === 0 ? (
                <div style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>Nenhum resultado</div>
              ) : (
                filteredOptions.map((o: any) => (
                  <div 
                    key={o.id}
                    style={{ 
                      padding: '8px 12px', cursor: 'pointer', fontSize: '13.5px',
                      background: value === o.id ? 'var(--bg)' : 'transparent',
                      color: 'var(--text-primary)'
                    }}
                    onClick={() => { onChange(o.id); setIsOpen(false); setSearch(''); }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={(e) => { if (value !== o.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {o.name}
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

const Agenda: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    patientId: '', dentistId: '', time: '', durationInMinutes: 30, serviceType: '', price: ''
  });

  const openNewModal = () => {
    setEditId(null);
    setFormData({ patientId: '', dentistId: '', time: '', durationInMinutes: 30, serviceType: '', price: '' });
    setShowModal(true);
  };

  const openEditModal = (appt: any) => {
    setEditId(appt.id);
    const dateObj = new Date(appt.date);
    const timeString = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    setFormData({
      patientId: appt.patientId,
      dentistId: appt.dentistId,
      time: timeString,
      durationInMinutes: appt.durationInMinutes,
      serviceType: appt.serviceType || '',
      price: appt.price ? maskCurrency(appt.price.toFixed(2).replace('.', '')) : ''
    });
    setShowModal(true);
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const todayStr = (() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  })();

  const isToday = currentDate === todayStr;

  const displayDate = new Date(`${currentDate}T12:00:00.000Z`).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [apptRes, patRes, dentRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/appointments?date=${currentDate}`, { headers }),
        axios.get('http://localhost:3000/api/patients', { headers }),
        axios.get('http://localhost:3000/api/dentists', { headers }),
      ]);
      setAppointments(apptRes.data);
      setPatients(patRes.data);
      setDentists(dentRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [currentDate]);

  const changeDate = (days: number) => {
    const d = new Date(`${currentDate}T12:00:00.000Z`);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const goToday = () => setCurrentDate(todayStr);

  const handleSave = async () => {
    if (!formData.patientId || !formData.dentistId || !formData.time || !formData.durationInMinutes) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        patientId: formData.patientId,
        dentistId: formData.dentistId,
        date: `${currentDate}T${formData.time}:00.000Z`,
        durationInMinutes: Number(formData.durationInMinutes),
        serviceType: formData.serviceType,
        price: formData.price ? parseCurrency(formData.price) : 0,
      };

      if (editId) {
        await axios.put(`http://localhost:3000/api/appointments/${editId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        showToast('Consulta atualizada com sucesso!', 'success');
      } else {
        await axios.post('http://localhost:3000/api/appointments', payload, { headers: { Authorization: `Bearer ${token}` } });
        showToast('Consulta agendada com sucesso!', 'success');
      }
      setShowModal(false);
      setEditId(null);
      setFormData({ patientId: '', dentistId: '', time: '', durationInMinutes: 30, serviceType: '', price: '' });
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao agendar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3000/api/appointments/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Status atualizado!', 'success');
      fetchData();
    } catch { showToast('Erro ao atualizar.', 'error'); }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
          color: toast.type === 'success' ? '#15803D' : '#B91C1C',
          padding: '12px 16px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Date nav + button */}
      <div className="flex-between mb-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => changeDate(-1)} style={{ padding: '5px 8px' }}>
            <ChevronLeft size={16} />
          </button>
          <div style={{ textAlign: 'center' }}>
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

        <button className="btn btn-primary" onClick={openNewModal}>
          <Plus size={15} />
          Nova Consulta
        </button>
      </div>

      {/* Appointments list */}
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
                      {/* Botão de Editar Isolado */}
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

                      {/* Grupo de Ações de Status */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        padding: '4px', borderRadius: '8px'
                      }}>
                        {appt.status === 'SCHEDULED' && (
                          <button
                            style={{ 
                              background: 'transparent', border: 'none', cursor: 'pointer', 
                              color: 'var(--purple)', padding: '6px', borderRadius: '4px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--purple-bg)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            onClick={() => updateStatus(appt.id, 'CONFIRMED')}
                            title="Marcar como Confirmada"
                          >
                            <Check size={16} />
                          </button>
                        )}

                        <button
                          style={{ 
                            background: 'transparent', border: 'none', cursor: 'pointer', 
                            color: 'var(--green)', padding: '6px', borderRadius: '4px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--green-bg)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          onClick={() => updateStatus(appt.id, 'COMPLETED')}
                          title="Marcar como Realizada"
                        >
                          <CheckCircle2 size={16} />
                        </button>

                        <button
                          style={{ 
                            background: 'transparent', border: 'none', cursor: 'pointer', 
                            color: 'var(--amber)', padding: '6px', borderRadius: '4px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--amber-bg)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          onClick={() => updateStatus(appt.id, 'NO_SHOW')}
                          title="Marcar como Faltou"
                        >
                          <UserMinus size={16} />
                        </button>

                        <button
                          style={{ 
                            background: 'transparent', border: 'none', cursor: 'pointer', 
                            color: 'var(--red)', padding: '6px', borderRadius: '4px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
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

      {/* Modal */}
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
                  <label className="form-label">Horário *</label>
                  <input type="time" className="form-input" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duração (min)</label>
                  <input type="text" className="form-input" value={formData.durationInMinutes} onChange={(e) => setFormData({ ...formData, durationInMinutes: Number(maskNumber(e.target.value)) })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Procedimento</label>
                <input type="text" className="form-input" value={formData.serviceType} onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })} />
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
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Agendando...' : 'Confirmar Agendamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
