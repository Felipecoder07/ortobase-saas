import React, { useEffect, useState } from 'react';
import saApi from '../../utils/superAdminApi';
import { Users, Search, Shield, Stethoscope, User as UserIcon } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  tenant: {
    name: string;
  };
}

const SAUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await saApi.get('/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.tenant?.name.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    let bg = 'var(--bg)';
    let color = 'var(--text-secondary)';
    let Icon = UserIcon;
    let label = role;

    if (role === 'ADMIN') {
      bg = 'var(--blue-bg)';
      color = 'var(--blue)';
      Icon = Shield;
    } else if (role === 'DENTIST') {
      bg = 'var(--purple-bg)';
      color = 'var(--purple)';
      Icon = Stethoscope;
      label = 'DENTISTA';
    } else if (role === 'RECEPTIONIST') {
      bg = 'var(--amber-bg)';
      color = 'var(--amber)';
      Icon = Users;
      label = 'RECEPCIONISTA';
    }

    return (
      <span style={{ 
        background: bg, 
        color: color,
        padding: '4px 10px', 
        borderRadius: '12px', 
        fontSize: '11px', 
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        border: `1px solid ${color}33`
      }}>
        <Icon size={12} />
        {label}
      </span>
    );
  };

  return (
    <div className="patients-page">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="section-title">
          <h2>Usuários do Sistema</h2>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div className="input-with-icon" style={{ maxWidth: '400px' }}>
            <Search size={16} className="input-icon" />
            <input 
              type="text" 
              className="form-control"
              placeholder="Buscar por nome, email ou clínica..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>
        ) : (
          <table className="data-table sa-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Clínica</th>
                <th>Perfil</th>
                <th>Data de Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>{u.tenant?.name || '-'}</td>
                  <td>{getRoleBadge(u.role)}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum usuário encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SAUsers;
