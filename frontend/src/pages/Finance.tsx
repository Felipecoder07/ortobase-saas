import React, { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, UserX, MessageCircle, RefreshCw, X } from 'lucide-react';
import axios from 'axios';

const Finance: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [reports, setReports] = useState({ daily: 0, monthly: 0, yearly: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'paid' | 'reports'>('pending');

  const [showPayModal, setShowPayModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [refundAppt, setRefundAppt] = useState<any>(null);
  const [refundReason, setRefundReason] = useState('');
  const [payForm, setPayForm] = useState({ method: 'CREDIT_CARD', discount: 0, installments: 1 });

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
        axios.get('http://localhost:3000/api/finance/defaulters', { headers }),
        axios.get('http://localhost:3000/api/finance/reports', { headers }),
      ]);
      setAppointments(apptRes.data);
      setDefaulters(defRes.data);
      setReports(repRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const pending = appointments.filter((a) => !a.payment && a.status !== 'CANCELED');
  const paid = appointments.filter((a) => a.payment && a.payment.status === 'PAID');

  const handlePay = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/finance', {
        appointmentId: selectedAppt.id,
        method: payForm.method,
        discount: Number(payForm.discount),
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
    setPayForm({ method: 'CREDIT_CARD', discount: 0, installments: 1 });
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
                  <th>Serviço</th>
                  <th>Valor Pago</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paid.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.date).toLocaleDateString('pt-BR')}</td>
                    <td style={{ fontWeight: 500 }}>{p.patient.name}</td>
                    <td>{p.serviceType}</td>
                    <td style={{ fontWeight: 600, color: 'var(--green)' }}>
                      R$ {p.payment?.amount?.toFixed(2)}
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
              <div className="info-box">
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{selectedAppt.patient.name}</div>
                <div className="text-sm text-muted">Serviço: {selectedAppt.serviceType}</div>
                <div style={{ marginTop: '8px', fontSize: '13.5px' }}>
                  Preço Base: <strong>R$ {selectedAppt.price?.toFixed(2) || '0,00'}</strong>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Desconto (%) — máx. recomendado: 20%</label>
                <input type="number" className="form-input" min="0" max="100" value={payForm.discount}
                  onChange={(e) => setPayForm({ ...payForm, discount: Number(e.target.value) })} />
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
                  <label className="form-label">Parcelas (mín. R$30/parcela)</label>
                  <input type="number" className="form-input" min="1" max="12" value={payForm.installments}
                    onChange={(e) => setPayForm({ ...payForm, installments: Number(e.target.value) })} />
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
