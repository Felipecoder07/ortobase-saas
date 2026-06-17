import React, { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, UserX, MessageCircle, RefreshCw, X, Tag } from 'lucide-react';
import axios from 'axios';
import { maskCurrency, parseCurrency } from '../utils/masks';

const Finance: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [reports, setReports] = useState({ daily: 0, monthly: 0, yearly: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'paid' | 'reports'>('pending');
  const [reportMonth, setReportMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [showPayModal, setShowPayModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [refundAppt, setRefundAppt] = useState<any>(null);
  const [refundReason, setRefundReason] = useState('');
  const [payForm, setPayForm] = useState<{method: string, amount: number | string, serviceType: string, installments: number}>({ method: 'PIX', amount: '', serviceType: '', installments: 1 });

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [apptRes, defRes, repRes] = await Promise.all([
        axios.get('http://localhost:3000/api/appointments', { headers }),
        axios.get(`http://localhost:3000/api/finance/defaulters?month=${reportMonth}`, { headers }),
        axios.get(`http://localhost:3000/api/finance/reports?month=${reportMonth}`, { headers }),
      ]);
      setAppointments(apptRes.data);
      setDefaulters(defRes.data);
      setReports(repRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [reportMonth]);

  const getMethodLabel = (method: string) => {
    const map: Record<string, string> = {
      PIX: 'PIX',
      CREDIT_CARD: 'Cartão de Crédito',
      DEBIT_CARD: 'Cartão de Débito',
      CASH: 'Dinheiro',
    };
    return map[method] || method;
  };

  const pending = appointments.filter((a) => !a.payment && a.status !== 'CANCELED');
  const paid = appointments.filter((a) => a.payment && a.payment.status === 'PAID');

  const handlePay = async () => {
    const amount = parseCurrency(payForm.amount.toString());
    if (!amount || amount <= 0) {
      showToast('O valor deve ser maior que zero.', 'error');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/finance', {
        appointmentId: selectedAppt.id,
        method: payForm.method,
        amount: amount,
        serviceType: payForm.serviceType,
        installments: Number(payForm.installments),
      }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Pagamento registrado!', 'success');
      setShowPayModal(false);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao registrar.', 'error');
    } finally { setLoading(false); }
  };

  const handleRefund = async () => {
    if (!refundReason) { showToast('A justificativa é obrigatória.', 'error'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/finance/${refundAppt.payment.id}/refund`,
        { refundReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Estorno realizado!', 'success');
      setShowRefundModal(false);
      setRefundReason('');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao estornar.', 'error');
    } finally { setLoading(false); }
  };

  const handleSendReceipt = async (paymentId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/finance/${paymentId}/receipt`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Comprovante enviado via WhatsApp!', 'success');
    } catch { showToast('Erro ao enviar comprovante.', 'error'); }
  };

  const openPayModal = (appt: any) => {
    setSelectedAppt(appt);
    setPayForm({ 
      method: 'PIX', 
      amount: appt.price ? maskCurrency(appt.price.toFixed(2).replace('.', '')) : '', 
      serviceType: appt.serviceType || '', 
      installments: 1 
    });
    setShowPayModal(true);
  };

  const openRefundModal = (appt: any) => {
    setRefundAppt(appt);
    setRefundReason('');
    setShowRefundModal(true);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'COMPLETED') return <span className="badge badge-red">● Inadimplente</span>;
    return <span className="badge badge-amber">● Pendente</span>;
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

      {/* Metric cards */}
      <div className="grid-3 mb-6">
        <div className="metric-card green">
          <div className="metric-card-info">
            <div className="metric-card-label">Faturamento Mensal</div>
            <div className="metric-card-value green">
              R$ {reports.monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="metric-card-icon green"><DollarSign size={20} /></div>
        </div>
        <div className="metric-card amber">
          <div className="metric-card-info">
            <div className="metric-card-label">Pagamentos Pendentes</div>
            <div className="metric-card-value amber">{pending.length}</div>
          </div>
          <div className="metric-card-icon amber"><AlertCircle size={20} /></div>
        </div>
        <div className="metric-card red">
          <div className="metric-card-info">
            <div className="metric-card-label">Pacientes Inadimplentes</div>
            <div className="metric-card-value red">{defaulters.length}</div>
          </div>
          <div className="metric-card-icon red"><UserX size={20} /></div>
        </div>
      </div>

      {/* Tabs + table */}
      <div className="card">
        <div style={{ padding: '0 20px' }}>
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
              Pendentes <span className="tab-count">{pending.length}</span>
            </button>
            <button className={`tab-btn ${activeTab === 'paid' ? 'active' : ''}`} onClick={() => setActiveTab('paid')}>
              Pagos <span className="tab-count">{paid.length}</span>
            </button>
            <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              Relatórios
            </button>
          </div>
        </div>

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          pending.length === 0 ? <div className="empty-state">Nenhum pagamento pendente.</div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Paciente</th>
                  <th>Dentista</th>
                  <th>Serviço</th>
                  <th>Status</th>
                  <th>Valor</th>
                  <th style={{ textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.date).toLocaleDateString('pt-BR')}</td>
                    <td style={{ fontWeight: 500 }}>{p.patient.name}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{p.dentist?.name || '-'}</td>
                    <td>{p.serviceType}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>R$ {p.price?.toFixed(2) || '0,00'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-green btn-sm" onClick={() => openPayModal(p)}>
                        <DollarSign size={13} /> Receber
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* Paid Tab */}
        {activeTab === 'paid' && (
          paid.length === 0 ? <div className="empty-state">Nenhuma consulta paga encontrada.</div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Paciente</th>
                  <th>Dentista</th>
                  <th>Serviço</th>
                  <th>Método</th>
                  <th>Valor Pago</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paid.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.date).toLocaleDateString('pt-BR')}</td>
                    <td style={{ fontWeight: 500 }}>{p.patient.name}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{p.dentist?.name || '-'}</td>
                    <td>{p.serviceType}</td>
                    <td><span className="badge badge-blue">{getMethodLabel(p.payment?.method)}</span></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--green)', fontSize: '14px' }}>
                            R$ {p.payment?.amount?.toFixed(2)}
                          </span>
                          {p.payment?.discount > 0 && (
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'line-through', fontWeight: 400 }}>
                              R$ {p.price?.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {p.payment?.discount > 0 && (
                          <div style={{ 
                            fontSize: '11px', color: '#b45309', background: '#fef3c7', 
                            padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', 
                            alignItems: 'center', gap: '4px', width: 'fit-content', fontWeight: 600,
                            border: '1px solid #fde68a'
                          }}>
                            <Tag size={10} strokeWidth={2.5} />
                            Desconto de R$ {p.payment.discount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleSendReceipt(p.payment.id)}>
                          <MessageCircle size={13} /> Comprovante
                        </button>
                        <button className="btn btn-outline-red btn-sm" onClick={() => openRefundModal(p)}>
                          <RefreshCw size={13} /> Estornar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Visão Geral do Período</h2>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', 
                background: 'var(--bg)', border: '1px solid var(--border)', 
                padding: '6px 12px', borderRadius: '8px'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Filtrar Mês:
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select 
                    className="form-select" 
                    style={{ width: '120px', padding: '4px 8px', fontSize: '13px', minHeight: '32px' }}
                    value={reportMonth.split('-')[1]}
                    onChange={(e) => setReportMonth(`${reportMonth.split('-')[0]}-${e.target.value}`)}
                  >
                    <option value="01">Janeiro</option>
                    <option value="02">Fevereiro</option>
                    <option value="03">Março</option>
                    <option value="04">Abril</option>
                    <option value="05">Maio</option>
                    <option value="06">Junho</option>
                    <option value="07">Julho</option>
                    <option value="08">Agosto</option>
                    <option value="09">Setembro</option>
                    <option value="10">Outubro</option>
                    <option value="11">Novembro</option>
                    <option value="12">Dezembro</option>
                  </select>
                  <select 
                    className="form-select" 
                    style={{ width: '85px', padding: '4px 8px', fontSize: '13px', minHeight: '32px' }}
                    value={reportMonth.split('-')[0]}
                    onChange={(e) => setReportMonth(`${e.target.value}-${reportMonth.split('-')[1]}`)}
                  >
                    {Array.from({ length: 11 }, (_, i) => {
                       const year = new Date().getFullYear() - 5 + i;
                       return <option key={year} value={year}>{year}</option>
                    })}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid-2">
              {/* Resumo */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Resumo de Faturamento</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Faturamento Hoje', value: reports.daily },
                    { label: 'Faturamento do Mês', value: reports.monthly },
                    { label: 'Faturamento do Ano', value: reports.yearly },
                  ].map(({ label, value }) => (
                    <div key={label} className="info-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500, fontSize: '13.5px' }}>{label}</span>
                      <span style={{ fontWeight: 700, color: 'var(--green)' }}>
                        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Defaulters */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--red)', marginBottom: '12px' }}>Relatório de Inadimplência</h3>
                {defaulters.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Nenhum paciente inadimplente.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                    {defaulters.map((d) => (
                      <div key={d.id} style={{
                        padding: '12px', borderRadius: '8px', background: 'var(--red-bg)',
                        borderLeft: '3px solid var(--red)', border: '1px solid var(--red-border)',
                      }}>
                        <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>{d.patient.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {d.serviceType} · R$ {d.price?.toFixed(2)} · {new Date(d.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pay Modal */}
      {showPayModal && selectedAppt && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowPayModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Registrar Pagamento</span>
              <button className="modal-close" onClick={() => setShowPayModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="info-box" style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 600 }}>Paciente: {selectedAppt.patient.name}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Procedimento Realizado *</label>
                <input type="text" className="form-input" value={payForm.serviceType}
                  onChange={(e) => setPayForm({ ...payForm, serviceType: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Valor (R$) *</label>
                <input type="text" inputMode="numeric" className="form-input" placeholder="0,00" value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: maskCurrency(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Método de Pagamento *</label>
                <select className="form-select" value={payForm.method}
                  onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="DEBIT_CARD">Cartão de Débito</option>
                  <option value="PIX">PIX</option>
                  <option value="CASH">Dinheiro</option>
                </select>
              </div>
              {payForm.method === 'CREDIT_CARD' && (
                <div className="form-group">
                  <label className="form-label">Parcelas</label>
                  <input type="number" className="form-input" min="1" max="12" value={payForm.installments}
                    onChange={(e) => setPayForm({ ...payForm, installments: Number(e.target.value) })} />
                  {payForm.installments > 1 && payForm.amount !== '' && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {payForm.installments}x de R$ {(parseCurrency(payForm.amount.toString()) / payForm.installments).toFixed(2).replace('.', ',')}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowPayModal(false)}>Cancelar</button>
              <button className="btn btn-green" onClick={handlePay} disabled={loading}>
                {loading ? 'Confirmando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && refundAppt && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowRefundModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Estornar Pagamento</span>
              <button className="modal-close" onClick={() => setShowRefundModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="alert-box alert-red">
                <strong>Atenção!</strong> Você está prestes a estornar o pagamento de{' '}
                <strong>R$ {refundAppt.payment?.amount?.toFixed(2)}</strong> do paciente{' '}
                <strong>{refundAppt.patient.name}</strong>.
              </div>
              <div className="form-group">
                <label className="form-label">Justificativa do Estorno *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Descreva o motivo do estorno..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowRefundModal(false)}>Cancelar</button>
              <button className="btn btn-red" onClick={handleRefund} disabled={loading}>
                {loading ? 'Processando...' : 'Confirmar Estorno'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
