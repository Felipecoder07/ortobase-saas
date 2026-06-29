import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import saApi from '../../utils/superAdminApi';
import { Users, Building2, Calendar, DollarSign, Clock, Ban, LogIn, ChevronRight, Activity, TrendingUp } from 'lucide-react';

interface GlobalStats {
  totalTenants: number;
  totalUsers: number;
  monthlyAppointments: number;
  monthlyRevenue: number;
}

interface Tenant {
  id: string;
  name: string;
  status: string;
  plan: string;
  createdAt: string;
}

const SADashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [recentTenants, setRecentTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tenantsRes] = await Promise.all([
          saApi.get('/stats'),
          saApi.get('/tenants')
        ]);
        setStats(statsRes.data);
        setRecentTenants(tenantsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderLeftColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Carregando painel de controle...</span>
    </div>
  );
  
  if (!stats) return <div style={{ padding: '2rem', color: 'var(--red)', fontWeight: 500, textAlign: 'center' }}>Erro ao carregar dados do dashboard. Verifique sua conexão.</div>;

  return (
    <div className="dashboard-content" style={{ animation: 'fadeIn 0.5s ease' }}>
      
      {/* Welcome Banner */}
      <div className="sa-welcome-banner">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2>Centro de Controle SaaS</h2>
          <p>Visão global do sistema. Monitore o crescimento, gerencie clínicas e acompanhe o desempenho financeiro em tempo real.</p>
        </div>
        <div style={{ position: 'relative', zIndex: 2, background: 'rgba(255,255,255,0.1)', padding: '16px 24px', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ fontSize: '13px', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Status do Sistema</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', fontWeight: 700, fontSize: '18px' }}>
            <Activity size={20} />
            Operacional
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ gap: '24px' }}>
        <div className="sa-premium-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Clínicas Ativas</div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stats.totalTenants}</div>
            </div>
            <div style={{ background: 'var(--blue-bg)', color: 'var(--blue)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px', fontSize: '13px', color: 'var(--green)', fontWeight: 600 }}>
            <TrendingUp size={14} /> <span>+3% este mês</span>
          </div>
        </div>

        <div className="sa-premium-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Total de Usuários</div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stats.totalUsers}</div>
            </div>
            <div style={{ background: 'var(--green-bg)', color: 'var(--green)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Em toda a plataforma
          </div>
        </div>

        <div className="sa-premium-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Consultas no Mês</div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stats.monthlyAppointments}</div>
            </div>
            <div style={{ background: 'var(--amber-bg)', color: 'var(--amber)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Volume transacionado
          </div>
        </div>

        <div className="sa-premium-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05, transform: 'rotate(-15deg)' }}>
            <DollarSign size={120} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Receita Global (MRR)</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.5px' }}>
                {stats.monthlyRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
            <div style={{ background: 'var(--purple-bg)', color: 'var(--purple)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px', fontSize: '13px', color: 'var(--green)', fontWeight: 600, position: 'relative', zIndex: 2 }}>
            <TrendingUp size={14} /> <span>+5% em relação ao mês anterior</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', marginTop: '24px' }}>
        
        {/* Shortcuts */}
        <div className="sa-premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Ações Rápidas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <button className="sa-shortcut-btn" onClick={() => navigate('/super-admin/clients?filter=TRIAL')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="sa-shortcut-icon" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <span className="sa-shortcut-title">Clínicas em Trial</span>
                  <span className="sa-shortcut-desc">Veja quais assinaturas vão expirar</span>
                </div>
              </div>
              <ChevronRight size={20} color="var(--text-muted)" />
            </button>

            <button className="sa-shortcut-btn" onClick={() => navigate('/super-admin/clients?filter=SUSPENDED')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="sa-shortcut-icon" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>
                  <Ban size={20} />
                </div>
                <div>
                  <span className="sa-shortcut-title">Clínicas Suspensas</span>
                  <span className="sa-shortcut-desc">Gerencie bloqueios e inadimplência</span>
                </div>
              </div>
              <ChevronRight size={20} color="var(--text-muted)" />
            </button>

            <button className="sa-shortcut-btn" onClick={() => navigate('/super-admin/audit?filter=LOGIN')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="sa-shortcut-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}>
                  <LogIn size={20} />
                </div>
                <div>
                  <span className="sa-shortcut-title">Últimos Acessos</span>
                  <span className="sa-shortcut-desc">Auditoria de segurança e logins recentes</span>
                </div>
              </div>
              <ChevronRight size={20} color="var(--text-muted)" />
            </button>
          </div>
        </div>

        {/* Recent Clinics */}
        <div className="sa-premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Clínicas Cadastradas Recentemente</h3>
            <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }} onClick={() => navigate('/super-admin/clients')}>
              Ver todas
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentTenants.map(t => (
              <div 
                key={t.id} 
                onClick={() => navigate(`/super-admin/clients/${t.id}`)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent',
                  background: 'var(--bg)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--blue-bg)';
                  e.currentTarget.style.borderColor = 'var(--blue-border)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--bg)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <Building2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Cadastrado em {new Date(t.createdAt).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--border)', padding: '2px 8px', borderRadius: '6px' }}>
                    {t.plan}
                  </span>
                  <span className={`sa-badge ${t.status.toLowerCase()}`}>{t.status}</span>
                </div>
              </div>
            ))}

            {recentTenants.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'var(--bg)', borderRadius: '12px' }}>
                Nenhuma clínica cadastrada recentemente.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SADashboard;
