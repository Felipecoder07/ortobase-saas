import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Procedure {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  isActive: boolean;
}

const Procedures: React.FC = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProc, setEditingProc] = useState<Procedure | null>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ name: '', description: '', basePrice: '' });

  const fetchProcedures = async () => {
    try {
      const res = await api.get('/procedures');
      setProcedures(res.data);
    } catch (err) {
      showToast('Erro ao carregar procedimentos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcedures();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProc) {
        await api.put(`/procedures/${editingProc.id}`, formData);
        showToast('Procedimento atualizado!', 'success');
      } else {
        await api.post('/procedures', formData);
        showToast('Procedimento criado!', 'success');
      }
      setIsModalOpen(false);
      fetchProcedures();
    } catch (err) {
      showToast('Erro ao salvar procedimento.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja inativar este procedimento? Ele não aparecerá mais nos novos orçamentos.')) return;
    try {
      await api.delete(`/procedures/${id}`);
      showToast('Procedimento inativado!', 'success');
      fetchProcedures();
    } catch (err) {
      showToast('Erro ao deletar.', 'error');
    }
  };

  const openModal = (proc?: Procedure) => {
    if (proc) {
      setEditingProc(proc);
      setFormData({ name: proc.name, description: proc.description || '', basePrice: proc.basePrice.toString() });
    } else {
      setEditingProc(null);
      setFormData({ name: '', description: '', basePrice: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1 className="page-title">Catálogo de Procedimentos</h1>
          <p className="page-subtitle">Gerencie os procedimentos disponíveis para orçamentos</p>
        </div>
        {localStorage.getItem('role') === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Novo Procedimento
          </button>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Carregando...</div>
        ) : procedures.length === 0 ? (
          <div className="empty-state">Nenhum procedimento cadastrado.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Preço Base</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {procedures.map(proc => (
                <tr key={proc.id}>
                  <td style={{ fontWeight: 500 }}>{proc.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{proc.description || '-'}</td>
                  <td>R$ {proc.basePrice.toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {localStorage.getItem('role') === 'ADMIN' && (
                        <>
                          <button className="btn btn-ghost" onClick={() => openModal(proc)} style={{ padding: '6px' }}>
                            <Edit2 size={16} color="var(--text-secondary)" />
                          </button>
                          <button className="btn btn-ghost" onClick={() => handleDelete(proc.id)} style={{ padding: '6px' }}>
                            <Trash2 size={16} color="#ef4444" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{editingProc ? 'Editar Procedimento' : 'Novo Procedimento'}</h2>
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Nome do Procedimento</label>
                  <input required className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Descrição</label>
                  <input className="form-input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Preço Base (R$)</label>
                  <input required type="number" step="0.01" className="form-input" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Procedures;
