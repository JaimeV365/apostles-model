import React from 'react';

interface QuadrantLabelProps {
  quadrant: 'loyalists' | 'mercenaries' | 'hostages' | 'defectors';
  position: {
    left: string;
    bottom: string;
    width: string;
    height: string;
  };
  isClassicModel?: boolean;
  showLabels?: boolean;
}

const QuadrantLabel: React.FC<QuadrantLabelProps> = ({
  quadrant,
  position,
  isClassicModel = false,
  showLabels = true
}) => {
  if (!showLabels) return null;

  const getQuadrantInfo = () => {
    switch (quadrant) {
      case 'loyalists':
        return {
          label: 'Loyalists',
          color: '#1B4332'
        };
      case 'mercenaries':
        return {
          label: 'Mercenaries',
          color: '#854D0E'
        };
      case 'hostages':
        return {
          label: 'Hostages',
          color: '#1E3A8A'
        };
      case 'defectors':
        return {
          label: 'Defectors',  // Always "Defectors" regardless of mode
          color: '#7F1D1D'
        };
    }
  };

  const info = getQuadrantInfo();

  // Convert percentage strings to numbers for calculations
  const left = parseFloat(position.left);
  const bottom = parseFloat(position.bottom);
  const width = parseFloat(position.width);
  const height = parseFloat(position.height);

  // Position label in the center of each quadrant
  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${left + width/2}%`,
    bottom: `${bottom + height/2}%`,
    transform: 'translate(-50%, 50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '8px 16px',
    borderRadius: '6px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    color: info.color,
    fontWeight: 500,
    fontSize: '14px',
    zIndex: 2,
    pointerEvents: 'none'
  };

  return (
    <div style={labelStyle}>
      {info.label}
    </div>
  );
};

export default QuadrantLabel;