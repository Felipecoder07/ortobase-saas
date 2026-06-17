import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Tooth from './Tooth';
import type { FaceType, ConditionType, ToothCondition } from './Tooth';

interface OdontogramTabProps {
  patientId: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const upperAdult = ['18','17','16','15','14','13','12','11', '21','22','23','24','25','26','27','28'];
const lowerAdult = ['48','47','46','45','44','43','42','41', '31','32','33','34','35','36','37','38'];

const upperDeciduous = ['55','54','53','52','51', '61','62','63','64','65'];
const lowerDeciduous = ['85','84','83','82','81', '71','72','73','74','75'];

const OdontogramTab: React.FC<OdontogramTabProps> = ({ patientId, showToast }) => {
  const [conditions, setConditions] = useState<{ toothNumber: string; face: FaceType; condition: ConditionType }[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedTooth, setSelectedTooth] = useState<{ toothNumber: string; face: FaceType } | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<ConditionType>('HEALTHY');

  const role = localStorage.getItem('role');
  const canEdit = role === 'DENTIST' || role === 'ADMIN';

  const fetchConditions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/ehr/patients/${patientId}/odontogram`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConditions(res.data);
    } catch (err) {
      showToast('Erro ao carregar odontograma.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, [patientId]);

  const handleFaceClick = (toothNumber: string, face: FaceType) => {
    if (!canEdit) {
      showToast('Apenas dentistas e administradores podem editar o odontograma.', 'error');
      return;
    }
    
    // Check if whole tooth is extracted, if so, only clicking ALL will allow changing it (unless we allow removing the extracted status)
    const isExtracted = conditions.some(c => c.toothNumber === toothNumber && c.condition === 'EXTRACTED');
    if (isExtracted && face !== 'ALL') {
      showToast('Dente extraído. Remova a extração (clicando no dente inteiro) antes de editar faces.', 'error');
      return;
    }

    const currentCondition = conditions.find(c => c.toothNumber === toothNumber && c.face === face)?.condition || 'HEALTHY';
    setSelectedCondition(currentCondition);
    setSelectedTooth({ toothNumber, face });
  };

  const saveCondition = async () => {
    if (!selectedTooth) return;
    try {
      const token = localStorage.getItem('token');
      const faceToSave = selectedCondition === 'EXTRACTED' ? 'ALL' : selectedTooth.face;
      
      await axios.post(`http://localhost:3000/api/ehr/patients/${patientId}/odontogram`, {
        toothNumber: selectedTooth.toothNumber,
        face: faceToSave,
        condition: selectedCondition
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Condição atualizada.', 'success');
      setSelectedTooth(null);
      fetchConditions();
    } catch (err) {
      showToast('Erro ao atualizar dente.', 'error');
    }
  };

  const getToothConditions = (toothNumber: string) => {
    return conditions.filter(c => c.toothNumber === toothNumber) as ToothCondition[];
  };

  if (loading) return <div className="empty-state">Carregando Odontograma...</div>;

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '8px' }}>
        
        {/* Adult Arch */}
        <div>
          <h4 style={{ textAlign: 'center', marginBottom: '16px' }}>Arcada Permanente</h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {upperAdult.map((t, idx) => (
              <React.Fragment key={t}>
                <Tooth number={t} conditions={getToothConditions(t)} onFaceClick={handleFaceClick} />
                {idx === 7 && <div style={{ width: '16px' }} />} {/* Midline gap */}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {lowerAdult.map((t, idx) => (
              <React.Fragment key={t}>
                <Tooth number={t} conditions={getToothConditions(t)} onFaceClick={handleFaceClick} />
                {idx === 7 && <div style={{ width: '16px' }} />} {/* Midline gap */}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Deciduous Arch */}
        <div>
          <h4 style={{ textAlign: 'center', marginBottom: '16px' }}>Arcada Decídua</h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {upperDeciduous.map((t, idx) => (
              <React.Fragment key={t}>
                <Tooth number={t} conditions={getToothConditions(t)} onFaceClick={handleFaceClick} />
                {idx === 4 && <div style={{ width: '16px' }} />} {/* Midline gap */}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {lowerDeciduous.map((t, idx) => (
              <React.Fragment key={t}>
                <Tooth number={t} conditions={getToothConditions(t)} onFaceClick={handleFaceClick} />
                {idx === 4 && <div style={{ width: '16px' }} />} {/* Midline gap */}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><div style={{ width: '12px', height: '12px', background: '#ffffff', border: '1px solid #94a3b8' }}></div> Saudável</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><div style={{ width: '12px', height: '12px', background: '#ef4444' }}></div> Cárie</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><div style={{ width: '12px', height: '12px', background: '#3b82f6' }}></div> Restaurado</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><div style={{ width: '12px', height: '12px', background: '#f59e0b' }}></div> Coroa</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><div style={{ width: '12px', height: '12px', background: '#8b5cf6' }}></div> Implante</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><strong>X</strong> Extraído</span>
        </div>

      </div>

      {/* Edit Modal */}
      {selectedTooth && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ padding: '24px', width: '300px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>
              Dente {selectedTooth.toothNumber} - Face {selectedTooth.face === 'ALL' ? 'Inteiro' : selectedTooth.face}
            </h3>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Condição</label>
              <select 
                className="form-input" 
                value={selectedCondition} 
                onChange={(e) => setSelectedCondition(e.target.value as ConditionType)}
              >
                <option value="HEALTHY">Saudável</option>
                <option value="CARIES">Cárie</option>
                <option value="RESTORED">Restaurado</option>
                <option value="CROWN">Coroa</option>
                <option value="IMPLANT">Implante</option>
                <option value="EXTRACTED">Extraído</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setSelectedTooth(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveCondition}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OdontogramTab;
