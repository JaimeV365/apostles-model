import React from 'react';
import { ScaleFormat } from '../../../types/base';
import { calculateScaleMarkers } from '../utils/positionNormalizer';

interface ScaleMarkersProps {
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  showScaleNumbers: boolean;
}

const ScaleMarkers: React.FC<ScaleMarkersProps> = ({
  satisfactionScale,
  loyaltyScale,
  showScaleNumbers
}) => {
  if (!showScaleNumbers) return null;

  const horizontalMarkers = calculateScaleMarkers(satisfactionScale, true);
  const verticalMarkers = calculateScaleMarkers(loyaltyScale, false);

  return (
    <div className="grid-scale" style={{
      position: 'absolute',
      inset: '-24px',
      pointerEvents: 'none',
      zIndex: 20
    }}>
      <div className="scale-x" style={{
  position: 'absolute',
  bottom: 0,
  left: '24px',
  right: '24px'
}}>
        {horizontalMarkers.map(marker => (
          <div
            key={`scale-x-${marker.value}`}
            className="scale-marker"
            style={{
              position: 'absolute',
              left: marker.position,
              bottom: '-20px',
              transform: 'translateX(-50%)',
              fontSize: '12px',
              color: '#666',
              textAlign: 'center',
              minWidth: '20px'
            }}
          >
            {marker.value}
          </div>
        ))}
      </div>
      <div className="scale-y" style={{
        position: 'absolute',
        top: '24px',
        bottom: '24px',
        left: 0
      }}>
        {verticalMarkers.map(marker => (
          <div
            key={`scale-y-${marker.value}`}
            className="scale-marker"
            style={{
              position: 'absolute',
              left: '-20px',
              bottom: marker.position,
              transform: 'translateY(50%)',
              fontSize: '12px',
              color: '#666',
              textAlign: 'right',
              minWidth: '20px'
            }}
          >
            {marker.value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScaleMarkers;