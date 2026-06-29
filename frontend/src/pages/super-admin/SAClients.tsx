import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import saApi from '../../utils/superAdminApi';
import { Plus, Edit2, Shield, CheckCircle2, Ban, Clock, Search, Filter, Trash2 } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  status: string;
  plan: string;
  planExpiresAt: string | null;
  trialEndsAt: string | null;
  createdAt: string;
  _count: {
    users: number;
    patients: number;
    appointments: number;
  };
}

const SAClients: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialFilter = query.get('filter') || 'ALL';

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [createPlan, setCreatePlan] = useState('FREE');
  const [trialDays, setTrialDays] = useState(14);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [planFilter, setPlanFilter] = useState('ALL');
  
  // Debounce search state
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPlan, setEditPlan] = useState('');

  // Confirm Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await saApi.get('/tenants', {
        params: {
          page: currentPage,
          limit: 10,
          search: debouncedSearch,
          status: statusFilter,
          plan: planFilter
        }
      });
      // Handle the new paginated response structure
      if (response.data && response.data.data) {
        setTenants(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.total);
      } else {
        // Fallback if backend isn't updated yet
        setTenants(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [currentPage, debouncedSearch, statusFilter, planFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, planFilter]);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await saApi.post('/tenants', {
        tenantName,
        adminName,
        adminEmail,
        adminPassword,
        plan: createPlan,
        trialDays: Number(trialDays)
      });
      setShowCreateModal(false);
      fetchTenants();
      setTenantName('');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar clínica.');
    }
  };

  const openEditModal = (t: Tenant) => {
    setEditTenant(t);
    setEditStatus(t.status);
    setEditPlan(t.plan);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editTenant) return;
    try {
      if (editTenant.status !== editStatus) {
        await saApi.patch(`/tenants/${editTenant.id}/status`, { status: editStatus });
      }
      if (editTenant.plan !== editPlan) {
        await saApi.patch(`/tenants/${editTenant.id}/plan`, { plan: editPlan });
      }
      setShowEditModal(false);
      fetchTenants();
    } catch (err) {
      alert('Erro ao atualizar clínica.');
    }
  };

  const confirmDelete = (t: Tenant) => {
    setTenantToDelete(t);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!tenantToDelete) return;
    try {
      await saApi.delete(`/tenants/${tenantToDelete.id}`);
      setShowDeleteModal(false);
      fetchTenants();
    } catch (err) {
      alert('Erro ao excluir clínica.');
    }
  };

  const handleImpersonate = async (id: string) => {
    try {
      const res = await saApi.post(`/tenants/${id}/impersonate`);
      const { token, role } = res.data;
      
      const saToken = localStorage.getItem('sa_token');
      localStorage.setItem('_backup_sa_token', saToken || '');
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      window.location.href = '/dashboard';
    } catch (err) {
      alert('Erro ao tentar logar como admin desta clínica.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <span className="sa-badge active"><CheckCircle2 size={12} /> ATIVA</span>;
      case 'SUSPENDED': return <span className="sa-badge suspended"><Ban size={12} /> SUSPENSA</span>;
      case 'TRIAL': return <span className="sa-badge trial"><Clock size={12} /> TRIAL</span>;
      default: return <span className="sa-badge">{status}</span>;
    }
  };

  const getPlanBadge = (plan: string) => {
    const map: Record<string, { label: string, color: string, bg: string }> = {
      FREE: { label: 'Free', color: '#475569', bg: '#f1f5f9' },
      PRO: { label: 'Pro', color: '#1d4ed8', bg: '#dbeafe' },
      ENTERPRISE: { label: 'Enterprise', color: '#6d28d9', bg: '#ede9fe' }
    };
    const mapped = map[plan] || { label: plan, color: '#475569', bg: '#f1f5f9' };
    return (
      <span style={{ backgroundColor: mapped.bg, color: mapped.color, padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, border: `1px solid ${mapped.color}33` }}>
        {mapped.label}
      </span>
    );
  };

  const filteredTenants = tenants; // Backend handles filtering now

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>;

  return (
    <div className="patients-page">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="section-title">
          <h2>Gestão de Clínicas</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          Nova Clínica
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="input-with-icon" style={{ flex: 1, minWidth: '250px' }}>
            <Search size={16} className="input-icon" />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Buscar clínica por nome..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} color="var(--text-secondary)" />
            <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">Todos os Status</option>
              <option value="ACTIVE">Ativos</option>
              <option value="TRIAL">Trial</option>
              <option value="SUSPENDED">Suspensos</option>
            </select>
            <select className="form-control" value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
              <option value="ALL">Todos os Planos</option>
              <option value="FREE">Free</option>
              <option value="PRO">Pro</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card table-container">
        <table className="data-table sa-table">
          <thead>
            <tr>
              <th>Nome da Clínica</th>
              <th>Status</th>
              <th>Plano</th>
              <th>Usuários</th>
              <th>Pacientes</th>
              <th>Cadastro</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 600 }}>{t.name}</td>
                <td>{getStatusBadge(t.status)}</td>
                <td>{getPlanBadge(t.plan)}</td>
                <td>{t._count.users}</td>
                <td>{t._count.patients}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{new Date(t.createdAt).toLocaleDateString('pt-BR')}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button className="btn-icon" title="Editar Status/Plano" onClick={() => openEditModal(t)}>
                      <Edit2 size={16} color="var(--text-secondary)" />
                    </button>
                    <button className="btn-icon" title="Entrar como Admin" onClick={() => handleImpersonate(t.id)}>
                      <Shield size={16} color="var(--primary)" />
                    </button>
                    <button className="btn-icon" title="Excluir Clínica" onClick={() => confirmDelete(t)}>
                      <Trash2 size={16} color="var(--red)" />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => navigate(`/super-admin/clients/${t.id}`)}>
                      Ver Tudo
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTenants.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Nenhuma clínica encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>

        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> ({totalItems} registros)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn btn-outline" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                style={{ padding: '6px 12px' }}
              >
                Anterior
              </button>
              <button 
                className="btn btn-outline" 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                style={{ padding: '6px 12px' }}
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Cadastrar Nova Clínica</h3>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-danger" style={{ margin: '0 1.5rem' }}>{error}</div>}
            <form onSubmit={handleCreateTenant}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome da Clínica</label>
                  <input type="text" className="form-control" required value={tenantName} onChange={e => setTenantName(e.target.value)} />
                </div>
                <h4 style={{ margin: '1rem 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Usuário Administrador</h4>
                <div className="form-group">
                  <label>Nome Completo</label>
                  <input type="text" className="form-control" required value={adminName} onChange={e => setAdminName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>E-mail</label>
                  <input type="email" className="form-control" required value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Senha Provisória</label>
                  <input type="password" className="form-control" required minLength={6} value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
                </div>
                <h4 style={{ margin: '1rem 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Assinatura</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Plano Inicial</label>
                    <select className="form-control" value={createPlan} onChange={e => setCreatePlan(e.target.value)}>
                      <option value="FREE">Free</option>
                      <option value="PRO">Pro</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Dias de Trial (0 = Imediato)</label>
                    <input type="number" className="form-control" min={0} value={trialDays} onChange={e => setTrialDays(Number(e.target.value))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Criar Clínica</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editTenant && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Editar Clínica: {editTenant.name}</h3>
              <button className="btn-icon" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                  <option value="ACTIVE">Ativo</option>
                  <option value="TRIAL">Trial</option>
                  <option value="SUSPENDED">Suspenso</option>
                </select>
              </div>
              <div className="form-group">
                <label>Plano</label>
                <select className="form-control" value={editPlan} onChange={e => setEditPlan(e.target.value)}>
                  <option value="FREE">Free</option>
                  <option value="PRO">Pro</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && tenantToDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--red)' }}>Excluir Clínica</h3>
              <button className="btn-icon" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Tem certeza que deseja excluir a clínica "{tenantToDelete.name}"?</p>
              <div style={{ background: 'var(--red-bg)', color: 'var(--red)', padding: '1rem', borderRadius: '8px', fontSize: '13px', border: '1px solid var(--red-border)' }}>
                <strong>Aviso Crítico:</strong> Esta ação apagará definitivamente todos os dados desta clínica, incluindo usuários, pacientes, consultas, prontuários eletrônicos e finanças associadas. Esta ação não pode ser desfeita.
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: 'none', gap: '1rem' }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button type="button" className="btn" style={{ flex: 1, background: 'var(--red)', color: 'white', border: 'none' }} onClick={handleDelete}>
                Sim, Excluir Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SAClients;
