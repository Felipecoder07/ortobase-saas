import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react';

const Profile: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setName(res.data.name);
      setEmail(res.data.email);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      return setError('As senhas não coincidem.');
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const data: any = { name };
      if (password) data.password = password;

      await api.put('/auth/profile', data);
      setMessage('Perfil atualizado com sucesso!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <p className="page-date-label">Configurações de Conta</p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="card-header">
          <div className="card-header-title">
            <User size={18} color="var(--primary)" />
            Meu Perfil
          </div>
        </div>
        
        <div className="card-body">
          {message && (
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#065F46', fontSize: '14px' }}>
              {message}
            </div>
          )}
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#B91C1C', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">E-mail (Login)</label>
              <input type="email" className="form-input" value={email} disabled style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>O e-mail não pode ser alterado por aqui.</span>
            </div>

            <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }}></div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Alterar Senha</h4>

            <div className="form-group">
              <label className="form-label">Nova Senha</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Deixe em branco para não alterar" style={{ paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {password && (
              <div className="form-group">
                <label className="form-label">Confirmar Nova Senha</label>
                <input type={showPassword ? 'text' : 'password'} className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ gap: '8px' }}>
                <Save size={16} />
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
