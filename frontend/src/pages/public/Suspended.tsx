import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Suspended: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    return () => {
      document.documentElement.setAttribute('data-theme', theme);
    };
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#F1F5F9', padding: '2rem' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: '420px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Ban size={64} color="#EF4444" />
        </div>
        <h1 style={{ color: '#0F172A', marginBottom: '1rem', fontSize: '24px', fontWeight: 700 }}>Conta Suspensa</h1>
        <p style={{ color: '#64748B', marginBottom: '2rem', lineHeight: 1.6 }}>
          Sua clínica foi suspensa. Por favor, entre em contato com o suporte ou com o administrador do sistema para regularizar a situação.
        </p>
        <button 
          className="btn btn-primary" 
          onClick={handleLogout}
          style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '14px', fontWeight: 600 }}
        >
          Sair do Sistema
        </button>
      </div>
    </div>
  );
};

export default Suspended;
