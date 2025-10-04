import React from 'react';
import { GridDimensions } from '../../../../types/base';
import { calculateLayout } from '../../utils/gridCalculator';
import QuadrantLabel from './QuadrantLabel';
import './QuadrantRenderer.css';

interface QuadrantRendererProps {
  dimensions: GridDimensions;
  showLabels: boolean;
  isClassicModel?: boolean;
  showQuadrantLabels: boolean;
}

const COLORS = {
  apostles: {
    background: '#C5E0B4'
  },
  mercenaries: {
    background: '#FFF2CC'
  },
  hostages: {
    background: '#B4C7E7'
  },
  defectors: {
    background: '#E69999'
  }
};

export const QuadrantRenderer: React.FC<QuadrantRendererProps> = ({
  dimensions,
  showLabels,
  isClassicModel = false,
  showQuadrantLabels
}) => {
  const layout = calculateLayout(dimensions);
  
  return (
    <div className="quadrants-container">
      {/* Loyalists Quadrant */}
      <div 
        className="quadrant loyalists"
        style={{
          ...layout.quadrants.loyalists,
          backgroundColor: COLORS.apostles.background
        }}
      />
      <QuadrantLabel
        quadrant="loyalists"
        position={layout.quadrants.loyalists}
        isClassicModel={isClassicModel}
        showLabels={showQuadrantLabels}
      />

      {/* Mercenaries Quadrant */}
      <div 
        className="quadrant mercenaries"
        style={{
          ...layout.quadrants.mercenaries,
          backgroundColor: COLORS.mercenaries.background
        }}
      />
      <QuadrantLabel
        quadrant="mercenaries"
        position={layout.quadrants.mercenaries}
        isClassicModel={isClassicModel}
        showLabels={showQuadrantLabels}
      />

      {/* Hostages Quadrant */}
      <div 
        className="quadrant hostages"
        style={{
          ...layout.quadrants.hostages,
          backgroundColor: COLORS.hostages.background
        }}
      />
      <QuadrantLabel
        quadrant="hostages"
        position={layout.quadrants.hostages}
        isClassicModel={isClassicModel}
        showLabels={showQuadrantLabels}
      />

      {/* Defectors Quadrant */}
      <div 
        className="quadrant defectors"
        style={{
          ...layout.quadrants.defectors,
          backgroundColor: COLORS.defectors.background
        }}
      />
      <QuadrantLabel
        quadrant="defectors"
        position={layout.quadrants.defectors}
        isClassicModel={isClassicModel}
        showLabels={showQuadrantLabels}
      />
    </div>
  );
};

export default QuadrantRenderer;