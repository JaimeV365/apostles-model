import React, { useEffect, useCallback, useState } from 'react';
import { ScaleFormat } from '../../../../types/base';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DataPointInfo {
  id: string;
  name: string;
  satisfaction: number;
  loyalty: number;
  frequency: number;
  normalizedSatisfaction: number;
  normalizedLoyalty: number;
  quadrant: string;
  duplicates?: Array<{ id: string; name: string; }>;
}

interface DataPointTooltipProps {
  point: DataPointInfo;
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  isClassicModel: boolean;
  onClose: () => void;
}

export const DataPointTooltip: React.FC<DataPointTooltipProps> = ({
  point,
  satisfactionScale,
  loyaltyScale,
  isClassicModel,
  onClose
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const tooltip = document.querySelector('.data-point-tooltip');
    if (tooltip && !tooltip.contains(event.target as Node)) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const getQuadrantLabel = (quadrant: string): string => {
    switch (quadrant) {
      case 'apostles':
        return isClassicModel ? 'Apostles' : 'Advocates';
      case 'mercenaries':
        return 'Mercenaries';
      case 'hostages':
        return 'Hostages';
      case 'defectors':
        return isClassicModel ? 'Terrorists' : 'Trolls';
      default:
        return quadrant;
    }
  };

  const formatEntry = (name: string, id: string) => {
    if (!name || name === '') return `Anonymous (${id})`;
    return `${name} (${id})`;
  };

  return (
    <div
      className="data-point-tooltip"
      style={{
        position: 'absolute',
        left: `${point.normalizedSatisfaction}%`,
        bottom: `${point.normalizedLoyalty}%`,
        transform: 'translate(-50%, calc(50% + 20px))',
        zIndex: 1000,
        background: 'white',
        borderRadius: '6px',
        padding: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
        minWidth: '200px',
        maxWidth: '300px',
        pointerEvents: 'all'
      }}
    >
      <div style={{
        fontWeight: 500,
        paddingBottom: '8px',
        marginBottom: '8px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {formatEntry(point.name, point.id)}
      </div>
      <div style={{
        fontSize: '14px',
        color: '#374151'
      }}>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#6B7280' }}>Category:</span>{' '}
          {getQuadrantLabel(point.quadrant)}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#6B7280' }}>Satisfaction:</span>{' '}
          {point.satisfaction} / {satisfactionScale.split('-')[1]}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#6B7280' }}>Loyalty:</span>{' '}
          {point.loyalty} / {loyaltyScale.split('-')[1]}
        </div>
        
        {point.frequency > 1 && (
          <div style={{ marginTop: '8px' }}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                width: '100%',
                padding: '4px',
                color: '#4B5563',
                backgroundColor: '#F3F4F6',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                justifyContent: 'space-between'
              }}
            >
              <span>{point.frequency} responses with these values</span>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {isExpanded && point.duplicates && (
              <div style={{
                marginTop: '8px',
                maxHeight: '150px',
                overflowY: 'auto',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '8px'
              }}>
                <div style={{
                  padding: '4px 0',
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: '13px',
                  color: '#6B7280'
                }}>
                  {formatEntry(point.name, point.id)}  {/* Current point */}
                </div>
                {point.duplicates.map((dup, index) => (
                  <div
                    key={dup.id}
                    style={{
                      padding: '4px 0',
                      borderBottom: index < point.duplicates!.length - 1 ? '1px solid #f0f0f0' : 'none',
                      fontSize: '13px',
                      color: '#374151'
                    }}
                  >
                    {formatEntry(dup.name, dup.id)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPointTooltip;