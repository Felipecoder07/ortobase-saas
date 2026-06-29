import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import saApi from '../../utils/superAdminApi';
import { Building2, ArrowLeft, Shield, Users, Calendar, Play, Pause, Trash2, Edit3, Check, X, Clock } from 'lucide-react';

interface TenantDetail {
  id: string;
  name: string;
  status: string;
  plan: string;
  planExpiresAt: string | null;
  trialEndsAt: string | null;
  createdAt: string;
  users: { id: string; name: string; email: string; role: string; createdAt: string }[];
  _count: {
    patients: number;
    appointments: number;
    dentists: number;
  };
}

const SAClientDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Name
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // Plan Edit Modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editPlan, setEditPlan] = useState('');
  const [editTrialDays, setEditTrialDays] = useState(0);

  const fetchTenant = async () => {
    try {
      const response = await saApi.get(`/tenants/${id}`);
      setTenant(response.data);
      setEditNameValue(response.data.name);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar detalhes da clínica.');
      navigate('/super-admin/clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [id]);

  const handleSaveName = async () => {
    if (!editNameValue.trim() || !tenant) return;
    try {
      await saApi.patch(`/tenants/${id}/name`, { name: editNameValue });
      setTenant({ ...tenant, name: editNameValue });
      setIsEditingName(false);
    } catch (err) {
      alert('Erro ao atualizar o nome da clínica.');
    }
  };

  const handleToggleStatus = async () => {
    if (!tenant) return;
    const newStatus = tenant.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await saApi.patch(`/tenants/${id}/status`, { status: newStatus });
      fetchTenant();
      setShowStatusModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePlan = async () => {
    if (!tenant) return;
    try {
      let trialEndsAt = null;
      if (editTrialDays > 0) {
        trialEndsAt = new Date(Date.now() + editTrialDays * 24 * 60 * 60 * 1000).toISOString();
      }
      await saApi.patch(`/tenants/${id}/plan`, { plan: editPlan, trialEndsAt });
      fetchTenant();
      setShowPlanModal(false);
    } catch (err) {
      alert('Erro ao atualizar plano da clínica.');
    }
  };

  const handleImpersonate = async () => {
    try {
      const res = await saApi.post(`/tenants/${id}/impersonate`);
      const { token, role } = res.data;
      
      const currentToken = localStorage.getItem('token');
      const currentRole = localStorage.getItem('role');
      if (currentToken) localStorage.setItem('sa_token', currentToken);
      if (currentRole) localStorage.setItem('sa_role', currentRole);
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      window.location.href = '/dashboard';
    } catch (err) {
      alert('Não foi possível entrar como Admin desta clínica.');
    }
  };

  const handleDelete = async () => {
    try {
      await saApi.delete(`/tenants/${id}`);
      navigate('/super-admin/clients');
    } catch (err) {
      alert('Erro ao deletar clínica.');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando detalhes...</div>;
  if (!tenant) return null;

  return (
    <div className="patient-profile">
      <div className="profile-header" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: 'var(--shadow-sm)' }}>
        <button className="btn-icon" onClick={() => navigate('/super-admin/clients')} style={{ background: 'var(--bg)', borderRadius: '50%', padding: '8px' }}>
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>
        <div className="profile-avatar" style={{ background: 'linear-gradient(135deg, var(--primary), var(--purple))', color: 'white', borderRadius: '16px', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Building2 size={32} />
        </div>
        <div className="profile-info" style={{ flex: 1 }}>
          {isEditingName ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text" 
                className="form-control" 
                value={editNameValue} 
                onChange={e => setEditNameValue(e.target.value)} 
                autoFocus
              />
              <button className="btn-icon" onClick={handleSaveName} style={{ background: 'var(--green-bg)', color: 'var(--green)' }}><Check size={18} /></button>
              <button className="btn-icon" onClick={() => { setIsEditingName(false); setEditNameValue(tenant.name); }} style={{ background: 'var(--red-bg)', color: 'var(--red)' }}><X size={18} /></button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{tenant.name}</h2>
              <button className="btn-icon" onClick={() => setIsEditingName(true)} title="Editar Nome"><Edit3 size={16} color="var(--text-secondary)" /></button>
            </div>
          )}
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>ID: {tenant.id} &bull; Cadastrado em: {new Date(tenant.createdAt).toLocaleDateString()}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary" onClick={handleImpersonate}>
            <Shield size={16} /> Entrar como Admin
          </button>
          <button className={`btn ${tenant.status === 'SUSPENDED' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setShowStatusModal(true)}>
            {tenant.status === 'SUSPENDED' ? <Play size={16} /> : <Pause size={16} />}
            {tenant.status === 'SUSPENDED' ? 'Ativar Clínica' : 'Suspender Clínica'}
          </button>
          <button className="btn btn-outline" style={{ color: 'var(--red)', borderColor: 'var(--red-border)' }} onClick={() => setShowDeleteModal(true)}>
            <Trash2 size={16} /> Excluir
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', marginTop: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header"><h3 className="card-header-title">Informações Gerais</h3></div>
            <div className="card-body">
              <p><strong>Status:</strong> <span className={`sa-badge ${tenant.status.toLowerCase()}`} style={{ marginLeft: '8px' }}>{tenant.status}</span></p>
              
              <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><strong>Plano Atual:</strong> <span style={{ fontWeight: 700, marginLeft: '8px', color: 'var(--primary)' }}>{tenant.plan}</span></span>
                  <button className="btn-icon" title="Editar Plano" onClick={() => { setEditPlan(tenant.plan); setEditTrialDays(0); setShowPlanModal(true); }}>
                    <Edit3 size={16} color="var(--text-secondary)" />
                  </button>
                </div>
                {tenant.trialEndsAt && new Date(tenant.trialEndsAt) > new Date() && (
                  <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    Trial encerra em: {new Date(tenant.trialEndsAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header"><h3 className="card-header-title">Estatísticas de Uso</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}><Users size={16} /> Usuários</span>
                <strong style={{ fontSize: '16px' }}>{tenant.users.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}><Users size={16} /> Pacientes</span>
                <strong style={{ fontSize: '16px' }}>{tenant._count.patients}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}><Building2 size={16} /> Dentistas</span>
                <strong style={{ fontSize: '16px' }}>{tenant._count.dentists}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}><Calendar size={16} /> Consultas</span>
                <strong style={{ fontSize: '16px' }}>{tenant._count.appointments}</strong>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-header"><h3 className="card-header-title">Usuários Vinculados ({tenant.users.length})</h3></div>
            <div style={{ padding: 0 }}>
              <table className="data-table sa-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th>Entrada</th>
                  </tr>
                </thead>
                <tbody>
                  {tenant.users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span style={{ 
                          background: u.role === 'ADMIN' ? 'var(--blue-bg)' : 'var(--bg)', 
                          color: u.role === 'ADMIN' ? 'var(--blue)' : 'var(--text-secondary)',
                          padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showStatusModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Confirmar Ação</h3>
              <button className="btn-icon" onClick={() => setShowStatusModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '15px' }}>Deseja realmente {tenant.status === 'SUSPENDED' ? <strong style={{color: 'var(--green)'}}>ativar</strong> : <strong style={{color: 'var(--red)'}}>suspender</strong>} a clínica <strong>{tenant.name}</strong>?</p>
              {tenant.status !== 'SUSPENDED' && (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>Uma clínica suspensa impede o acesso de todos os seus usuários ao sistema.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowStatusModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleToggleStatus}>Sim, Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--red)' }}>Excluir Clínica</h3>
              <button className="btn-icon" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Tem certeza que deseja excluir a clínica "{tenant.name}"?</p>
              <div style={{ background: 'var(--red-bg)', color: 'var(--red)', padding: '1rem', borderRadius: '8px', fontSize: '13px', border: '1px solid var(--red-border)' }}>
                <strong>Ação Irreversível:</strong> Todos os dados, prontuários, financeiro, e usuários desta clínica serão permanentemente deletados do banco de dados.
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: 'none', gap: '1rem' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className="btn" style={{ flex: 1, background: 'var(--red)', color: 'white', border: 'none' }} onClick={handleDelete}>
                Sim, Excluir Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
      {showPlanModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Alterar Plano / Trial</h3>
              <button className="btn-icon" onClick={() => setShowPlanModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Plano</label>
                <select className="form-control" value={editPlan} onChange={e => setEditPlan(e.target.value)}>
                  <option value="FREE">Free</option>
                  <option value="PRO">Pro</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estender Trial (Dias a partir de hoje)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min={0} 
                  value={editTrialDays} 
                  onChange={e => setEditTrialDays(Number(e.target.value))} 
                  placeholder="Ex: 14"
                />
                <small style={{ color: 'var(--text-secondary)' }}>Deixe 0 para não alterar ou remover trial.</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowPlanModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSavePlan}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SAClientDetail;
