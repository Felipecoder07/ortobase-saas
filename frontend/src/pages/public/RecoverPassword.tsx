import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const RecoverPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    return () => document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/auth/recover-password', { email });
      setMessage(res.data.message || 'Se o e-mail existir, um link de recuperação foi enviado.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao tentar recuperar a senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px', fontSize: '14px', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Voltar ao Login
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', background: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <KeyRound size={28} color="var(--primary)" />
          </div>
        </div>
        
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', textAlign: 'center', marginBottom: '8px' }}>
          Recuperar Senha
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', textAlign: 'center', marginBottom: '32px', lineHeight: 1.5 }}>
          Digite o e-mail associado à sua conta e enviaremos instruções para redefinir sua senha.
        </p>

        {message ? (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '16px', textAlign: 'center', color: '#065F46' }}>
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="Seu e-mail cadastrado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#B91C1C' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px', fontWeight: 600, marginTop: '8px' }}>
              {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RecoverPassword;
