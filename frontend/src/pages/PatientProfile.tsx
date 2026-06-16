import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, DollarSign, Save } from 'lucide-react';
import axios from 'axios';

interface Appointment {
  id: string;
  date: string;
  durationInMinutes: number;
  serviceType: string;
  status: string;
  dentist: { name: string };
  payment: { amount: number; status: string } | null;
}

interface Patient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  dateOfBirth: string;
  clinicalNotes: string;
  appointments: Appointment[];
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

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPatient = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatient(res.data);
      setNotes(res.data.clinicalNotes || '');
    } catch (err) {
      console.error(err);
      showToast('Erro ao carregar dados do paciente', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const saveNotes = async () => {
    if (!patient) return;
    setSavingNotes(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/patients/${patient.id}`, 
        { ...patient, clinicalNotes: notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Anotações salvas!', 'success');
      setPatient({ ...patient, clinicalNotes: notes });
    } catch (err) {
      showToast('Erro ao salvar anotações.', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) return <div className="empty-state">Carregando perfil...</div>;
  if (!patient) return <div className="empty-state">Paciente não encontrado.</div>;

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

      {/* Toolbar */}
      <div className="flex-between mb-4">
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard/patients')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Voltar para Pacientes
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Info */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div className="patient-avatar" style={{ width: '64px', height: '64px', fontSize: '24px' }}>
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: 'var(--text-primary)' }}>{patient.name}</h2>
              <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <span><strong>CPF:</strong> {patient.cpf}</span>
                <span><strong>Tel:</strong> {patient.phone}</span>
                <span><strong>Nasc:</strong> {new Date(patient.dateOfBirth).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
              </div>
            </div>
          </div>

          {/* Appointments History */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-title">
                <Calendar size={18} color="var(--primary)" />
                Histórico de Consultas
              </div>
            </div>
            {patient.appointments.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>Nenhuma consulta registrada.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Dentista</th>
                    <th>Procedimento</th>
                    <th>Status</th>
                    <th>Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.appointments.map((appt) => (
                    <tr key={appt.id}>
                      <td style={{ fontWeight: 500 }}>
                        {new Date(appt.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}<br/>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
                          {new Date(appt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                        </span>
                      </td>
                      <td>Dr(a). {appt.dentist.name}</td>
                      <td>{appt.serviceType}</td>
                      <td>{statusBadge(appt.status)}</td>
                      <td>
                        {appt.payment ? (
                          <span style={{ color: '#10B981', fontWeight: 500, fontSize: '13px' }}>Pago</span>
                        ) : (
                          appt.status === 'COMPLETED' ? (
                            <span style={{ color: '#F59E0B', fontWeight: 500, fontSize: '13px' }}>Pendente</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Clinical Notes */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <div className="card-header-title">
                <FileText size={18} color="var(--primary)" />
                Anotações Clínicas
              </div>
            </div>
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea 
                className="form-input" 
                style={{ minHeight: '200px', resize: 'vertical', padding: '12px', lineHeight: '1.5' }}
                placeholder="Alergias, histórico médico, observações sobre o tratamento..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={saveNotes}
                disabled={savingNotes}
              >
                <Save size={15} />
                {savingNotes ? 'Salvando...' : 'Salvar Anotações'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientProfile;
