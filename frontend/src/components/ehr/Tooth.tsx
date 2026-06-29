import React from 'react';

export type FaceType = 'V' | 'L' | 'M' | 'D' | 'O' | 'ALL';
export type ConditionType = string;

export interface ToothCondition {
  face: FaceType;
  condition: ConditionType;
}

export interface LegendItem {
  id: string;
  name: string;
  color: string;
}

interface ToothProps {
  number: string;
  conditions: ToothCondition[];
  onFaceClick: (toothNumber: string, face: FaceType) => void;
  legends: LegendItem[];
}

const Tooth: React.FC<ToothProps> = ({ number, conditions, onFaceClick, legends }) => {
  const getFaceColor = (face: FaceType) => {
    // Prioriza a condição específica da face. Se não achar, usa a condição "ALL" (ex: dente inteiro saudável)
    let c = conditions.find(c => c.face === face);
    if (!c) {
      c = conditions.find(c => c.face === 'ALL');
    }
    if (!c) return '#ffffff';
    const legend = legends.find(l => l.id === c.condition);
    return legend ? legend.color : '#94a3b8'; // Cinza se a legenda foi deletada
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
        <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))' }}>
          <defs>
            <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          
          {/* Top Face */}
          <path 
            d="M 15 15 Q 50 0 85 15 L 70 30 Q 50 25 30 30 Z" 
            fill={getFaceColor(topFace)} 
            stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round"
            style={{ transition: 'all 0.2s', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.9)'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
            onClick={() => onFaceClick(number, topFace)}
          />
          {/* Right Face */}
          <path 
            d="M 85 15 Q 100 50 85 85 L 70 70 Q 75 50 70 30 Z" 
            fill={getFaceColor(rightFace)} 
            stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round"
            style={{ transition: 'all 0.2s', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.9)'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
            onClick={() => onFaceClick(number, rightFace)}
          />
          {/* Bottom Face */}
          <path 
            d="M 85 85 Q 50 100 15 85 L 30 70 Q 50 75 70 70 Z" 
            fill={getFaceColor(bottomFace)} 
            stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round"
            style={{ transition: 'all 0.2s', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.9)'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
            onClick={() => onFaceClick(number, bottomFace)}
          />
          {/* Left Face */}
          <path 
            d="M 15 85 Q 0 50 15 15 L 30 30 Q 25 50 30 70 Z" 
            fill={getFaceColor(leftFace)} 
            stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round"
            style={{ transition: 'all 0.2s', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.9)'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
            onClick={() => onFaceClick(number, leftFace)}
          />
          {/* Center Face (Oclusal) */}
          <path 
            d="M 30 30 Q 50 25 70 30 Q 75 50 70 70 Q 50 75 30 70 Q 25 50 30 30 Z" 
            fill={getFaceColor(centerFace)} 
            stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round"
            style={{ transition: 'all 0.2s', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.9)'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
            onClick={() => onFaceClick(number, centerFace)}
          />

          {/* Sombras internas para efeito 3D (overlay em todas as faces) */}
          <path 
            d="M 15 15 Q 50 0 85 15 Q 100 50 85 85 Q 50 100 15 85 Q 0 50 15 15 Z" 
            fill="url(#centerGrad)" 
            style={{ pointerEvents: 'none' }}
          />
          
          {isExtracted && (
            <g onClick={() => onFaceClick(number, 'ALL')} style={{ cursor: 'pointer' }}>
              <line x1="10" y1="10" x2="90" y2="90" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
              <line x1="90" y1="10" x2="10" y2="90" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default Tooth;
