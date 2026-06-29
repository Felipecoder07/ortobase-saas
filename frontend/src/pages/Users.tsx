import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('RECEPTIONIST');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (id) {
        await api.patch(`/users/${id}`, { name, role, password });
      } else {
        await api.post('/users', { name, email, role, password });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar usuário');
    }
  };

  const openNew = () => {
    setId('');
    setName('');
    setEmail('');
    setRole('RECEPTIONIST');
    setPassword('');
    setError('');
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setId(u.id);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setPassword('');
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este usuário?')) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao remover usuário');
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="patients-page">
      <div className="section-header">
        <div className="section-title">
          <h2>Usuários da Clínica</h2>
        </div>
        <div className="section-actions">
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={18} /> Novo Usuário
          </button>
        </div>
      </div>

      <div className="card table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Data de Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span style={{ 
                    background: u.role === 'ADMIN' ? '#e0e7ff' : '#f3f4f6', 
                    color: u.role === 'ADMIN' ? '#4f46e5' : '#4b5563',
                    padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600
                  }}>
                    {u.role === 'ADMIN' ? 'Administrador' : (u.role === 'DENTIST' ? 'Dentista' : 'Recepcionista')}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-icon" onClick={() => openEdit(u)}><Edit2 size={16} /></button>
                    <button className="btn-icon" onClick={() => handleDelete(u.id)}><Trash2 size={16} color="#ef4444" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>{id ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-danger" style={{ margin: '0 1.5rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome Completo</label>
                  <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>E-mail</label>
                  <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required disabled={!!id} />
                </div>
                <div className="form-group">
                  <label>Perfil de Acesso</label>
                  <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="RECEPTIONIST">Recepcionista</option>
                    <option value="DENTIST">Dentista</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{id ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}</label>
                  <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required={!id} minLength={6} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
