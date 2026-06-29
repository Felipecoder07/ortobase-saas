import React, { useState } from 'react';
import saApi from '../../utils/superAdminApi';
import { User, Lock, Save, ShieldCheck } from 'lucide-react';

const SAProfile: React.FC = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {};
      if (name.trim()) payload.name = name;
      if (password) payload.password = password;

      if (Object.keys(payload).length === 0) {
        setError('Nenhum dado informado para atualizar.');
        setLoading(false);
        return;
      }

      const res = await saApi.patch('/profile', payload);
      setSuccess('Perfil atualizado com sucesso!');
      if (res.data.name) {
        setName('');
        // Optional: Update global name context if you have one
      }
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patients-page">
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <div className="section-title">
          <h2>Meu Perfil - Super Admin</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie suas credenciais de acesso global.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--border)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--primary-bg)', padding: '1rem', borderRadius: '50%' }}>
              <ShieldCheck size={32} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Atualizar Dados</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Preencha apenas os campos que deseja alterar.</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleUpdateProfile} style={{ padding: '1.5rem' }}>
          {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}
          
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} color="var(--text-secondary)" />
              Novo Nome
            </label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Deixe em branco para não alterar" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} color="var(--text-secondary)" />
              Nova Senha
            </label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Deixe em branco para não alterar" 
              minLength={6}
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} color="var(--text-secondary)" />
              Confirmar Nova Senha
            </label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Repita a nova senha" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SAProfile;
