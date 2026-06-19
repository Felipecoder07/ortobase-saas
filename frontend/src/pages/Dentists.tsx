import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X, Edit2, ChevronDown, User } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { maskPhone, maskName, maskCRO } from '../utils/masks';
import { isValidCRO } from '../utils/validators';

interface Dentist {
  id: string;
  name: string;
  cro: string;
  specialties: string;
  phone: string;
  gender?: string;
  avatarUrl?: string;
}

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

const Dentists: React.FC = () => {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: '', cro_uf: 'SP', cro_number: '', specialties: '', phone: '', gender: 'M', avatarUrl: '' });
  const [showUfDropdown, setShowUfDropdown] = useState(false);

  const openNewModal = () => {
    setEditId(null);
    setFormData({ name: '', cro_uf: 'SP', cro_number: '', specialties: '', phone: '', gender: 'M', avatarUrl: '' });
    setShowModal(true);
  };

  const openEditModal = (d: Dentist) => {
    setEditId(d.id);
    let uf = 'SP';
    let num = d.cro.replace(/\D/g, '');
    const match = d.cro.match(/CRO[- ]?([A-Z]{2})[- ]?(\d+)/i);
    if (match) {
      uf = match[1].toUpperCase();
      num = match[2];
    }
    setFormData({ 
      name: d.name, 
      cro_uf: uf,
      cro_number: num,
      specialties: d.specialties || '', 
      phone: d.phone,
      gender: d.gender || 'M',
      avatarUrl: d.avatarUrl || ''
    });
    setShowModal(true);
  };

  const fetchDentists = async () => {
    try {
      const res = await api.get(`/dentists?query=${search}`);
      setDentists(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchDentists(); }, [search]);

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
    const croFinal = `CRO-${formData.cro_uf} ${formData.cro_number}`;

    if (!formData.name || !formData.cro_number || !formData.phone) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    if (!isValidCRO(croFinal)) {
      showToast('CRO inválido. Formato esperado: CRO-UF 12345', 'error');
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

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        cro: croFinal,
        specialties: formData.specialties,
        phone: formData.phone,
        gender: formData.gender,
        avatarUrl: formData.avatarUrl
      };

      if (editId) {
        await api.put(`/dentists/${editId}`, payload);
        showToast('Dentista atualizado com sucesso!', 'success');
      } else {
        await api.post('/dentists', payload);
        showToast('Dentista cadastrado com sucesso!', 'success');
      }
      setShowModal(false);
      setEditId(null);
      setFormData({ name: '', cro_uf: 'SP', cro_number: '', specialties: '', phone: '', gender: 'M', avatarUrl: '' });
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
      await api.delete(`/dentists/${id}`);
      showToast('Dentista inativado.', 'success');
      fetchDentists();
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
            placeholder="Buscar por nome ou CRO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openNewModal}>
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
                      {d.avatarUrl ? (
                        <img src={`http://${window.location.hostname}:3000${d.avatarUrl}`} alt="Avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div className="patient-avatar">
                          {d.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span style={{ fontWeight: 500 }}>{d.name}</span>
                    </div>
                  </td>
                  <td>{d.cro}</td>
                  <td>{d.specialties || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td>{d.phone}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="actions-group">
                      <button
                        className="action-btn green"
                        onClick={() => openEditModal(d)}
                        title="Editar dentista"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="action-btn red"
                        onClick={() => handleDelete(d.id)}
                        title="Inativar dentista"
                      >
                        <Trash2 size={15} />
                      </button>
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
              <span className="modal-title">{editId ? 'Editar Dentista' : 'Cadastrar Dentista'}</span>
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    className="form-input" 
                    style={{ flex: '0 0 100px' }} 
                    value={formData.gender} 
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="M">Dr.</option>
                    <option value="F">Dra.</option>
                  </select>
                  <input type="text" className="form-input" style={{ flex: '1' }} value={formData.name} onChange={(e) => setFormData({ ...formData, name: maskName(e.target.value) })} placeholder="João Silva" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">CRO *</label>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <div style={{ position: 'relative', flex: '0 0 110px' }}>
                    <div 
                      className="form-input"
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', height: '100%' }}
                      onClick={() => setShowUfDropdown(!showUfDropdown)}
                    >
                      <span>CRO-{formData.cro_uf}</span>
                      <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    {showUfDropdown && (
                      <>
                        <div 
                          style={{ position: 'fixed', inset: 0, zIndex: 999 }} 
                          onClick={() => setShowUfDropdown(false)} 
                        />
                        <div style={{
                          position: 'absolute',
                          top: 'calc(100% + 4px)',
                          left: 0,
                          width: '100%',
                          maxHeight: '160px',
                          overflowY: 'auto',
                          background: 'var(--card-bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          zIndex: 1000,
                          boxShadow: 'var(--shadow-sm)',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          {UFS.map(uf => (
                            <div 
                              key={uf}
                              style={{ 
                                padding: '8px 12px', 
                                cursor: 'pointer',
                                fontSize: '13.5px',
                                color: 'var(--text-primary)',
                                background: formData.cro_uf === uf ? 'var(--bg)' : 'transparent'
                              }}
                              onClick={() => { setFormData({...formData, cro_uf: uf}); setShowUfDropdown(false); }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                              onMouseLeave={(e) => {
                                if (formData.cro_uf !== uf) e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              CRO-{uf}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ flex: '1', minWidth: '0' }}
                    value={formData.cro_number} 
                    onChange={(e) => setFormData({ ...formData, cro_number: e.target.value.replace(/\D/g, '').slice(0, 6) })} 
                    placeholder="Somente números" 
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Especialidades</label>
                <input type="text" className="form-input" value={formData.specialties} onChange={(e) => setFormData({ ...formData, specialties: e.target.value })} placeholder="Ex: Ortodontia, Implantes" />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone *</label>
                <input type="text" className="form-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" />
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
