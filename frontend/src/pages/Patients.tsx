import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, X, Edit2, User } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { maskCPF, maskPhone, maskDate, maskName } from '../utils/masks';
import { isValidCPF, isValidDate, isFutureDate } from '../utils/validators';

interface Patient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  dateOfBirth: string;
  clinicalNotes?: string;
  avatarUrl?: string;
}

const Patients: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: '', cpf: '', dateOfBirth: '', phone: '', clinicalNotes: '', avatarUrl: '' });

  const openNewModal = () => {
    setEditId(null);
    setFormData({ name: '', cpf: '', dateOfBirth: '', phone: '', clinicalNotes: '', avatarUrl: '' });
    setShowModal(true);
  };

  const openEditModal = (p: Patient) => {
    setEditId(p.id);
    setFormData({ 
      name: p.name, 
      cpf: p.cpf, 
      dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0].split('-').reverse().join('/') : '', 
      phone: p.phone,
      clinicalNotes: p.clinicalNotes || '',
      avatarUrl: p.avatarUrl || ''
    });
    setShowModal(true);
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get(`/patients?query=${search}`);
      setPatients(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPatients(); }, [search]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    try {
      setLoading(true);
      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, avatarUrl: res.data.url }));
      showToast('Foto carregada com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao fazer upload da foto.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.cpf || !formData.phone || !formData.dateOfBirth) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    if (formData.name.trim().split(' ').length < 2) {
      showToast('Digite nome e sobrenome.', 'error');
      return;
    }



    if (formData.phone.length < 14) {
      showToast('Telefone inválido.', 'error');
      return;
    }

    if (!isValidDate(formData.dateOfBirth)) {
      showToast('Data de nascimento inválida.', 'error');
      return;
    }

    if (isFutureDate(formData.dateOfBirth)) {
      showToast('Data de nascimento não pode ser no futuro.', 'error');
      return;
    }

    setLoading(true);
    try {
      const [day, month, year] = formData.dateOfBirth.split('/');
      const payload = { ...formData, dateOfBirth: `${year}-${month}-${day}` };

      if (editId) {
        await api.put(`/patients/${editId}`, payload);
        showToast('Paciente atualizado com sucesso!', 'success');
      } else {
        await api.post('/patients', payload);
        showToast('Paciente cadastrado com sucesso!', 'success');
      }
      setShowModal(false);
      setEditId(null);
      setFormData({ name: '', cpf: '', dateOfBirth: '', phone: '', clinicalNotes: '', avatarUrl: '' });
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
      await api.delete(`/patients/${id}`);
      showToast('Paciente inativado.', 'success');
      fetchPatients();
    } catch { showToast('Erro ao inativar.', 'error'); }
  };

  return (
    <div>
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
        {localStorage.getItem('role') !== 'DENTIST' && (
          <button className="btn btn-primary" onClick={openNewModal}>
            <Plus size={15} />
            Novo Paciente
          </button>
        )}
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
                      {p.avatarUrl ? (
                        <img src={`http://${window.location.hostname}:3000${p.avatarUrl}`} alt="Avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div className="patient-avatar">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                    </div>
                  </td>
                  <td>{p.cpf}</td>
                  <td>{p.phone}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="actions-group">
                      <button
                        className="action-btn blue"
                        onClick={() => navigate(`/dashboard/patients/${p.id}`)}
                        title="Ver Perfil"
                      >
                        <User size={15} />
                      </button>
                      {localStorage.getItem('role') !== 'DENTIST' && (
                        <button
                          className="action-btn green"
                          onClick={() => openEditModal(p)}
                          title="Editar paciente"
                        >
                          <Edit2 size={15} />
                        </button>
                      )}
                      {localStorage.getItem('role') === 'ADMIN' && (
                        <button
                          className="action-btn red"
                          onClick={() => handleDelete(p.id)}
                          title="Inativar paciente"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
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
              <div className="form-group" style={{ alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer' }} className="avatar-upload-container">
                  {formData.avatarUrl ? (
                    <img src={`http://${window.location.hostname}:3000${formData.avatarUrl}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--blue-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold' }}>
                      {formData.name ? formData.name.charAt(0).toUpperCase() : <User size={32} color="var(--primary)" />}
                    </div>
                  )}
                  <div className="avatar-upload-overlay" style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', color: 'white'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, textAlign: 'center' }}>Trocar<br/>Foto</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileUpload} disabled={loading} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nome Completo *</label>
                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: maskName(e.target.value) })} placeholder="Ex: João da Silva" />
              </div>
              <div className="form-group">
                <label className="form-label">CPF *</label>
                <input type="text" className="form-input" value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: maskCPF(e.target.value) })} placeholder="000.000.000-00" />
              </div>
              <div className="form-group">
                <label className="form-label">Data de Nascimento *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="DD/MM/AAAA"
                  value={formData.dateOfBirth} 
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: maskDate(e.target.value) })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone *</label>
                <input type="text" className="form-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">Anotações Clínicas (Opcional)</label>
                <textarea 
                  className="form-textarea" 
                  value={formData.clinicalNotes} 
                  onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })} 
                  placeholder="Alergias, observações importantes, histórico..." 
                />
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
