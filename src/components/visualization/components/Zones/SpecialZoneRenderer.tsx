import React from 'react';
import { GridDimensions } from '@/types/base';
import { ZoneLabel } from '../../zones/ZoneLabel';
import './SpecialZone.css';

export const SpecialZoneRenderer: React.FC<{
  dimensions: GridDimensions;
  apostlesZoneSize: number;
  terroristsZoneSize: number;
  showLabels: boolean;
  isClassicModel: boolean;
  showNearApostles: boolean;
  maxSizes: {
    apostles: number;
    terrorists: number;
  };
}> = ({
  dimensions,
  apostlesZoneSize,
  terroristsZoneSize,
  showLabels,
  isClassicModel,
  showNearApostles,
  maxSizes
}) => {
  const hasSpaceForNearApostles = () => {
    // Check both X and Y dimensions for available space
    const spaceXToMidpoint = dimensions.totalCols - dimensions.midpointCol - apostlesZoneSize - 1;
    const spaceYToMidpoint = dimensions.totalRows - dimensions.midpointRow - apostlesZoneSize - 1;
    
    // Need at least one space in both dimensions
    return Math.min(spaceXToMidpoint, spaceYToMidpoint) >= 1;
  };

  // Near apostles positions calculation
  const renderNearApostlesZones = () => {
    if (!showNearApostles || !dimensions.hasNearApostles || !hasSpaceForNearApostles()) {
      return [];
    }

    const { cellWidth, cellHeight } = dimensions;
    const positions = [];

    if (apostlesZoneSize === 1) {
      positions.push(
        // Left position (C1)
        {
          top: 0,
          right: `${cellWidth}%`,
          width: `${cellWidth}%`,
          height: `${cellHeight}%`
        },
        // Bottom position (D2)
        {
          top: `${cellHeight}%`,
          right: 0,
          width: `${cellWidth}%`,
          height: `${cellHeight}%`
        },
        // Corner position (C2) with label
        {
          top: `${cellHeight}%`,
          right: `${cellWidth}%`,
          width: `${cellWidth}%`,
          height: `${cellHeight}%`,
          hasLabel: true
        }
      );
    } else {
      // Multi-cell positions logic
      // const leftColY = apostlesZoneSize * cellHeight;
      // const bottomRowX = apostlesZoneSize * cellWidth;

      // Left column
      for (let i = 0; i < apostlesZoneSize; i++) {
        positions.push({
          top: `${i * cellHeight}%`,
          right: `${apostlesZoneSize * cellWidth}%`,
          width: `${cellWidth}%`,
          height: `${cellHeight}%`
        });
      }

      // Bottom row
      for (let i = 0; i < apostlesZoneSize; i++) {
        positions.push({
          top: `${apostlesZoneSize * cellHeight}%`,
          right: `${i * cellWidth}%`,
          width: `${cellWidth}%`,
          height: `${cellHeight}%`
        });
      }

      // Corner cell with label
      positions.push({
        top: `${apostlesZoneSize * cellHeight}%`,
        right: `${apostlesZoneSize * cellWidth}%`,
        width: `${cellWidth}%`,
        height: `${cellHeight}%`,
        hasLabel: true
      });
    }

    return positions.map((pos, index) => (
      <div
        key={`near-apostles-${index}`}
        className="near-apostles-zone"
        style={{
          position: 'absolute',
          ...pos
        }}
      >
        {pos.hasLabel && showLabels && (
          <ZoneLabel 
            text={isClassicModel ? 'Near-apostles' : 'Near-advocates'} 
            type="near"
            variant="near"
          />
        )}
      </div>
    ));
  };

  return (
    <>
      {/* Near-apostles layer */}
      <div className="near-apostles-layer">
        {renderNearApostlesZones()}
      </div>

      {/* Main special zones layer */}
      <div className="special-zones-layer">
        {/* Apostles Zone */}
        <div 
          className="special-zone apostles"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: `${apostlesZoneSize * dimensions.cellWidth}%`,
            height: `${apostlesZoneSize * dimensions.cellHeight}%`
          }}
        >
          {showLabels && (
            <ZoneLabel 
              text={isClassicModel ? 'Apostles' : 'Advocates'}
              type="apostles"
              className={apostlesZoneSize === 1 ? 'zone-label--overlapped-top' : ''}
            />
          )}
        </div>

        {/* Terrorists Zone */}
        <div
          className="special-zone terrorists"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: `${terroristsZoneSize * dimensions.cellWidth}%`,
            height: `${terroristsZoneSize * dimensions.cellHeight}%`
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

export default SpecialZoneRenderer;