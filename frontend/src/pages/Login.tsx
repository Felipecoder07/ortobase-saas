import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
    }}>
      {/* Left Panel */}
      <div style={{
        flex: '0 0 50%',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #0077B6 100%)',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background circles */}
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }} />

        {/* Content Wrapper */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '480px',
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: '#0077B6',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.5 2 6 4 6 7c0 2 .8 3.5 2 4.5L7 19c-.1.5.3 1 .8 1.1.5.1 1-.3 1.1-.8L9.5 14h5l.6 5.3c.1.5.6.9 1.1.8.5-.1.9-.6.8-1.1L16 11.5C17.2 10.5 18 9 18 7c0-3-2.5-5-6-5z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>OrtoBase</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Sistema de Gestão</div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ zIndex: 1 }}>
            <h1 style={{
              fontSize: '42px',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: '16px',
            }}>
              Sua clínica<br />
              <span style={{ color: '#38BDF8' }}>organizada.</span>
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', marginBottom: '36px', lineHeight: 1.6 }}>
              Gerencie consultas, pacientes e finanças em<br />
              um só lugar. Foque no que importa: o<br />
              cuidado com seus pacientes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Agenda inteligente de consultas',
                'Gestão completa de pacientes',
                'Controle financeiro integrado',
                'Relatórios em tempo real',
              ].map((feature) => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={16} color="#38BDF8" />
                  <span style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.8)' }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', zIndex: 1 }}>
            © 2025 OrtoBase. Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        flex: '0 0 50%',
        background: '#F1F5F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '36px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #E2E8F0',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
            Bem-vindo de volta
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginBottom: '28px' }}>
            Entre com suas credenciais para acessar o sistema
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#B91C1C',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '4px', fontSize: '14px', fontWeight: 600 }}
            >
              {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: '20px' }}>
            Acesso restrito a usuários autorizados
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
