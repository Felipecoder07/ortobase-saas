import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import saApi from '../../utils/superAdminApi';
import { ShieldCheck, Mail, Lock, ArrowLeft } from 'lucide-react';

const SuperAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await saApi.post('/login', { email, password });
      const { token, role, name } = response.data;
      
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.setItem('sa_token', token);
      localStorage.setItem('sa_role', role);
      
      navigate('/super-admin');
    } catch (err: any) {
      console.error("SA Login error:", err);
      setError(err.response?.data?.error || `Erro de conexão: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sa-login-container" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', width: '100vw' }}>
      <div className="stars-bg"></div>
      <div 
        className="sa-login-card glass-panel" 
        style={{ 
          maxWidth: '420px', 
          width: '100%', 
          padding: '40px 32px', 
          borderRadius: '24px',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/login')}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: 20
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#cbd5e1'; }}
          title="Voltar para o Login das Clínicas"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="login-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div 
            className="login-logo pulse-animation" 
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
              boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}
          >
            <ShieldCheck size={32} color="white" />
          </div>
          <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px' }}>Centro de Comando</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center' }}>Acesso restrito ao Super Admin da OrtoBase</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="sa-form-group" style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>E-mail Corporativo</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                className="sa-form-control"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '12px 12px 12px 42px', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'; }}
              />
            </div>
          </div>

          <div className="sa-form-group" style={{ marginBottom: '24px' }}>
            <label style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Senha de Acesso</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="sa-form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '12px 12px 12px 42px', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'; }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', 
              color: 'white',
              border: 'none', 
              padding: '14px', 
              borderRadius: '12px',
              fontSize: '15px', 
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              transition: 'transform 0.1s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => { if(!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)'; } }}
            onMouseOut={(e) => { if(!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'; } }}
          >
            {loading ? 'Autenticando...' : 'Acessar Painel'}
          </button>


        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
