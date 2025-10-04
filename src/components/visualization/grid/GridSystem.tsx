import React from 'react';
import { GridDimensions } from '@/types/base';
import { calculateGridLines } from '../utils/gridCalculator';
import './GridSystem.css';

interface GridSystemProps {
  dimensions: GridDimensions;
  showGrid: boolean;
  showScaleNumbers: boolean;
  showLegends: boolean;
}

export const GridSystem: React.FC<GridSystemProps> = ({ 
  dimensions, 
  showGrid,
  showScaleNumbers,
  showLegends 
}) => {
  if (!showGrid && !showScaleNumbers && !showLegends) return null;

  const lines = calculateGridLines(dimensions);

  return (
    <div className="grid-content">
      <div className="grid-system">
        {/* Grid Lines */}
        {showGrid && lines.map((line, index) => (
          <div
            key={`line-${index}`}
            className={`grid-line ${line.isHorizontal ? 'horizontal' : 'vertical'}`}
            style={{ 
              [line.isHorizontal ? 'bottom' : 'left']: line.position
            }}
          />
        ))}
      </div>

      {/* Scale Numbers */}
      {showScaleNumbers && (
        <div className="grid-scale">
          <div className="scale-x">
            {Array.from({ length: dimensions.totalCols }, (_, i) => (
              <div
                key={`scale-x-${i}`}
                className="scale-marker"
                style={{ left: `${i * dimensions.cellWidth}%` }}
              >
                {dimensions.scaleRanges.satisfaction.min + i}
              </div>
            ))}
          </div>

          <div className="scale-y">
            {Array.from({ length: dimensions.totalRows }, (_, i) => (
              <div
                key={`scale-y-${i}`}
                className="scale-marker"
                style={{ bottom: `${i * dimensions.cellHeight}%` }}
              >
                {dimensions.scaleRanges.loyalty.min + i}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legends */}
      {showLegends && (
        <div className="axis-labels">
          <div className="x-label">
            <div className="label-content">
              <span className="label-text">Satisfaction</span>
              <span className="range">
                {dimensions.scaleRanges.satisfaction.min} - {dimensions.scaleRanges.satisfaction.max}
              </span>
            </div>
          </div>
          
          <div className="y-label">
            <div className="label-content">
              <span className="label-text">Loyalty</span>
              <span className="range">
                {dimensions.scaleRanges.loyalty.min} - {dimensions.scaleRanges.loyalty.max}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridSystem;