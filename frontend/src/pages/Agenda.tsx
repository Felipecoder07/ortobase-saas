import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, X } from 'lucide-react';
import axios from 'axios';

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
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    patientId: '', dentistId: '', time: '', durationInMinutes: 30, serviceType: ''
  });

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
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/appointments', {
        patientId: formData.patientId,
        dentistId: formData.dentistId,
        date: `${currentDate}T${formData.time}:00.000Z`,
        durationInMinutes: Number(formData.durationInMinutes),
        serviceType: formData.serviceType,
      }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Consulta agendada com sucesso!', 'success');
      setShowModal(false);
      setFormData({ patientId: '', dentistId: '', time: '', durationInMinutes: 30, serviceType: '' });
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

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
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
                  {appt.status !== 'CANCELED' && appt.status !== 'COMPLETED' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-outline-green btn-sm"
                        onClick={() => updateStatus(appt.id, 'CONFIRMED')}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Check size={13} />
                        Confirmar
                      </button>
                      <button
                        className="btn btn-outline-red btn-sm"
                        onClick={() => updateStatus(appt.id, 'CANCELED')}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <X size={13} />
                        Cancelar
                      </button>
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
              <span className="modal-title">Agendar Consulta</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Paciente *</label>
                <select className="form-select" value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}>
                  <option value="">Selecione...</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Dentista *</label>
                <select className="form-select" value={formData.dentistId} onChange={(e) => setFormData({ ...formData, dentistId: e.target.value })}>
                  <option value="">Selecione...</option>
                  {dentists.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Horário *</label>
                  <input type="time" className="form-input" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duração (min)</label>
                  <input type="number" className="form-input" step="15" value={formData.durationInMinutes} onChange={(e) => setFormData({ ...formData, durationInMinutes: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Serviço / Procedimento *</label>
                <input type="text" className="form-input" placeholder="Ex: Limpeza, Extração..." value={formData.serviceType} onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })} />
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
