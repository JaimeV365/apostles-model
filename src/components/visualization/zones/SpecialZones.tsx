import React from 'react';
import { GridDimensions, ZoneSizes, Position } from '../../../types/base';
import { ZoneLabel } from './ZoneLabel';

interface SpecialZonesProps {
 dimensions: GridDimensions;
 zoneSizes: ZoneSizes;
 position: Position;
 maxSizes: {
   apostles: number;
   terrorists: number;
 };
 showNearApostles: boolean;
 onResizeStart: (zone: 'apostles' | 'terrorists') => void;
 onResize: (newSizes: ZoneSizes) => void;
 isClassicModel: boolean;
 showLabels: boolean;
 showHandles: boolean;
}

export const SpecialZones: React.FC<SpecialZonesProps> = ({
 dimensions,
 zoneSizes,
 position,
 maxSizes,
 showNearApostles,
 onResizeStart,
 onResize,
 isClassicModel,
 showLabels,
 showHandles 
}) => {
  console.log(`🔧 SpecialZones: Rendering zones only - apostles size=${zoneSizes.apostles}, terrorists size=${zoneSizes.terrorists}`);
  console.log(`🔧 SpecialZones: showHandles=${showHandles} (ignored - handles managed by ResizeHandle component)`);

  const renderNearApostlesZones = (): React.ReactNode[] => {
    if (!showNearApostles || !dimensions.hasNearApostles || zoneSizes.apostles >= maxSizes.apostles) {
      return [];
    }
  
    const baseStyles = {
      position: 'absolute' as const,
      backgroundColor: 'rgba(76, 175, 80, 0.15)',
      width: `${dimensions.cellWidth}%`,
      height: `${dimensions.cellHeight}%`,
      pointerEvents: 'none' as const,
    };
  
    type ZoneStyle = typeof baseStyles & {
      top: string;
      right: string;
      borderTop?: string;
      borderRight?: string;
      borderBottom?: string;
      borderLeft?: string;
      children?: React.ReactNode;
    };
  
    const positions: ZoneStyle[] = [];
    if (zoneSizes.apostles === 1) {
      positions.push(
        {
          ...baseStyles,
          top: '0',
          right: `${dimensions.cellWidth}%`,
          borderTop: '1px solid rgba(76, 175, 80, 0.3)',
          borderRight: '1px solid rgba(76, 175, 80, 0.3)',
        },
        {
          ...baseStyles,
          top: `${dimensions.cellHeight}%`,
          right: '0',
          borderRight: '1px solid rgba(76, 175, 80, 0.3)',
          borderBottom: '1px solid rgba(76, 175, 80, 0.3)',
        },
        {
          ...baseStyles,
          top: `${dimensions.cellHeight}%`,
          right: `${dimensions.cellWidth}%`,
          borderLeft: '1px solid rgba(76, 175, 80, 0.3)',
          borderBottom: '1px solid rgba(76, 175, 80, 0.3)',
          children: showLabels ? (
            <ZoneLabel 
              text={isClassicModel ? 'Near-apostles' : 'Near-advocates'} 
              type="near"
              variant="near"
            />
          ) : null
        }
      );
    } else {
      // Vertical strip
      for (let y = 0; y < zoneSizes.apostles; y++) {
        positions.push({
          ...baseStyles,
          top: `${y * dimensions.cellHeight}%`,
          right: `${zoneSizes.apostles * dimensions.cellWidth}%`,
          ...(y === 0 && { borderTop: '1px solid rgba(76, 175, 80, 0.3)' }),
          borderLeft: '1px solid rgba(76, 175, 80, 0.3)',
        });
      }
  
      // Horizontal strip
      for (let x = 0; x <= zoneSizes.apostles; x++) {
        positions.push({
          ...baseStyles,
          top: `${zoneSizes.apostles * dimensions.cellHeight}%`,
          right: `${(zoneSizes.apostles - x) * dimensions.cellWidth}%`,
          borderBottom: '1px solid rgba(76, 175, 80, 0.3)',
          ...(x === 0 && {
            borderLeft: '1px solid rgba(76, 175, 80, 0.3)',
            children: showLabels ? (
              <ZoneLabel 
                text={isClassicModel ? 'Near-apostles' : 'Near-advocates'} 
                type="near"
                variant="near"
              />
            ) : null
          })
        });
      }
    }
  
    return positions.map((style, index) => (
      <div key={`near-apostles-${index}`} style={style}>
        {style.children}
      </div>
    ));
  };

 return (
   <>
     {/* Near-apostles layer */}
     <div className="near-apostles-layer" style={{ zIndex: 4 }}>
       {renderNearApostlesZones()}
     </div>

     {/* Special zones layer - ZONES ONLY, no handles */}
     <div className="special-zones-layer" style={{ position: 'absolute', inset: 0 }}>
       {/* Apostles zone */}
       <div
         style={{
           position: 'absolute',
           top: 0,
           right: 0,
           width: `${zoneSizes.apostles * dimensions.cellWidth}%`,
           height: `${zoneSizes.apostles * dimensions.cellHeight}%`,
           backgroundColor: 'rgba(76, 175, 80, 0.4)',
           border: '2px solid rgba(76, 175, 80, 0.5)'
         }}
       >
         {showLabels && (
           <ZoneLabel 
             text={isClassicModel ? 'Apostles' : 'Advocates'} 
             type="apostles"
             className={zoneSizes.apostles === 1 ? 'zone-label--overlapped-top' : ''}
           />
         )}
       </div>

       {/* Terrorists zone */}
       <div
         style={{
           position: 'absolute',
           bottom: 0,
           left: 0,
           width: `${zoneSizes.terrorists * dimensions.cellWidth}%`,
           height: `${zoneSizes.terrorists * dimensions.cellHeight}%`,
           backgroundColor: 'rgba(244, 67, 54, 0.4)',
           border: '2px solid rgba(244, 67, 54, 0.5)'
         }}
       >
         {showLabels && (
           <ZoneLabel 
             text={isClassicModel ? 'Terrorists' : 'Trolls'} 
             type="terrorists"
             className="zone-label--overlapped-bottom"
           />
         )}
       </div>
     </div>
   </>
 );
};

export default SpecialZones;