import React, { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, UserX, MessageCircle, RefreshCw, X, Tag, Download, Search, Check, ChevronDown } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { maskCurrency, parseCurrency } from '../utils/masks';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const CHART_COLORS: Record<string, string> = {
  SCHEDULED: '#3b82f6',
  CONFIRMED: '#8b5cf6',
  COMPLETED: '#10b981',
  CANCELED: '#ef4444',
  NO_SHOW: '#f59e0b'
};

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendada',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Realizada',
  CANCELED: 'Cancelada',
  NO_SHOW: 'Faltou'
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

const Finance: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [reports, setReports] = useState({ daily: 0, monthly: 0, yearly: 0 });
  const [advancedMetrics, setAdvancedMetrics] = useState<any>(null);
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
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');
  const [refundReason, setRefundReason] = useState('');
  const [payForm, setPayForm] = useState<{method: string, amount: number | string, serviceType: string, installments: number, hasDiscount: boolean, discountType: 'PERCENTAGE' | 'VALUE', discountInput: string, procedureIds: string[], basePrice: number}>({ method: 'PIX', amount: '', serviceType: '', installments: 1, hasDiscount: false, discountType: 'PERCENTAGE', discountInput: '', procedureIds: [], basePrice: 0 });

  const [filterPatient, setFilterPatient] = useState('');
  const [filterDentist, setFilterDentist] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      const [apptRes, defRes, procRes] = await Promise.all([
        api.get('/appointments'),
        api.get(`/finance/defaulters?month=${reportMonth}`),
        api.get('/procedures')
      ]);
      setAppointments(apptRes.data);
      setDefaulters(defRes.data);
      setProcedures(procRes.data);

      try {
        const [repRes, metricsRes] = await Promise.all([
          api.get(`/finance/reports?month=${reportMonth}`),
          api.get(`/finance/dashboard-metrics?month=${reportMonth}`)
        ]);
        setReports(repRes.data);
        setAdvancedMetrics(metricsRes.data);
      } catch (e) {
        console.warn('Usuário não tem permissão para visualizar relatórios financeiros.');
      }
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

  const getPaidSoFar = (a: any) => {
    if (!a.payments || !Array.isArray(a.payments)) return 0;
    return a.payments.filter((p: any) => p.status === 'PAID').reduce((sum: number, p: any) => sum + p.amount, 0);
  };

  const isFullyPaid = (a: any) => {
    const paidPayments = a.payments?.filter((p: any) => p.status === 'PAID') || [];
    if (paidPayments.length === 0) return false;
    const price = a.price || 0;
    if (price === 0 && getPaidSoFar(a) === 0) return false;
    return getPaidSoFar(a) >= price;
  };

  const applyFilters = (list: any[]) => {
    return list.filter(a => {
      let matches = true;
      if (filterPatient && !a.patient?.name.toLowerCase().includes(filterPatient.toLowerCase())) matches = false;
      if (filterDentist && a.dentist?.name !== filterDentist) matches = false;
      if (filterDateStart && a.date.split('T')[0] < filterDateStart) matches = false;
      if (filterDateEnd && a.date.split('T')[0] > filterDateEnd) matches = false;
      return matches;
    });
  };

  const pending = applyFilters(appointments.filter((a) => !isFullyPaid(a) && a.status === 'COMPLETED'));
  const paid = applyFilters(appointments.filter((a) => isFullyPaid(a) && a.status === 'COMPLETED'));
  
  const availableDentists = Array.from(new Set(appointments.map(a => a.dentist?.name))).filter(Boolean);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleDiscountChange = (type: 'PERCENTAGE' | 'VALUE', inputValue: string, basePrice: number) => {
    let newAmount = basePrice || 0;
    let finalInput = inputValue;

    if (inputValue) {
      if (type === 'PERCENTAGE') {
        const sanitizedInput = inputValue.replace(/\D/g, ''); // Permite apenas números (inteiros)
        const pct = parseInt(sanitizedInput, 10);
        if (!isNaN(pct)) {
          if (pct > 100) { finalInput = '100'; }
          else { finalInput = pct.toString(); }
          
          const finalPct = parseInt(finalInput, 10);
          const discountAmt = newAmount * (finalPct / 100);
          newAmount = newAmount - discountAmt;
        } else {
          finalInput = '';
        }
      } else {
        const val = parseCurrency(inputValue);
        if (val) {
          if (val > newAmount) {
            newAmount = 0;
            finalInput = maskCurrency((basePrice * 100).toString());
          } else {
            newAmount = newAmount - val;
          }
        }
      }
    }
    
    if (newAmount < 0) newAmount = 0;

    setPayForm(prev => ({ 
      ...prev, 
      discountType: type, 
      discountInput: finalInput, 
      amount: maskCurrency(newAmount.toFixed(2).replace('.', '')) 
    }));
  };

  const handleProceduresChange = (newProcedureIds: string[]) => {
    const selectedProcs = procedures.filter(p => newProcedureIds.includes(p.id));
    const newBasePrice = selectedProcs.reduce((sum, p) => sum + (p.basePrice || 0), 0);
    
    const paidSoFar = getPaidSoFar(selectedAppt);
    const newRemaining = newBasePrice - paidSoFar;
    
    setPayForm(prev => ({
      ...prev,
      procedureIds: newProcedureIds,
      basePrice: newBasePrice,
      amount: newRemaining > 0 ? maskCurrency(newRemaining.toFixed(2).replace('.', '')) : '',
      hasDiscount: false,
      discountInput: ''
    }));
  };

  const handlePay = async () => {
    const amount = parseCurrency(payForm.amount.toString());
    if (!amount || amount <= 0) {
      showToast('O valor a pagar deve ser maior que zero.', 'error');
      return;
    }
    
    if (payForm.basePrice <= 0) {
      showToast('O valor total da consulta (baseado nos procedimentos) deve ser maior que zero.', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/finance', {
        appointmentId: selectedAppt.id,
        method: payForm.method,
        amount: amount,
        serviceType: payForm.serviceType,
        installments: Number(payForm.installments),
        procedureIds: payForm.procedureIds,
        price: payForm.basePrice
      });
      showToast('Pagamento registrado!', 'success');
      setShowPayModal(false);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao registrar.', 'error');
    } finally { setLoading(false); }
  };

  const handleRefund = async () => {
    if (!selectedPaymentId) { showToast('Selecione um pagamento para estornar.', 'error'); return; }
    if (!refundReason) { showToast('A justificativa é obrigatória.', 'error'); return; }
    setLoading(true);
    try {
      await api.post(`/finance/${selectedPaymentId}/refund`, { refundReason });
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
      await api.post(`/finance/${paymentId}/receipt`, {});
      showToast('Comprovante enviado via WhatsApp!', 'success');
    } catch { showToast('Erro ao enviar comprovante.', 'error'); }
  };

  const openPayModal = (appt: any) => {
    setSelectedAppt(appt);
    const paidSoFar = getPaidSoFar(appt);
    
    const apptProcedures = appt.procedures || [];
    const procedureIds = apptProcedures.map((p: any) => p.id);
    const initialBasePrice = appt.price || 0;
    const remaining = initialBasePrice - paidSoFar;

    setPayForm({ 
      method: 'PIX', 
      amount: remaining > 0 ? maskCurrency(remaining.toFixed(2).replace('.', '')) : '', 
      serviceType: appt.serviceType || '', 
      installments: 1,
      hasDiscount: false,
      discountType: 'PERCENTAGE',
      discountInput: '',
      procedureIds,
      basePrice: initialBasePrice
    });
    setShowPayModal(true);
  };

  const openRefundModal = (appt: any) => {
    setRefundAppt(appt);
    const paidPayments = appt.payments?.filter((p: any) => p.status === 'PAID') || [];
    setSelectedPaymentId(paidPayments.length > 0 ? paidPayments[0].id : '');
    setRefundReason('');
    setShowRefundModal(true);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'COMPLETED') return <span className="badge badge-red">● Inadimplente</span>;
    return <span className="badge badge-amber">● Pendente</span>;
  };

  const exportToCSV = async (type: 'pending' | 'paid') => {
    try {
      const dataToExport = type === 'pending' ? pending : paid;
      if (!dataToExport || dataToExport.length === 0) return showToast('Nenhum dado para exportar.', 'error');
      
      const headers = ['Data/Hora', 'Paciente', 'Telefone', 'Dentista', 'Serviço', 'Status', 'Valor', 'Pago?'];
      const rows = dataToExport.map((a: any) => [
        new Date(a.date).toLocaleString('pt-BR'),
        a.patient.name,
        a.patient.phone,
        a.dentist?.name || '-',
        a.serviceType,
        STATUS_LABELS[a.status] || a.status,
        a.price || 0,
        isFullyPaid(a) ? 'Sim' : 'Não'
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map((r: any) => r.map((c: any) => `"${c}"`).join(','))
      ].join('\n');
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_financeiro_${type}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      showToast('Erro ao exportar CSV', 'error');
    }
  };

  return (
    <div>
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

        {/* Filtros */}
        {(activeTab === 'pending' || activeTab === 'paid') && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0, minWidth: '200px', flex: 1 }}>
              <label className="form-label">Buscar Paciente</label>
              <input type="text" className="form-input" placeholder="Nome do paciente..." value={filterPatient} onChange={e => setFilterPatient(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: '150px' }}>
              <label className="form-label">Dentista</label>
              <select className="form-select" value={filterDentist} onChange={e => setFilterDentist(e.target.value)}>
                <option value="">Todos</option>
                {availableDentists.map((d: any) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, width: '130px' }}>
              <label className="form-label">Data De</label>
              <input type="date" className="form-input" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0, width: '130px' }}>
              <label className="form-label">Data Até</label>
              <input type="date" className="form-input" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} />
            </div>
          </div>
        )}

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          pending.length === 0 ? <div className="empty-state">Nenhum pagamento pendente.</div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
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
                  <React.Fragment key={p.id}>
                    <tr>
                      <td style={{ textAlign: 'center' }}>
                        {p.payments && p.payments.length > 1 && (
                          <button 
                            onClick={() => toggleRow(p.id)} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                          >
                            {expandedRows.includes(p.id) ? '▼' : '▶'}
                          </button>
                        )}
                      </td>
                      <td>{new Date(p.date).toLocaleDateString('pt-BR')}</td>
                      <td style={{ fontWeight: 500 }}>{p.patient.name}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{p.dentist?.name || '-'}</td>
                    <td>{p.serviceType}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>R$ {p.price?.toFixed(2) || '0.00'}</span>
                        {(!p.price || p.price === 0) && (
                          <span style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: 500 }}>Definir Valor</span>
                        )}
                        {getPaidSoFar(p) > 0 && (
                          <span style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 500 }}>
                            Já pago: R$ {getPaidSoFar(p).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-green btn-sm" onClick={() => openPayModal(p)}>
                        <DollarSign size={13} /> Receber
                      </button>
                    </td>
                  </tr>
                  {expandedRows.includes(p.id) && p.payments && p.payments.length > 1 && (
                    <tr style={{ background: 'var(--bg)' }}>
                      <td></td>
                      <td colSpan={7}>
                        <div style={{ padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card-bg)', margin: '8px 0' }}>
                          <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-primary)' }}>Histórico de Pagamentos</h4>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                                <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Data do Pag.</th>
                                <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Método</th>
                                <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Valor</th>
                                <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {p.payments.map((pay: any) => (
                                <tr key={pay.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                  <td style={{ padding: '6px 0' }}>{new Date(pay.createdAt || p.date).toLocaleDateString('pt-BR')}</td>
                                  <td style={{ padding: '6px 0' }}>{getMethodLabel(pay.method)} {pay.installments > 1 ? `(${pay.installments}x)` : ''}</td>
                                  <td style={{ padding: '6px 0' }}>R$ {pay.amount.toFixed(2)}</td>
                                  <td style={{ padding: '6px 0' }}>
                                    {pay.status === 'PAID' ? <span style={{ color: 'var(--green)' }}>Pago</span> : <span style={{ color: 'var(--red)' }}>Estornado</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
                  <th style={{ width: '40px' }}></th>
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
                  <React.Fragment key={p.id}>
                    <tr>
                      <td style={{ textAlign: 'center' }}>
                        {p.payments && p.payments.length > 1 && (
                          <button 
                            onClick={() => toggleRow(p.id)} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                          >
                            {expandedRows.includes(p.id) ? '▼' : '▶'}
                          </button>
                        )}
                      </td>
                      <td>{new Date(p.date).toLocaleDateString('pt-BR')}</td>
                      <td style={{ fontWeight: 500 }}>{p.patient.name}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{p.dentist?.name || '-'}</td>
                      <td>{p.serviceType}</td>
                      <td>
                        <span className="badge badge-blue">
                          {p.payments && p.payments.length === 1 
                            ? getMethodLabel(p.payments[0].method) 
                            : 'Múltiplos'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--green)', fontSize: '14px' }}>
                              R$ {getPaidSoFar(p).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => handleSendReceipt(p.payments?.[0]?.id)}>
                            <MessageCircle size={13} /> Comprovante
                          </button>
                          <button className="btn btn-outline-red btn-sm" onClick={() => openRefundModal(p)}>
                            <RefreshCw size={13} /> Estornar
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.includes(p.id) && p.payments && p.payments.length > 1 && (
                      <tr style={{ background: 'var(--bg)' }}>
                        <td></td>
                        <td colSpan={7}>
                          <div style={{ padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card-bg)', margin: '8px 0' }}>
                            <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-primary)' }}>Histórico de Pagamentos</h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                                  <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Data do Pag.</th>
                                  <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Método</th>
                                  <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Valor</th>
                                  <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {p.payments.map((pay: any) => (
                                  <tr key={pay.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '6px 0' }}>{new Date(pay.createdAt || p.date).toLocaleDateString('pt-BR')}</td>
                                    <td style={{ padding: '6px 0' }}>{getMethodLabel(pay.method)} {pay.installments > 1 ? `(${pay.installments}x)` : ''}</td>
                                    <td style={{ padding: '6px 0' }}>R$ {pay.amount.toFixed(2)}</td>
                                    <td style={{ padding: '6px 0' }}>
                                      {pay.status === 'PAID' ? <span style={{ color: 'var(--green)' }}>Pago</span> : <span style={{ color: 'var(--red)' }}>Estornado</span>}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Visão Geral do Período</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => exportToCSV('pending')} style={{ gap: '4px' }}>
                    <Download size={13} /> Exportar Pendentes (CSV)
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => exportToCSV('paid')} style={{ gap: '4px' }}>
                    <Download size={13} /> Exportar Pagos (CSV)
                  </button>
                </div>

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

            {/* Advanced Charts Row */}
            {advancedMetrics && (
              <div className="grid-2" style={{ marginTop: '24px' }}>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', textAlign: 'center' }}>Distribuição de Status (Consultas)</h3>
                  <div style={{ width: '100%', height: '240px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={advancedMetrics.appointmentsByStatus.map((d: any) => ({ ...d, name: STATUS_LABELS[d.name] || d.name }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          stroke="none"
                        >
                          {advancedMetrics.appointmentsByStatus.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name] || '#ccc'} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', textAlign: 'center' }}>Adimplência vs Inadimplência</h3>
                  <div style={{ width: '100%', height: '240px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Pagas', value: advancedMetrics.financialMetrics.paidCount, fill: '#10b981' },
                        { name: 'Pendentes/Inadimplentes', value: advancedMetrics.financialMetrics.unpaidCount, fill: '#ef4444' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          cursor={{fill: 'var(--table-hover)'}}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

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
              <div className="info-box" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Paciente: {selectedAppt.patient.name}</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Valor Total da Consulta: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>R$ {payForm.basePrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Procedimentos Realizados</label>
                <MultiSearchableSelect
                  options={procedures}
                  values={payForm.procedureIds}
                  onChange={handleProceduresChange}
                  placeholder="Selecione os procedimentos"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição/Observação (Opcional)</label>
                <input type="text" className="form-input" value={payForm.serviceType}
                  placeholder="Ex: Restauração adicional, etc."
                  onChange={(e) => setPayForm({ ...payForm, serviceType: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Aplicar Desconto?</label>
                <div style={{ display: 'flex', background: 'var(--bg)', padding: '4px', borderRadius: '8px', width: 'fit-content', border: '1px solid var(--border)' }}>
                  <button 
                    type="button"
                    style={{
                      padding: '6px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      background: payForm.hasDiscount ? 'var(--green)' : 'transparent',
                      color: payForm.hasDiscount ? '#fff' : 'var(--text-secondary)',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => setPayForm({ ...payForm, hasDiscount: true })}
                  >
                    Sim
                  </button>
                  <button 
                    type="button"
                    style={{
                      padding: '6px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      background: !payForm.hasDiscount ? 'var(--red)' : 'transparent',
                      color: !payForm.hasDiscount ? '#fff' : 'var(--text-secondary)',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => {
                      const remaining = Math.max(0, payForm.basePrice - getPaidSoFar(selectedAppt));
                      setPayForm({ ...payForm, hasDiscount: false, discountInput: '', amount: remaining > 0 ? maskCurrency(remaining.toFixed(2).replace('.', '')) : '' });
                    }}
                  >
                    Não
                  </button>
                </div>
              </div>
              
              {payForm.hasDiscount && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tipo de Desconto</label>
                    <select className="form-select" value={payForm.discountType}
                      onChange={(e) => handleDiscountChange(e.target.value as any, payForm.discountInput, payForm.basePrice)}>
                      <option value="PERCENTAGE">Porcentagem (%)</option>
                      <option value="VALUE">Valor (R$)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Desconto</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      className="form-input" 
                      placeholder={payForm.discountType === 'PERCENTAGE' ? '0 a 100' : '0,00'} 
                      value={payForm.discountInput}
                      onChange={(e) => {
                         let val = e.target.value;
                         if (payForm.discountType === 'VALUE') val = maskCurrency(val);
                         handleDiscountChange(payForm.discountType, val, payForm.basePrice);
                      }} 
                    />
                  </div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Valor Final a Cobrar (R$) *</label>
                <input type="text" inputMode="numeric" className="form-input" placeholder="0,00" value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: maskCurrency(e.target.value), discountInput: '' })} />
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
                <strong>Atenção!</strong> Você está prestes a estornar um pagamento do paciente{' '}
                <strong>{refundAppt.patient.name}</strong>.
              </div>
              <div className="form-group">
                <label className="form-label">Selecione o Pagamento *</label>
                <select 
                  className="form-select" 
                  value={selectedPaymentId}
                  onChange={(e) => setSelectedPaymentId(e.target.value)}
                >
                  {refundAppt.payments?.filter((p: any) => p.status === 'PAID').map((p: any) => (
                    <option key={p.id} value={p.id}>
                      R$ {p.amount.toFixed(2)} - {getMethodLabel(p.method)} ({new Date(p.createdAt).toLocaleDateString('pt-BR')})
                    </option>
                  ))}
                </select>
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
