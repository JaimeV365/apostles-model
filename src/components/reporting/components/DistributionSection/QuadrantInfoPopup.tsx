import React, { useEffect, useRef } from 'react';

interface QuadrantInfoPopupProps {
  quadrant: string;
  value: number;
  percentage: number;
  position: { x: number; y: number };
  onClose: () => void;
}

const QuadrantInfoPopup: React.FC<QuadrantInfoPopupProps> = ({
  quadrant,
  value,
  percentage,
  position,
  onClose
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  
  // Get quadrant info
  const getQuadrantInfo = () => {
    switch(quadrant) {
      case 'loyalists':
        return { 
          title: 'Loyalists', 
          color: '#4CAF50', 
          description: 'High satisfaction and high loyalty. These customers are satisfied with your product/service and likely to remain loyal.',
          characteristics: 'Typically long-term customers who advocate for your brand.'
        };
      case 'mercenaries':
        return { 
          title: 'Mercenaries', 
          color: '#F7B731', 
          description: 'High satisfaction but low loyalty. These customers are satisfied but may switch to competitors.',
          characteristics: 'Often price-sensitive and opportunistic.'
        };
      case 'hostages':
        return { 
          title: 'Hostages', 
          color: '#3A6494', 
          description: 'Low satisfaction but high loyalty. These customers stay despite being unsatisfied.',
          characteristics: 'May feel trapped by contracts, lack of alternatives, or switching costs.'
        };
      case 'defectors':
        return { 
          title: 'Defectors', 
          color: '#DC2626', 
          description: 'Low satisfaction and low loyalty. These customers are at high risk of leaving.',
          characteristics: 'Require immediate attention to prevent churn.'
        };
      default:
        return { 
          title: 'Unknown', 
          color: '#6B7280', 
          description: '',
          characteristics: '' 
        };
    }
  };
  
  const quadrantInfo = getQuadrantInfo();
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  return (
    <div 
      ref={boxRef}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        width: '300px',
        zIndex: 2000,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}
    >
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{ 
          color: quadrantInfo.color,
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '4px'
        }}>
          {quadrantInfo.title}
        </div>
        <div style={{
          color: '#6b7280',
          fontSize: '14px'
        }}>
          {value} responses ({percentage.toFixed(1)}%)
        </div>
      </div>
      
      <div style={{
        padding: '12px 16px'
      }}>
        <div style={{ 
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#374151',
          marginBottom: '12px'
        }}>
          {quadrantInfo.description}
        </div>
        
        <div style={{ 
          fontSize: '14px',
          color: '#6B7280',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <strong>Characteristics:</strong> {quadrantInfo.characteristics}
        </div>
      </div>
    </div>
  );
};

export default QuadrantInfoPopup;