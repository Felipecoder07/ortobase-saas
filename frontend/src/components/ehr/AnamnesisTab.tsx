import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';

interface AnamnesisTabProps {
  patientId: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const AnamnesisTab: React.FC<AnamnesisTabProps> = ({ patientId, showToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    mainComplaint: '',
    allergies: '',
    medicationsInUse: '',
    chronicDiseases: '',
    previousSurgeries: '',
    observations: ''
  });

  const role = localStorage.getItem('role');
  const canEdit = role === 'DENTIST' || role === 'ADMIN';

  useEffect(() => {
    const fetchAnamnesis = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:3000/api/ehr/patients/${patientId}/anamnesis`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          setFormData({
            mainComplaint: res.data.mainComplaint || '',
            allergies: res.data.allergies || '',
            medicationsInUse: res.data.medicationsInUse || '',
            chronicDiseases: res.data.chronicDiseases || '',
            previousSurgeries: res.data.previousSurgeries || '',
            observations: res.data.observations || ''
          });
        }
      } catch (err: any) {
        if (err.response && err.response.status !== 404) {
          showToast('Erro ao carregar anamnese.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnamnesis();
  }, [patientId, showToast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/ehr/patients/${patientId}/anamnesis`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Anamnese salva com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao salvar anamnese.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  if (loading) return <div className="empty-state">Carregando formulário...</div>;

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ marginBottom: '24px', fontSize: '18px', color: 'var(--text-primary)' }}>Questionário de Saúde</h3>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="form-group">
          <label className="form-label">Queixa Principal</label>
          <textarea className="form-input" disabled={!canEdit} rows={2} value={formData.mainComplaint} onChange={handleChange('mainComplaint')} placeholder="Motivo da visita..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Alergias</label>
            <textarea className="form-input" disabled={!canEdit} rows={2} value={formData.allergies} onChange={handleChange('allergies')} placeholder="Alergias a medicamentos, alimentos..." />
          </div>
          <div className="form-group">
            <label className="form-label">Medicamentos em Uso</label>
            <textarea className="form-input" disabled={!canEdit} rows={2} value={formData.medicationsInUse} onChange={handleChange('medicationsInUse')} placeholder="Quais remédios toma atualmente..." />
          </div>
          <div className="form-group">
            <label className="form-label">Doenças Crônicas</label>
            <textarea className="form-input" disabled={!canEdit} rows={2} value={formData.chronicDiseases} onChange={handleChange('chronicDiseases')} placeholder="Hipertensão, diabetes, asma..." />
          </div>
          <div className="form-group">
            <label className="form-label">Cirurgias Prévias / Internações</label>
            <textarea className="form-input" disabled={!canEdit} rows={2} value={formData.previousSurgeries} onChange={handleChange('previousSurgeries')} placeholder="Já fez alguma cirurgia?" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Observações Clínicas</label>
          <textarea className="form-input" disabled={!canEdit} rows={3} value={formData.observations} onChange={handleChange('observations')} placeholder="Outras informações relevantes..." />
        </div>
        
        {canEdit ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Anamnese'}
            </button>
          </div>
        ) : (
          <div className="empty-state" style={{ marginTop: '10px', padding: '12px', fontSize: '13px' }}>
            Apenas dentistas ou administradores podem editar o questionário de anamnese.
          </div>
        )}
      </form>
    </div>
  );
};

export default AnamnesisTab;
