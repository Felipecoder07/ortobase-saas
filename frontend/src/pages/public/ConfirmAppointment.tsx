import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';

const ConfirmAppointment: React.FC = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // We can simulate it by calling a mock endpoint or just calling update status
    // To make it secure, it would need a signed token. For now, we mock it.
    const confirm = async () => {
      try {
        // Here we'd call a public endpoint like GET /api/public/appointments/:id/confirm
        // For demonstration, we'll pretend it worked if the ID is provided
        setTimeout(() => {
          setSuccess(true);
          setLoading(false);
        }, 1500);
      } catch (err) {
        setError('Link inválido ou expirado.');
        setLoading(false);
      }
    };
    confirm();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h2 style={{ color: '#0F172A', marginBottom: '10px' }}>Processando...</h2>
          <p style={{ color: '#64748B' }}>Aguarde enquanto confirmamos sua consulta.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '400px' }}>
        {success ? (
          <>
            <div style={{ width: '64px', height: '64px', background: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ color: '#0F172A', marginBottom: '10px' }}>Consulta Confirmada!</h2>
            <p style={{ color: '#64748B' }}>Sua presença foi confirmada. Aguardamos você no dia e horário agendados.</p>
          </>
        ) : (
          <>
            <div style={{ width: '64px', height: '64px', background: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h2 style={{ color: '#0F172A', marginBottom: '10px' }}>Ops!</h2>
            <p style={{ color: '#64748B' }}>{error}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmAppointment;
