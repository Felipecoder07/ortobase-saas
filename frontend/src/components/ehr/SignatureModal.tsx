import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, Eraser, Check, Smartphone, Monitor, FileText, Loader } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../utils/api';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
  title?: string;
  patientId?: string;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onSave, title = "Assinatura do Paciente", patientId }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile' | 'cpf'>('desktop');
  
  // CPF State
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');

  // Mobile State
  const [mobileToken, setMobileToken] = useState('');

  // Real patient data for validation
  const [realCpf, setRealCpf] = useState('');
  const [realBirthDate, setRealBirthDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('desktop');
      setCpf('');
      setBirthDate('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && patientId && activeTab === 'cpf') {
      api.get(`/patients/${patientId}`).then(res => {
        setRealCpf(res.data.cpf || '');
        setRealBirthDate(res.data.dateOfBirth || '');
      }).catch(err => console.error(err));
    }
  }, [isOpen, patientId, activeTab]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isOpen && activeTab === 'mobile') {
      const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setMobileToken(newToken);

      interval = setInterval(async () => {
        try {
          const res = await api.get(`/ehr/mobile-sign/${newToken}`);
          if (res.status === 200 && res.data.signatureDataUrl) {
            clearInterval(interval);
            onSave(res.data.signatureDataUrl);
          }
        } catch (err) {
          // silent error for polling
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, activeTab, onSave]);

  if (!isOpen) return null;

  const handleClear = () => {
    sigCanvas.current?.clear();
    setError('');
  };

  const handleSaveDesktop = () => {
    if (sigCanvas.current?.isEmpty()) {
      setError('Por favor, assine antes de salvar.');
      return;
    }
    try {
      const dataUrl = sigCanvas.current?.getCanvas().toDataURL('image/png');
      if (dataUrl) {
        onSave(dataUrl);
      }
    } catch (err) {
      setError('Erro ao processar assinatura.');
      console.error(err);
    }
  };

  const handleSaveCpf = () => {
    if (!cpf || !birthDate) {
      setError('Preencha o CPF e a Data de Nascimento.');
      return;
    }

    if (patientId) {
      const cleanCpf = cpf.replace(/\D/g, '');
      const cleanRealCpf = realCpf.replace(/\D/g, '');
      const cleanBirthDate = birthDate;
      const cleanRealBirthDate = realBirthDate ? realBirthDate.substring(0, 10) : '';

      if (cleanRealCpf && cleanCpf !== cleanRealCpf) {
        setError('O CPF digitado não confere com o cadastro do paciente.');
        return;
      }
      if (cleanRealBirthDate && cleanBirthDate !== cleanRealBirthDate) {
        setError('A Data de Nascimento não confere com o cadastro do paciente.');
        return;
      }
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#0f172a';
      ctx.font = '16px sans-serif';
      ctx.fillText('Aceite Eletrônico de Documento', 20, 40);
      
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`CPF: ${cpf}`, 20, 80);
      
      ctx.font = '16px sans-serif';
      ctx.fillText(`Data de Nascimento: ${birthDate}`, 20, 110);
      
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 150);
      ctx.fillText(`IP Registrado pelo Servidor`, 20, 170);
      
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    setCpf(val);
  };

  const mobileLink = `${window.location.origin}/mobile-sign?token=${mobileToken}`;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ padding: '24px', width: '100%', maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>{title}</h3>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '4px' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => setActiveTab('desktop')} className={`btn ${activeTab === 'desktop' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, padding: '8px' }}><Monitor size={16} /> Tela</button>
          <button onClick={() => setActiveTab('mobile')} className={`btn ${activeTab === 'mobile' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, padding: '8px' }}><Smartphone size={16} /> Celular</button>
          <button onClick={() => setActiveTab('cpf')} className={`btn ${activeTab === 'cpf' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, padding: '8px' }}><FileText size={16} /> CPF</button>
        </div>
        
        {activeTab === 'desktop' && (
          <>
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--card-bg)', marginBottom: '16px' }}>
              <SignatureCanvas 
                ref={sigCanvas}
                penColor="black"
                canvasProps={{ width: 500, height: 200, className: 'sigCanvas', style: { width: '100%', height: '200px' } }}
              />
            </div>
            
            {error && <p style={{ color: 'var(--red)', fontSize: '13px', marginTop: '-8px', marginBottom: '16px' }}>{error}</p>}
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-outline" onClick={handleClear} style={{ color: 'var(--text-secondary)' }}>
                <Eraser size={16} /> Limpar
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleSaveDesktop}>
                  <Check size={16} /> Salvar Assinatura
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'mobile' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '10px 0 20px 0' }}>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 0 }}>Aponte a câmera do celular do paciente para o código abaixo:</p>
            <div style={{ padding: '16px', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <QRCodeSVG value={mobileLink} size={200} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <Loader size={18} className="spin" style={{ animation: 'spin 2s linear infinite' }} /> 
              <span>Aguardando assinatura no celular...</span>
            </div>
            <button className="btn btn-ghost" onClick={onClose} style={{ marginTop: '8px' }}>Cancelar</button>
          </div>
        )}

        {activeTab === 'cpf' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">CPF do Paciente</label>
              <input className="form-input" value={cpf} onChange={handleCpfChange} placeholder="000.000.000-00" maxLength={14} />
            </div>
            <div className="form-group">
              <label className="form-label">Data de Nascimento</label>
              <input className="form-input" type="date" value={birthDate} max="9999-12-31" onChange={e => setBirthDate(e.target.value)} />
            </div>
            <div style={{ backgroundColor: '#FEF3C7', padding: '12px', borderRadius: '6px', fontSize: '13px', color: '#92400E' }}>
              O paciente declara que leu e concorda com as informações deste documento. O aceite eletrônico tem a mesma validade legal de uma assinatura física.
            </div>
            {error && <p style={{ color: 'var(--red)', fontSize: '13px', marginTop: '-8px', marginBottom: '8px', textAlign: 'center' }}>{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveCpf}><Check size={16} /> Confirmar Aceite</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignatureModal;
