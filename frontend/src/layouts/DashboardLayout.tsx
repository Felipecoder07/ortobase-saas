import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  DollarSign,
  Moon,
  Sun,
  LogOut,
  ClipboardList,
  Settings,
  User,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const allNavItems = [
  { name: 'Visão Geral', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'DENTIST', 'RECEPTIONIST'] },
  { name: 'Agenda', path: '/dashboard/agenda', icon: Calendar, roles: ['ADMIN', 'DENTIST', 'RECEPTIONIST'] },
  { name: 'Pacientes', path: '/dashboard/patients', icon: Users, roles: ['ADMIN', 'DENTIST', 'RECEPTIONIST'] },
  { name: 'Dentistas', path: '/dashboard/dentists', icon: Stethoscope, roles: ['ADMIN', 'RECEPTIONIST'] },
  { name: 'Procedimentos', path: '/dashboard/procedures', icon: ClipboardList, roles: ['ADMIN', 'RECEPTIONIST'] },
  { name: 'Financeiro', path: '/dashboard/finance', icon: DollarSign, roles: ['ADMIN', 'RECEPTIONIST'] },
  { name: 'Usuários', path: '/dashboard/users', icon: Users, roles: ['ADMIN'] },
];

// Se quisermos as configurações na parte de baixo, ou no menu normal:
const adminNavItems = [
  { name: 'Configurações', path: '/dashboard/settings', icon: Settings, roles: ['ADMIN'] },
  { name: 'Meu Perfil', path: '/dashboard/profile', icon: User, roles: ['ADMIN', 'DENTIST', 'RECEPTIONIST'] },
  { name: 'Auditoria', path: '/dashboard/audit', icon: ShieldCheck, roles: ['ADMIN'] }
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Visão Geral',
  '/dashboard/agenda': 'Agenda',
  '/dashboard/patients': 'Pacientes',
  '/dashboard/dentists': 'Dentistas',
  '/dashboard/procedures': 'Procedimentos',
  '/dashboard/finance': 'Financeiro',
  '/dashboard/users': 'Usuários da Clínica',
  '/dashboard/settings': 'Configurações',
};

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [userRole, setUserRole] = React.useState(localStorage.getItem('role') || '');

  React.useEffect(() => {
    setUserRole(localStorage.getItem('role') || '');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  let pageTitle = 'OrtoBase';
  if (location.pathname.startsWith('/dashboard/patients/') && location.pathname !== '/dashboard/patients') {
    pageTitle = 'Perfil do Paciente';
  } else {
    pageTitle = pageTitles[location.pathname] || 'OrtoBase';
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.5 2 6 4 6 7c0 2 .8 3.5 2 4.5L7 19c-.1.5.3 1 .8 1.1.5.1 1-.3 1.1-.8L9.5 14h5l.6 5.3c.1.5.6.9 1.1.8.5-.1.9-.6.8-1.1L16 11.5C17.2 10.5 18 9 18 7c0-3-2.5-5-6-5z" />
            </svg>
          </div>
          <div className="sidebar-logo-text">
            <h2>OrtoBase</h2>
            <p>Gestão Odontológica</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Menu Principal</div>
          {allNavItems.filter(item => item.roles.includes(userRole)).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="sidebar-nav-icon" size={16} />
                <span>{item.name}</span>
              </button>
            );
          })}
          
          <div className="sidebar-nav-label" style={{ marginTop: '1rem' }}>Preferências</div>
          {adminNavItems.filter(item => item.roles.includes(userRole)).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="sidebar-nav-icon" size={16} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-dark-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <Sun size={15} style={{ opacity: 0.7 }} />
            ) : (
              <Moon size={15} style={{ opacity: 0.7 }} />
            )}
            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={15} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {localStorage.getItem('sa_token') && (
          <div style={{ 
            backgroundColor: 'var(--amber-bg)', 
            color: 'var(--amber)', 
            padding: '12px 24px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid var(--amber)',
            fontWeight: 500
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️ Você está acessando a conta de uma clínica.</span>
            </div>
            <button 
              onClick={() => {
                const backupSaToken = localStorage.getItem('_backup_sa_token');
                localStorage.setItem('sa_token', backupSaToken || '');
                localStorage.setItem('sa_role', 'SUPER_ADMIN');
                localStorage.removeItem('_backup_sa_token');
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                window.location.href = '/super-admin';
              }}
              className="btn btn-primary"
              style={{ padding: '6px 16px', fontSize: '13px', backgroundColor: 'var(--amber)', color: '#fff', border: 'none' }}
            >
              Voltar para Super Admin
            </button>
          </div>
        )}
        
        {/* Header */}
        <header className="main-header">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="main-header-title">{pageTitle}</span>
            <div className="main-header-avatar">U</div>
          </div>
        </header>
        <main className="main-content">
          <div className="container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
