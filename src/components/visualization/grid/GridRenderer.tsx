import React from 'react';
import { GridDimensions } from '../../../types/base';
import { calculateGridLines } from '../utils/gridCalculator';

interface GridRendererProps {
  dimensions: GridDimensions;
  showGrid: boolean;
}

const GridRenderer: React.FC<GridRendererProps> = ({
  dimensions,
  showGrid
}) => {
  if (!showGrid) return null;

  const gridLines = calculateGridLines(dimensions);

  return (
    <div className="grid-lines" style={{ 
      position: 'absolute', 
      inset: 0, 
      pointerEvents: 'none',
      zIndex: 1 
    }}>
      {gridLines.map((line, index) => (
        <div
          key={`grid-line-${index}`}
          className={`grid-line ${line.isHorizontal ? 'horizontal' : 'vertical'}`}
          style={{
            position: 'absolute',
            ...(line.isHorizontal
              ? {
                  bottom: line.position,
                  left: 0,
                  right: 0,
                  height: '1px'
                }
              : {
                  left: line.position,
                  top: 0,
                  bottom: 0,
                  width: '1px'
                }),
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            zIndex: 15
          }}
        />
      ))}
    </div>
  );
};

export default GridRenderer;