import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { Upload, Trash2, FileText, Image as ImageIcon, Download } from 'lucide-react';

interface Attachment {
  id: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string | null;
  createdAt: string;
}

interface AttachmentsTabProps {
  patientId: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const AttachmentsTab: React.FC<AttachmentsTabProps> = ({ patientId, showToast }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAttachments = async () => {
    try {
      const res = await api.get(`/ehr/patients/${patientId}/attachments`);
      setAttachments(res.data);
    } catch (err) {
      showToast('Erro ao carregar anexos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [patientId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      const formData = new FormData();
      formData.append('file', file);

      setUploading(true);
      try {
        await api.post(`/ehr/patients/${patientId}/attachments`, formData);
        showToast('Arquivo anexado com sucesso!', 'success');
        fetchAttachments();
      } catch (err) {
        showToast('Erro ao enviar arquivo.', 'error');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este anexo?')) return;
    
    try {
      await api.delete(`/ehr/attachments/${id}`);
      showToast('Anexo removido.', 'success');
      fetchAttachments();
    } catch (err) {
      showToast('Erro ao remover anexo.', 'error');
    }
  };

  const renderIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon size={32} color="var(--primary)" />;
    if (type.includes('pdf')) return <FileText size={32} color="#EF4444" />;
    return <FileText size={32} color="var(--text-secondary)" />;
  };

  if (loading) return <div className="empty-state">Carregando anexos...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Upload Area */}
      <div 
        className="card" 
        style={{ 
          padding: '40px 24px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '2px dashed var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          cursor: uploading ? 'wait' : 'pointer'
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <Upload size={40} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>
          {uploading ? 'Enviando arquivo...' : 'Clique para selecionar um arquivo'}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Imagens (JPEG, PNG) ou Documentos (PDF)</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*,application/pdf"
          onChange={handleFileChange}
        />
      </div>

      {/* Attachments Grid */}
      {attachments.length === 0 ? (
        <div className="empty-state">Nenhum anexo encontrado para este paciente.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {attachments.map(att => (
            <div key={att.id} className="card" style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '16px' }}>
              
              <div style={{ flexShrink: 0 }}>
                {att.fileType.includes('image') ? (
                  <img 
                    src={`http://${window.location.hostname}:3000${att.fileUrl}`} 
                    alt={att.filename} 
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                ) : (
                  renderIcon(att.fileType)
                )}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {att.filename}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Enviado por: {att.uploadedBy}
                </p>
                <p style={{ margin: '0', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(att.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href={`http://${window.location.hostname}:3000${att.fileUrl}`} target="_blank" rel="noreferrer" title="Baixar" style={{ color: 'var(--primary)', cursor: 'pointer' }}>
                  <Download size={18} />
                </a>
                <button onClick={() => handleDelete(att.id)} className="btn btn-ghost" style={{ padding: '4px', color: '#EF4444' }} title="Excluir">
                  <Trash2 size={18} />
                </button>
              </div>
              
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AttachmentsTab;
