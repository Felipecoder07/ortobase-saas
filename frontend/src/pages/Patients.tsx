import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, X, Edit2, User } from 'lucide-react';
import axios from 'axios';

interface Patient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  dateOfBirth: string;
}

const Patients: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({ name: '', cpf: '', dateOfBirth: '', phone: '' });

  const openNewModal = () => {
    setEditId(null);
    setFormData({ name: '', cpf: '', dateOfBirth: '', phone: '' });
    setShowModal(true);
  };

  const openEditModal = (p: Patient) => {
    setEditId(p.id);
    setFormData({ 
      name: p.name, 
      cpf: p.cpf, 
      dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '', 
      phone: p.phone 
    });
    setShowModal(true);
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/patients?query=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPatients(); }, [search]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (editId) {
        await axios.put(`http://localhost:3000/api/patients/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast('Paciente atualizado com sucesso!', 'success');
      } else {
        await axios.post('http://localhost:3000/api/patients', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast('Paciente cadastrado com sucesso!', 'success');
      }
      setShowModal(false);
      setEditId(null);
      setFormData({ name: '', cpf: '', dateOfBirth: '', phone: '' });
      fetchPatients();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao salvar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja inativar este paciente?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Paciente inativado.', 'success');
      fetchPatients();
    } catch { showToast('Erro ao inativar.', 'error'); }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
          color: toast.type === 'success' ? '#15803D' : '#B91C1C',
          padding: '12px 16px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex-between mb-4">
        <div className="search-wrapper" style={{ width: '320px' }}>
          <Search className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openNewModal}>
          <Plus size={15} />
          Novo Paciente
        </button>
      </div>

      {/* Table */}
      <div className="card">
        {patients.length === 0 ? (
          <div className="empty-state">Nenhum paciente encontrado.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th style={{ width: '80px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="patient-avatar">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                    </div>
                  </td>
                  <td>{p.cpf}</td>
                  <td>{p.phone}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366F1', padding: '6px', marginRight: '4px' }}
                      onClick={() => navigate(`/dashboard/patients/${p.id}`)}
                      title="Ver Perfil"
                    >
                      <User size={15} />
                    </button>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '6px', marginRight: '4px' }}
                      onClick={() => openEditModal(p)}
                      title="Editar paciente"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="btn-icon"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '6px' }}
                      onClick={() => handleDelete(p.id)}
                      title="Inativar paciente"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editId ? 'Editar Paciente' : 'Cadastrar Paciente'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nome Completo *</label>
                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: João da Silva" />
              </div>
              <div className="form-group">
                <label className="form-label">CPF *</label>
                <input type="text" className="form-input" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} placeholder="000.000.000-00" />
              </div>
              <div className="form-group">
                <label className="form-label">Data de Nascimento *</label>
                <input type="date" className="form-input" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone *</label>
                <input type="text" className="form-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Paciente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
