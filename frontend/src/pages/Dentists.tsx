import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X } from 'lucide-react';
import axios from 'axios';

interface Dentist {
  id: string;
  name: string;
  cro: string;
  specialties: string;
  phone: string;
}

const Dentists: React.FC = () => {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({ name: '', cro: '', specialties: '', phone: '' });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDentists = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/dentists?query=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDentists(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchDentists(); }, [search]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/dentists', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Dentista cadastrado com sucesso!', 'success');
      setShowModal(false);
      setFormData({ name: '', cro: '', specialties: '', phone: '' });
      fetchDentists();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao salvar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja inativar este dentista?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/dentists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Dentista inativado.', 'success');
      fetchDentists();
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
            placeholder="Buscar por nome ou CRO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} />
          Novo Dentista
        </button>
      </div>

      {/* Table */}
      <div className="card">
        {dentists.length === 0 ? (
          <div className="empty-state">Nenhum dentista encontrado.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CRO</th>
                <th>Especialidade</th>
                <th>Telefone</th>
                <th style={{ width: '80px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dentists.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="patient-avatar">
                        {d.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{d.name}</span>
                    </div>
                  </td>
                  <td>{d.cro}</td>
                  <td>{d.specialties || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td>{d.phone}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '6px' }}
                      onClick={() => handleDelete(d.id)}
                      title="Inativar dentista"
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
              <span className="modal-title">Cadastrar Dentista</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nome Completo *</label>
                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Dr. João Silva" />
              </div>
              <div className="form-group">
                <label className="form-label">CRO *</label>
                <input type="text" className="form-input" value={formData.cro} onChange={(e) => setFormData({ ...formData, cro: e.target.value })} placeholder="CRO-SP 12345" />
              </div>
              <div className="form-group">
                <label className="form-label">Especialidades</label>
                <input type="text" className="form-input" value={formData.specialties} onChange={(e) => setFormData({ ...formData, specialties: e.target.value })} placeholder="Ex: Ortodontia, Implantes" />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone *</label>
                <input type="text" className="form-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Dentista'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dentists;
