import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Plus, Trash2, CheckCircle, XCircle, FileSignature, Lock } from 'lucide-react';
import SignatureModal from './SignatureModal';

interface Procedure {
  id: string;
  name: string;
  basePrice: number;
}

interface PlanItem {
  id?: string;
  procedureId: string;
  procedureName?: string;
  price: number;
  tooth?: string;
  notes?: string;
}

interface TreatmentPlan {
  id: string;
  status: string;
  totalAmount: number;
  discount: number;
  notes: string;
  signatureUrl?: string | null;
  signedAt?: string | null;
  createdAt: string;
  dentist: { name: string };
  items: Array<{
    id: string;
    procedure: { name: string };
    price: number;
    tooth: string | null;
    notes: string | null;
  }>;
}

interface TreatmentPlansTabProps {
  patientId: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const TreatmentPlansTab: React.FC<TreatmentPlansTabProps> = ({ patientId, showToast }) => {
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // New plan state
  const [newItems, setNewItems] = useState<PlanItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [selectedPlanForSignature, setSelectedPlanForSignature] = useState<string | null>(null);

  const role = localStorage.getItem('role');
  const canEdit = role === 'DENTIST' || role === 'ADMIN';

  const fetchPlans = async () => {
    try {
      const res = await api.get(`/ehr/patients/${patientId}/treatment-plans`);
      setPlans(res.data);
    } catch (err) {
      showToast('Erro ao carregar orçamentos.', 'error');
    }
  };

  const fetchProcedures = async () => {
    try {
      const res = await api.get('/procedures');
      setProcedures(res.data);
    } catch (err) {
      showToast('Erro ao carregar procedimentos.', 'error');
    }
  };

  useEffect(() => {
    fetchPlans();
    if (canEdit) {
      fetchProcedures();
    }
    setLoading(false);
  }, [patientId, canEdit]);

  const handleAddItem = () => {
    setNewItems([...newItems, { procedureId: '', price: 0, tooth: '', notes: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    const arr = [...newItems];
    arr.splice(index, 1);
    setNewItems(arr);
  };

  const handleItemChange = (index: number, field: keyof PlanItem, value: any) => {
    const arr = [...newItems];
    
    if (field === 'procedureId') {
      const proc = procedures.find(p => p.id === value);
      if (proc) {
        arr[index].procedureId = proc.id;
        arr[index].price = proc.basePrice;
        arr[index].procedureName = proc.name;
      }
    } else {
      arr[index] = { ...arr[index], [field]: value };
    }
    
    setNewItems(arr);
  };

  const handleCreatePlan = async () => {
    if (newItems.length === 0) {
      showToast('Adicione pelo menos um procedimento.', 'error');
      return;
    }
    if (newItems.some(i => !i.procedureId)) {
      showToast('Selecione o procedimento para todos os itens.', 'error');
      return;
    }

    setSaving(true);
    try {
      const dentistId = localStorage.getItem('userId'); // Supondo que tem o userId no localStorage, ou o backend pega pelo token. 
      // NOTA: O backend do EHR que criamos não pegava userId pelo req.user.id de forma que passava pro corpo. Ele pegava `dentistId` do body. 
      // Vamos assumir que req.user?.id = dentistId no backend ou passamos vazio se o backend resolver. 
      // Para funcionar, vamos passar o userId logado (que salvamos no Login, mas caso não tenha, pegamos do localStorage).
      await api.post(`/ehr/patients/${patientId}/treatment-plans`, {
        items: newItems,
        discount,
        notes,
        dentistId: localStorage.getItem('userId') || undefined
      });
      showToast('Orçamento criado com sucesso!', 'success');
      setIsCreating(false);
      setNewItems([]);
      setDiscount(0);
      setNotes('');
      fetchPlans();
    } catch (err) {
      showToast('Erro ao criar orçamento.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (planId: string, status: string) => {
    try {
      await api.put(`/ehr/treatment-plans/${planId}/status`, { status });
      showToast(`Status atualizado para ${status}`, 'success');
      fetchPlans();
    } catch (err) {
      showToast('Erro ao atualizar status.', 'error');
    }
  };

  const handleSignPlan = async (dataUrl: string) => {
    if (!selectedPlanForSignature) return;
    try {
      await api.post(`/ehr/patients/${patientId}/treatment-plans/${selectedPlanForSignature}/sign`, { signatureDataUrl: dataUrl });
      setSignatureModalOpen(false);
      setSelectedPlanForSignature(null);
      showToast('Orçamento assinado com sucesso!', 'success');
      fetchPlans();
    } catch (err) {
      showToast('Erro ao salvar assinatura.', 'error');
    }
  };

  const openSignatureModal = (planId: string) => {
    setSelectedPlanForSignature(planId);
    setSignatureModalOpen(true);
  };

  const totalAmount = newItems.reduce((acc, item) => acc + Number(item.price), 0);
  const finalAmount = totalAmount - discount;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="badge badge-amber">Pendente</span>;
      case 'APPROVED': return <span className="badge badge-green">Aprovado</span>;
      case 'REJECTED': return <span className="badge badge-red">Rejeitado</span>;
      case 'COMPLETED': return <span className="badge badge-blue">Concluído</span>;
      default: return <span className="badge badge-gray">{status}</span>;
    }
  };

  if (loading) return <div className="empty-state">Carregando orçamentos...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {canEdit && !isCreating && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => setIsCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Novo Orçamento / Plano
          </button>
        </div>
      )}

      {isCreating && (
        <div className="card" style={{ padding: '24px', border: '2px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Novo Orçamento</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {newItems.map((item, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr auto', gap: '12px', alignItems: 'end' }}>
                <div className="form-group">
                  <label className="form-label">Procedimento</label>
                  <select className="form-input" value={item.procedureId} onChange={e => handleItemChange(index, 'procedureId', e.target.value)}>
                    <option value="">Selecione...</option>
                    {procedures.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Dente/Face (Opc)</label>
                  <input className="form-input" value={item.tooth || ''} onChange={e => handleItemChange(index, 'tooth', e.target.value)} placeholder="Ex: 11, 26..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Valor (R$)</label>
                  <input type="number" step="0.01" className="form-input" value={item.price} onChange={e => handleItemChange(index, 'price', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Anotações</label>
                  <input className="form-input" value={item.notes || ''} onChange={e => handleItemChange(index, 'notes', e.target.value)} placeholder="Obs do item..." />
                </div>
                <button className="btn btn-ghost" onClick={() => handleRemoveItem(index)} style={{ marginBottom: '2px', padding: '10px' }}>
                  <Trash2 size={18} color="#ef4444" />
                </button>
              </div>
            ))}
            
            <button className="btn btn-ghost" onClick={handleAddItem} style={{ alignSelf: 'flex-start', color: 'var(--primary)' }}>
              + Adicionar Item
            </button>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Anotações Gerais do Plano</label>
                <textarea className="form-input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Condições de pagamento, validade do orçamento..." />
              </div>
              <div className="form-group">
                <label className="form-label">Desconto (R$)</label>
                <input type="number" step="0.01" className="form-input" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Estimado:</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>R$ {finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button className="btn btn-ghost" onClick={() => setIsCreating(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCreatePlan} disabled={saving}>{saving ? 'Salvando...' : 'Finalizar Orçamento'}</button>
            </div>
          </div>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="empty-state">Nenhum orçamento / plano de tratamento cadastrado.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {plans.map(plan => (
            <div key={plan.id} className="card" style={{ borderLeft: `4px solid ${plan.status === 'APPROVED' ? '#10B981' : plan.status === 'REJECTED' ? '#EF4444' : '#F59E0B'}` }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px' }}>Orçamento - {new Date(plan.createdAt).toLocaleDateString('pt-BR')}</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Dr(a). {plan.dentist.name}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {renderStatusBadge(plan.status)}
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>R$ {(plan.totalAmount - plan.discount).toFixed(2)}</span>
                </div>
              </div>
              
              <div style={{ padding: '0 16px 16px 16px' }}>
                <table className="data-table" style={{ marginTop: '0' }}>
                  <thead>
                    <tr>
                      <th>Procedimento</th>
                      <th>Dente</th>
                      <th>Obs</th>
                      <th style={{ textAlign: 'right' }}>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.items.map(item => (
                      <tr key={item.id}>
                        <td>{item.procedure.name}</td>
                        <td>{item.tooth || '-'}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{item.notes || '-'}</td>
                        <td style={{ textAlign: 'right' }}>R$ {item.price.toFixed(2)}</td>
                      </tr>
                    ))}
                    {plan.discount > 0 && (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'right', fontWeight: 500 }}>Desconto</td>
                        <td style={{ textAlign: 'right', color: '#EF4444' }}>- R$ {plan.discount.toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {plan.notes && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '13px' }}>
                    <strong>Anotações:</strong> {plan.notes}
                  </div>
                )}

                {plan.signatureUrl && (
                  <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E' }}>
                      <Lock size={18} />
                      <strong>Orçamento Assinado pelo Paciente</strong>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <img src={`http://${window.location.hostname}:3000${plan.signatureUrl}`} alt="Assinatura" style={{ maxHeight: '80px', backgroundColor: '#fff', padding: '4px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Assinado em: {plan.signedAt ? new Date(plan.signedAt).toLocaleString('pt-BR') : ''}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions for Status changes */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                  {!plan.signatureUrl && plan.status !== 'REJECTED' && plan.status !== 'COMPLETED' && canEdit && (
                    <button className="btn btn-outline" onClick={() => openSignatureModal(plan.id)} style={{ color: 'var(--text-secondary)' }}>
                      <FileSignature size={16} /> Coletar Assinatura
                    </button>
                  )}
                  {plan.status === 'PENDING' && canEdit && (
                    <>
                      <button className="btn btn-ghost" onClick={() => updateStatus(plan.id, 'REJECTED')} style={{ color: '#EF4444' }}>
                        <XCircle size={16} /> Rejeitar
                      </button>
                      <button className="btn btn-primary" onClick={() => updateStatus(plan.id, 'APPROVED')} style={{ backgroundColor: '#10B981', color: '#fff', borderColor: '#10B981' }}>
                        <CheckCircle size={16} /> Aprovar Orçamento
                      </button>
                    </>
                  )}
                  {plan.status === 'APPROVED' && canEdit && (
                    <button className="btn btn-ghost" onClick={() => updateStatus(plan.id, 'COMPLETED')} style={{ color: '#3B82F6' }}>
                      <CheckCircle size={16} /> Marcar como Concluído
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SignatureModal 
        isOpen={signatureModalOpen} 
        onClose={() => { setSignatureModalOpen(false); setSelectedPlanForSignature(null); }} 
        onSave={handleSignPlan} 
        title="Assinatura do Orçamento" 
        patientId={patientId}
      />
    </div>
  );
};

export default TreatmentPlansTab;
