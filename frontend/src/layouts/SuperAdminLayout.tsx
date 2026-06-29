import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Moon,
  Sun,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const saNavItems = [
  { name: 'Visão Geral', path: '/super-admin', icon: LayoutDashboard },
  { name: 'Clínicas', path: '/super-admin/clients', icon: Building2 },
  { name: 'Usuários Admins', path: '/super-admin/users', icon: Users },
  { name: 'Auditoria', path: '/super-admin/audit', icon: ShieldCheck },
  { name: 'Meu Perfil', path: '/super-admin/profile', icon: Users },
];

const pageTitles: Record<string, string> = {
  '/super-admin': 'Painel Super Admin',
  '/super-admin/clients': 'Gestão de Clínicas',
  '/super-admin/users': 'Usuários do Sistema',
  '/super-admin/audit': 'Logs de Auditoria',
};

const SuperAdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('sa_token');
    localStorage.removeItem('sa_role');
    localStorage.removeItem('_backup_sa_token');
    navigate('/super-admin/login');
  };

  let pageTitle = 'Super Admin';
  if (location.pathname.startsWith('/super-admin/clients/')) {
    pageTitle = 'Detalhes da Clínica';
  } else {
    pageTitle = pageTitles[location.pathname] || 'Super Admin';
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Sidebar with distinct Dark/Navy style for SaaS Premium feel */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: '#3b82f6' }}>
            <ShieldCheck size={20} color="white" />
          </div>
          <div className="sidebar-logo-text">
            <h2>OrtoBase</h2>
            <p>Admin Global</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Menu SaaS</div>
          {saNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/super-admin');
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
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-wrapper">
        <header className="main-header">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="main-header-title">{pageTitle}</span>
              <span className="sa-badge" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none' }}>SaaS Admin</span>
            </div>
            <div 
              className="main-header-avatar" 
              style={{ background: '#0F172A', color: 'white', border: '2px solid #3b82f6', cursor: 'pointer' }}
              onClick={() => navigate('/super-admin/profile')}
              title="Meu Perfil"
            >
              SA
            </div>
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

export default SuperAdminLayout;
