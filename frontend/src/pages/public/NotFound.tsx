import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Search } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    return () => document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#F1F5F9', padding: '2rem' }}>
      <div style={{ background: 'white', padding: '60px 40px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: '460px', width: '100%' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '100px', fontWeight: 800, color: '#E2E8F0', margin: 0, lineHeight: 1 }}>404</h1>
          <Search size={48} color="var(--primary)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        </div>
        <h2 style={{ color: '#0F172A', marginBottom: '12px', fontSize: '24px', fontWeight: 700 }}>Página não encontrada</h2>
        <p style={{ color: '#64748B', marginBottom: '32px', lineHeight: 1.6 }}>
          Oops! A página que você está procurando não existe, foi removida ou você não tem permissão para acessá-la.
        </p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/dashboard')}
          style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px', fontWeight: 600 }}
        >
          Voltar para o Início
        </button>
      </div>
    </div>
  );
};

export default NotFound;
