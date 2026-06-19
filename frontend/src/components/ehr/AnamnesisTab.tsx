import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Save, FileSignature, Lock, Unlock } from 'lucide-react';
import SignatureModal from './SignatureModal';

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
  const [isSignatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureInfo, setSignatureInfo] = useState<{ url: string; date: string } | null>(null);

  const role = localStorage.getItem('role');
  const canEdit = role === 'DENTIST' || role === 'ADMIN';

  useEffect(() => {
    const fetchAnamnesis = async () => {
      try {
        const res = await api.get(`/ehr/patients/${patientId}/anamnesis`);
        if (res.data) {
          setFormData({
            mainComplaint: res.data.mainComplaint || '',
            allergies: res.data.allergies || '',
            medicationsInUse: res.data.medicationsInUse || '',
            chronicDiseases: res.data.chronicDiseases || '',
            previousSurgeries: res.data.previousSurgeries || '',
            observations: res.data.observations || ''
          });
          if (res.data.signatureUrl) {
            setSignatureInfo({ url: res.data.signatureUrl, date: res.data.signedAt });
          }
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
    if (!canEdit || signatureInfo) return;
    setSaving(true);
    try {
      await api.post(`/ehr/patients/${patientId}/anamnesis`, formData);
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

  const handleSign = async (dataUrl: string) => {
    try {
      const res = await api.post(`/ehr/patients/${patientId}/anamnesis/sign`, { signatureDataUrl: dataUrl });
      setSignatureInfo({ url: res.data.signatureUrl, date: res.data.signedAt });
      setSignatureModalOpen(false);
      showToast('Anamnese assinada e bloqueada com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao salvar assinatura.', 'error');
    }
  };

  const handleUnlock = async () => {
    if (!window.confirm("Atenção: Destrancar a Anamnese apagará a assinatura atual do paciente por motivos legais. Uma nova assinatura deverá ser coletada após as edições. Deseja prosseguir?")) {
      return;
    }
    try {
      await api.post(`/ehr/patients/${patientId}/anamnesis/unlock`);
      setSignatureInfo(null);
      showToast('Anamnese destrancada para edição.', 'success');
    } catch (err) {
      showToast('Erro ao destrancar anamnese.', 'error');
    }
  };

  const isFormDisabled = !canEdit || !!signatureInfo;

  if (loading) return <div className="empty-state">Carregando formulário...</div>;

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ marginBottom: '24px', fontSize: '18px', color: 'var(--text-primary)' }}>Questionário de Saúde</h3>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {signatureInfo && (
          <div style={{ padding: '12px', backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', color: '#92400E' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} />
              <div>
                <strong>Anamnese Bloqueada:</strong> Este documento foi assinado digitalmente pelo paciente e não pode mais ser alterado.
              </div>
            </div>
            {canEdit && (
              <button type="button" className="btn btn-ghost" onClick={handleUnlock} style={{ color: '#D97706', borderColor: '#FCD34D', fontSize: '13px', padding: '6px 12px', backgroundColor: '#FEF3C7' }} title="Destrancar e Invalidar Assinatura">
                <Unlock size={16} /> Destrancar
              </button>
            )}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Queixa Principal</label>
          <textarea className="form-input" disabled={isFormDisabled} rows={2} value={formData.mainComplaint} onChange={handleChange('mainComplaint')} placeholder="Motivo da visita..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Alergias</label>
            <textarea className="form-input" disabled={isFormDisabled} rows={2} value={formData.allergies} onChange={handleChange('allergies')} placeholder="Alergias a medicamentos, alimentos..." />
          </div>
          <div className="form-group">
            <label className="form-label">Medicamentos em Uso</label>
            <textarea className="form-input" disabled={isFormDisabled} rows={2} value={formData.medicationsInUse} onChange={handleChange('medicationsInUse')} placeholder="Quais remédios toma atualmente..." />
          </div>
          <div className="form-group">
            <label className="form-label">Doenças Crônicas</label>
            <textarea className="form-input" disabled={isFormDisabled} rows={2} value={formData.chronicDiseases} onChange={handleChange('chronicDiseases')} placeholder="Hipertensão, diabetes, asma..." />
          </div>
          <div className="form-group">
            <label className="form-label">Cirurgias Prévias / Internações</label>
            <textarea className="form-input" disabled={isFormDisabled} rows={2} value={formData.previousSurgeries} onChange={handleChange('previousSurgeries')} placeholder="Já fez alguma cirurgia?" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Observações Clínicas</label>
          <textarea className="form-input" disabled={isFormDisabled} rows={3} value={formData.observations} onChange={handleChange('observations')} placeholder="Outras informações relevantes..." />
        </div>
        
        {signatureInfo && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', padding: '20px', border: '1px dashed var(--border)', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 12px 0', fontWeight: 500 }}>Assinatura do Paciente</p>
            <img src={`http://${window.location.hostname}:3000${signatureInfo.url}`} alt="Assinatura" style={{ maxHeight: '100px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '4px' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Assinado em {new Date(signatureInfo.date).toLocaleString('pt-BR')}
            </span>
          </div>
        )}

        {canEdit && !signatureInfo && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setSignatureModalOpen(true)}>
              <FileSignature size={16} /> Coletar Assinatura
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Rascunho'}
            </button>
          </div>
        )}

        {!canEdit && !signatureInfo && (
          <div className="empty-state" style={{ marginTop: '10px', padding: '12px', fontSize: '13px' }}>
            Apenas dentistas ou administradores podem editar o questionário de anamnese.
          </div>
        )}
      </form>

      <SignatureModal 
        isOpen={isSignatureModalOpen} 
        onClose={() => setSignatureModalOpen(false)} 
        onSave={handleSign} 
        title="Assinatura da Anamnese" 
        patientId={patientId}
      />
    </div>
  );
};

export default AnamnesisTab;
