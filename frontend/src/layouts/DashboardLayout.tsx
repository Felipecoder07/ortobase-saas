import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  DollarSign,
  Moon,
  LogOut,
} from 'lucide-react';

const navItems = [
  { name: 'Visão Geral', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Agenda', path: '/dashboard/agenda', icon: Calendar },
  { name: 'Pacientes', path: '/dashboard/patients', icon: Users },
  { name: 'Dentistas', path: '/dashboard/dentists', icon: Stethoscope },
  { name: 'Financeiro', path: '/dashboard/finance', icon: DollarSign },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Visão Geral',
  '/dashboard/agenda': 'Agenda',
  '/dashboard/patients': 'Pacientes',
  '/dashboard/dentists': 'Dentistas',
  '/dashboard/finance': 'Financeiro',
};

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const pageTitle = pageTitles[location.pathname] || 'OrtoBase';

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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="sidebar-nav-icon" size={16} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-dark-toggle">
            <Moon size={15} style={{ opacity: 0.7 }} />
            Modo Escuro
          </button>
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={15} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-wrapper">
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
