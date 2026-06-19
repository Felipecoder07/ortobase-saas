import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, Check, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const MobileSign: React.FC = () => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Pegar o token da URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Token inválido ou não encontrado.');
    }
  }, []);

  const handleClear = () => {
    sigCanvas.current?.clear();
    setError('');
  };

  const handleSave = async () => {
    if (sigCanvas.current?.isEmpty()) {
      setError('Por favor, assine antes de enviar.');
      return;
    }
    try {
      const dataUrl = sigCanvas.current?.getCanvas().toDataURL('image/png');
      if (dataUrl && token) {
        // Enviar para o backend usando a rota pública
        await api.post('/ehr/mobile-sign', { token, signatureDataUrl: dataUrl });
        setSuccess(true);
      }
    } catch (err) {
      setError('Erro ao enviar assinatura. Tente novamente.');
      console.error(err);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#F0FDF4', padding: '20px', textAlign: 'center' }}>
        <CheckCircle size={64} color="#16A34A" style={{ marginBottom: '16px' }} />
        <h2 style={{ color: '#16A34A', marginBottom: '8px' }}>Assinatura Enviada!</h2>
        <p style={{ color: '#15803D' }}>O documento no computador já foi atualizado com a sua assinatura.</p>
        <p style={{ color: '#15803D', marginTop: '16px', fontWeight: 'bold' }}>Você já pode fechar esta tela.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ padding: '16px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Assinatura Digital</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Assine no quadro abaixo usando o dedo</p>
      </div>
      
      <div style={{ flex: 1, position: 'relative', margin: '16px', backgroundColor: '#ffffff', border: '2px dashed #cbd5e1', borderRadius: '12px', overflow: 'hidden' }}>
        <SignatureCanvas 
          ref={sigCanvas}
          penColor="black"
          canvasProps={{ className: 'sigCanvas', style: { width: '100%', height: '100%', touchAction: 'none' } }}
        />
      </div>

      {error && <p style={{ color: '#ef4444', textAlign: 'center', padding: '0 16px' }}>{error}</p>}

      <div style={{ padding: '16px', display: 'flex', gap: '12px', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <button 
          onClick={handleClear}
          style={{ flex: 1, padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '16px', fontWeight: 'bold' }}>
          <Eraser size={20} /> Limpar
        </button>
        <button 
          onClick={handleSave}
          disabled={!token}
          style={{ flex: 2, padding: '16px', borderRadius: '8px', border: 'none', backgroundColor: '#0ea5e9', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '16px', fontWeight: 'bold' }}>
          <Check size={20} /> Confirmar Assinatura
        </button>
      </div>
    </div>
  );
};

export default MobileSign;
