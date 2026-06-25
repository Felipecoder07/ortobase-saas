import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, AlertCircle, UserX, RefreshCw, Clock } from 'lucide-react';
import api from '../utils/api';

interface TodayAppointment {
  id: string;
  date: string;
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

const Dashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<TodayAppointment[]>([]);
  const [reports, setReports] = useState({ daily: 0, monthly: 0, yearly: 0 });
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).replace(/^\w/, (c) => c.toUpperCase());

  const fetchData = async () => {
    setLoading(true);
    try {
      const startOfMonth = `${year}-${month}-01`;
      const endOfMonth = `${year}-${month}-${new Date(year, d.getMonth() + 1, 0).getDate()}`;
      
      const [apptRes, allApptRes, defaultersRes] = await Promise.all([
        api.get(`/appointments?date=${today}`),
        api.get(`/appointments?start=${startOfMonth}T00:00:00.000Z&end=${endOfMonth}T23:59:59.999Z`),
        api.get(`/finance/defaulters?month=${year}-${month}`),
      ]);

      setAppointments(apptRes.data);
      setDefaulters(defaultersRes.data);
      const isFullyPaid = (a: any) => {
        if (!a.payments) return false;
        const paidPayments = a.payments.filter((p: any) => p.status === 'PAID');
        if (paidPayments.length === 0) return false;
        const price = a.price || 0;
        if (price === 0 && a.payments.reduce((sum: number, p: any) => sum + p.amount, 0) === 0) return false;
        const paidSoFar = paidPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
        return paidSoFar >= price;
      };
      const pending = allApptRes.data.filter((a: any) => !isFullyPaid(a) && a.status === 'COMPLETED');
      setPendingCount(pending.length);

      try {
        const reportsRes = await api.get('/finance/reports');
        setReports(reportsRes.data);
      } catch (e) {
        console.warn('Sem permissão para visualizar relatórios');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {/* Date + refresh */}
      <div className="flex-between mb-4">
        <p className="page-date-label">{todayFormatted}</p>
        <button className="btn btn-ghost btn-sm" onClick={fetchData} style={{ gap: '4px' }}>
          <RefreshCw size={13} />
          Atualizar
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid-4 mb-6">
        <div className="metric-card blue">
          <div className="metric-card-info">
            <div className="metric-card-label">Consultas Hoje</div>
            <div className="metric-card-value">{appointments.length}</div>
          </div>
          <div className="metric-card-icon blue">
            <Calendar size={20} />
          </div>
        </div>

        <div className="metric-card green">
          <div className="metric-card-info">
            <div className="metric-card-label">Faturamento do Mês</div>
            <div className="metric-card-value green">
              R$ {reports.monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="metric-card-icon green">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="metric-card amber">
          <div className="metric-card-info">
            <div className="metric-card-label">Pagamentos Pendentes</div>
            <div className="metric-card-value amber">{pendingCount}</div>
          </div>
          <div className="metric-card-icon amber">
            <AlertCircle size={20} />
          </div>
        </div>

        <div className="metric-card red">
          <div className="metric-card-info">
            <div className="metric-card-label">Pacientes Inadimplentes</div>
            <div className="metric-card-value red">{defaulters.length}</div>
          </div>
          <div className="metric-card-icon red">
            <UserX size={20} />
          </div>
        </div>
      </div>

      {/* Today's appointments table */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-title">
            <Clock size={15} color="var(--primary)" />
            Consultas de Hoje
          </div>
          {appointments.length > 0 && (
            <span className="card-header-badge">{appointments.length} consulta{appointments.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        {loading ? (
          <div className="empty-state">Carregando...</div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">Nenhuma consulta agendada para hoje.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Horário</th>
                <th>Paciente</th>
                <th>Dentista</th>
                <th>Serviço</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id}>
                  <td>
                    <span className="text-primary-color font-semibold">{formatTime(appt.date)}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{appt.patient.name}</div>
                    <div className="text-xs text-muted">{appt.patient.phone}</div>
                  </td>
                  <td>{appt.dentist.name}</td>
                  <td>{appt.serviceType}</td>
                  <td>{statusBadge(appt.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
