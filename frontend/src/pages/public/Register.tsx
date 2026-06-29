import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Eye, EyeOff, Building, User, Mail, Lock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Register: React.FC = () => {
  const [tenantName, setTenantName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/register', { tenantName, name, email, password });
      
      // Faça login automático ou redirecione
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao registrar clínica. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      width: '100%',
      // Força as variáveis do tema claro localmente para não dar conflito com o dark mode
      '--bg': '#F1F5F9',
      '--card-bg': '#FFFFFF',
      '--border': '#E2E8F0',
      '--text-primary': '#0F172A',
      '--text-secondary': '#64748B',
      '--text-muted': '#94A3B8',
      '--shadow-md': '0 4px 24px rgba(0,0,0,0.08)',
    } as React.CSSProperties}>
      <div style={{ flex: '0 0 50%', background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #0077B6 100%)', padding: '40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-80px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)' }}></div>
        <div style={{ position: 'absolute', bottom: '0px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.08)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'auto' }}>
            <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.5 2 6 4 6 7c0 2 .8 3.5 2 4.5L7 19c-.1.5.3 1 .8 1.1.5.1 1-.3 1.1-.8L9.5 14h5l.6 5.3c.1.5.6.9 1.1.8.5-.1.9-.6.8-1.1L16 11.5C17.2 10.5 18 9 18 7c0-3-2.5-5-6-5z" />
              </svg>
            </div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>OrtoBase</h1>
          </div>

          <div style={{ marginBottom: '60px' }}>
            <h2 style={{ color: 'white', fontSize: '42px', fontWeight: 700, lineHeight: 1.2, marginBottom: '20px' }}>
              Transforme a gestão<br />da sua clínica odontológica.
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '18px', lineHeight: 1.6, maxWidth: '480px' }}>
              Cadastre-se hoje e tenha prontuários eletrônicos, agenda inteligente, faturamento completo e muito mais.
            </p>
          </div>
        </div>
      </div>

      <div style={{ flex: '0 0 50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
            Crie sua conta
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '28px' }}>
            Preencha os dados abaixo para iniciar sua jornada
          </p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Nome da Clínica</label>
              <div style={{ position: 'relative' }}>
                <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type="text" className="form-input" style={{ paddingLeft: '36px' }} placeholder="Minha Clínica Odonto" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Seu Nome (Administrador)</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type="text" className="form-input" style={{ paddingLeft: '36px' }} placeholder="Dr. João Silva" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type="email" className="form-input" style={{ paddingLeft: '36px' }} placeholder="contato@clinica.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type={showPassword ? 'text' : 'password'} className="form-input" style={{ paddingLeft: '36px', paddingRight: '40px' }} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#B91C1C' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '4px', fontSize: '14px', fontWeight: 600 }}>
              {isLoading ? 'Registrando...' : 'Criar minha Clínica'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748B', marginTop: '20px' }}>
            Já tem uma conta? <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Faça login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
