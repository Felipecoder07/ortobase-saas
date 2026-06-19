import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Tooth from './Tooth';
import type { FaceType, ConditionType, ToothCondition, LegendItem } from './Tooth';
import { Settings, Plus, X, Trash2 } from 'lucide-react';

interface OdontogramTabProps {
  patientId: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const upperAdult = ['18','17','16','15','14','13','12','11', '21','22','23','24','25','26','27','28'];
const lowerAdult = ['48','47','46','45','44','43','42','41', '31','32','33','34','35','36','37','38'];

const upperDeciduous = ['55','54','53','52','51', '61','62','63','64','65'];
const lowerDeciduous = ['85','84','83','82','81', '71','72','73','74','75'];

const defaultLegends: LegendItem[] = [
  { id: 'HEALTHY', name: 'Saudável', color: '#ffffff' },
  { id: 'CARIES', name: 'Cárie', color: '#ef4444' },
  { id: 'RESTORED', name: 'Restaurado', color: '#3b82f6' },
  { id: 'CROWN', name: 'Coroa', color: '#f59e0b' },
  { id: 'IMPLANT', name: 'Implante', color: '#8b5cf6' },
  { id: 'EXTRACTED', name: 'Extraído', color: '#000000' }
];

const OdontogramTab: React.FC<OdontogramTabProps> = ({ patientId, showToast }) => {
  const [conditions, setConditions] = useState<{ toothNumber: string; face: FaceType; condition: ConditionType }[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedTooth, setSelectedTooth] = useState<{ toothNumber: string; face: FaceType } | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<ConditionType>('HEALTHY');

  // Legends state
  const [legends, setLegends] = useState<LegendItem[]>(defaultLegends);
  const [showLegendModal, setShowLegendModal] = useState(false);
  const [newLegendName, setNewLegendName] = useState('');
  const [newLegendColor, setNewLegendColor] = useState('#10b981');

  const role = localStorage.getItem('role');
  const canEdit = role === 'DENTIST' || role === 'ADMIN';

  const fetchConditions = async () => {
    try {
      const res = await api.get(`/ehr/patients/${patientId}/odontogram`);
      setConditions(res.data);
    } catch (err) {
      showToast('Erro ao carregar odontograma.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLegends = async () => {
    try {
      const res = await api.get('/ehr/odontogram-legends');
      const customs: LegendItem[] = res.data.map((l: any) => ({ id: l.name, name: l.name, color: l.color }));
      setLegends([...defaultLegends, ...customs]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConditions();
    fetchLegends();
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
      const faceToSave = selectedCondition === 'EXTRACTED' ? 'ALL' : selectedTooth.face;
      
      await api.post(`/ehr/patients/${patientId}/odontogram`, {
        toothNumber: selectedTooth.toothNumber,
        face: faceToSave,
        condition: selectedCondition
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

  const saveLegend = async () => {
    if (!newLegendName || !newLegendColor) return;
    try {
      await api.post('/ehr/odontogram-legends', { name: newLegendName, color: newLegendColor });
      showToast('Item da legenda salvo.', 'success');
      setNewLegendName('');
      fetchLegends();
    } catch (err) {
      showToast('Erro ao salvar item da legenda.', 'error');
    }
  };

  const deleteLegend = async (name: string) => {
    try {
      await api.delete(`/ehr/odontogram-legends/${name}`);
      showToast('Item removido com sucesso.', 'success');
      fetchLegends();
      fetchConditions();
    } catch (err) {
      showToast('Erro ao remover item.', 'error');
    }
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
                <Tooth number={t} conditions={getToothConditions(t)} onFaceClick={handleFaceClick} legends={legends} />
                {idx === 7 && <div style={{ width: '16px' }} />} {/* Midline gap */}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {lowerAdult.map((t, idx) => (
              <React.Fragment key={t}>
                <Tooth number={t} conditions={getToothConditions(t)} onFaceClick={handleFaceClick} legends={legends} />
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
                <Tooth number={t} conditions={getToothConditions(t)} onFaceClick={handleFaceClick} legends={legends} />
                {idx === 4 && <div style={{ width: '16px' }} />} {/* Midline gap */}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {lowerDeciduous.map((t, idx) => (
              <React.Fragment key={t}>
                <Tooth number={t} conditions={getToothConditions(t)} onFaceClick={handleFaceClick} legends={legends} />
                {idx === 4 && <div style={{ width: '16px' }} />} {/* Midline gap */}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
            {legends.map(l => (
              <span key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <div style={{ width: '12px', height: '12px', background: l.color, border: '1px solid #94a3b8', borderRadius: '2px' }}></div> 
                {l.name}
              </span>
            ))}
          </div>
          {canEdit && (
            <button className="btn btn-outline" onClick={() => setShowLegendModal(true)} style={{ fontSize: '12px', padding: '6px 12px' }}>
              <Settings size={14} style={{ marginRight: '6px' }} /> Configurar Itens
            </button>
          )}
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
                onChange={(e) => setSelectedCondition(e.target.value)}
              >
                {legends.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setSelectedTooth(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveCondition}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Legend Config Modal */}
      {showLegendModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ padding: '24px', width: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Configurar Legenda</h3>
              <button className="btn btn-ghost" onClick={() => setShowLegendModal(false)} style={{ padding: '4px' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '24px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Novo Item</label>
                <input className="form-input" placeholder="Ex: Tratamento Canal" value={newLegendName} onChange={e => setNewLegendName(e.target.value)} />
              </div>
              <div className="form-group" style={{ width: '60px', marginBottom: 0 }}>
                <label className="form-label">Cor</label>
                <input type="color" className="form-input" style={{ padding: '0', height: '38px', cursor: 'pointer' }} value={newLegendColor} onChange={e => setNewLegendColor(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={saveLegend} disabled={!newLegendName}>
                <Plus size={16} /> Adicionar
              </button>
            </div>

            <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Itens Atuais da Clínica:</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '6px' }}>
              {legends.map(l => (
                <li key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: l.color, border: '1px solid #ccc' }}></div>
                  <span style={{ fontSize: '14px', flex: 1 }}>{l.name}</span>
                  {defaultLegends.some(dl => dl.id === l.id) ? (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '12px' }}>Padrão</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--primary)', backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '12px' }}>Personalizado</span>
                      <button className="btn btn-ghost" onClick={() => deleteLegend(l.name)} style={{ padding: '4px', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default OdontogramTab;
