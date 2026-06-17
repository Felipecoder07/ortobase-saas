import React from 'react';

export type FaceType = 'V' | 'L' | 'M' | 'D' | 'O' | 'ALL';
export type ConditionType = 'HEALTHY' | 'CARIES' | 'RESTORED' | 'EXTRACTED' | 'CROWN' | 'IMPLANT';

export interface ToothCondition {
  face: FaceType;
  condition: ConditionType;
}

interface ToothProps {
  number: string;
  conditions: ToothCondition[];
  onFaceClick: (toothNumber: string, face: FaceType) => void;
}

const Tooth: React.FC<ToothProps> = ({ number, conditions, onFaceClick }) => {
  const getFaceColor = (face: FaceType) => {
    const c = conditions.find(c => c.face === face || c.face === 'ALL');
    if (!c) return '#ffffff';
    switch (c.condition) {
      case 'CARIES': return '#ef4444'; // Red
      case 'RESTORED': return '#3b82f6'; // Blue
      case 'CROWN': return '#f59e0b'; // Yellow/Gold
      case 'IMPLANT': return '#8b5cf6'; // Purple
      default: return '#ffffff';
    }
  };

  const isExtracted = conditions.some(c => c.condition === 'EXTRACTED' && c.face === 'ALL');

  const isUpper = ['1', '2', '5', '6'].includes(number[0]);
  const isPatientRight = ['1', '4', '5', '8'].includes(number[0]);

  const topFace: FaceType = isUpper ? 'V' : 'L';
  const bottomFace: FaceType = isUpper ? 'L' : 'V';
  const leftFace: FaceType = isPatientRight ? 'D' : 'M';
  const rightFace: FaceType = isPatientRight ? 'M' : 'D';
  const centerFace: FaceType = 'O';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px' }}>
      <span 
        style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--text-secondary)', cursor: 'pointer' }}
        onClick={() => onFaceClick(number, 'ALL')}
        title="Clique para selecionar o dente inteiro (Ex: Extração)"
      >
        {number}
      </span>
      <div 
        style={{ position: 'relative', width: '40px', height: '40px', cursor: 'pointer' }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          {/* Top Face */}
          <polygon 
            points="0,0 100,0 75,25 25,25" 
            fill={getFaceColor(topFace)} 
            stroke="#94a3b8" strokeWidth="2"
            onClick={() => onFaceClick(number, topFace)}
          />
          {/* Right Face */}
          <polygon 
            points="100,0 100,100 75,75 75,25" 
            fill={getFaceColor(rightFace)} 
            stroke="#94a3b8" strokeWidth="2"
            onClick={() => onFaceClick(number, rightFace)}
          />
          {/* Bottom Face */}
          <polygon 
            points="0,100 100,100 75,75 25,75" 
            fill={getFaceColor(bottomFace)} 
            stroke="#94a3b8" strokeWidth="2"
            onClick={() => onFaceClick(number, bottomFace)}
          />
          {/* Left Face */}
          <polygon 
            points="0,0 0,100 25,75 25,25" 
            fill={getFaceColor(leftFace)} 
            stroke="#94a3b8" strokeWidth="2"
            onClick={() => onFaceClick(number, leftFace)}
          />
          {/* Center Face (Oclusal) */}
          <polygon 
            points="25,25 75,25 75,75 25,75" 
            fill={getFaceColor(centerFace)} 
            stroke="#94a3b8" strokeWidth="2"
            onClick={() => onFaceClick(number, centerFace)}
          />
          
          {isExtracted && (
            <g onClick={() => onFaceClick(number, 'ALL')}>
              <line x1="0" y1="0" x2="100" y2="100" stroke="#000000" strokeWidth="8" />
              <line x1="100" y1="0" x2="0" y2="100" stroke="#000000" strokeWidth="8" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default Tooth;
