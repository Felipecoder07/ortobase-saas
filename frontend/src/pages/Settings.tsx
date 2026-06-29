import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Save, Building2, CreditCard } from 'lucide-react';

interface TenantSettings {
  id: string;
  name: string;
  plan: string;
  status: string;
  planExpiresAt: string | null;
  trialEndsAt: string | null;
  createdAt: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/tenant/settings');
        setSettings(res.data);
        setName(res.data.name);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await api.patch('/tenant/settings', { name });
      setMessage('Configurações salvas com sucesso!');
    } catch (err) {
      setError('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!settings) return <div>Erro ao carregar configurações.</div>;

  return (
    <div className="patients-page">
      <div className="section-header">
        <div className="section-title">
          <h2>Configurações da Clínica</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            <Building2 size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Dados Gerais</h3>
          </div>
          
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Nome da Clínica</label>
              <input 
                type="text" 
                className="form-control" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>ID do Tenant (Uso interno)</label>
              <input 
                type="text" 
                className="form-control" 
                value={settings.id}
                disabled
                style={{ backgroundColor: 'var(--surface-hover)' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            <CreditCard size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Assinatura (SaaS)</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Plano Atual</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)' }}>{settings.plan}</p>
            </div>
            
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status da Conta</p>
              <p style={{ 
                fontSize: '1rem', 
                fontWeight: 600, 
                color: settings.status === 'ACTIVE' ? '#10b981' : (settings.status === 'TRIAL' ? '#f59e0b' : '#ef4444') 
              }}>
                {settings.status}
              </p>
            </div>

            {settings.trialEndsAt && (
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Fim do Trial</p>
                <p style={{ fontSize: '1rem', fontWeight: 500 }}>
                  {new Date(settings.trialEndsAt).toLocaleDateString()}
                </p>
              </div>
            )}
            
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-hover)', borderRadius: '8px', fontSize: '0.9rem' }}>
              Para alterar seu plano ou dados de pagamento, entre em contato com o suporte da plataforma OrtoBase.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
