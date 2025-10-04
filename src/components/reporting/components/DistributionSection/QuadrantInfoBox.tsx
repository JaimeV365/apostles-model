// src/components/reporting/components/DistributionSection/QuadrantInfoBox.tsx
import React, { useEffect, useRef } from 'react';
import '../../../visualization/components/DataPoints/DataPointInfoBox.css';

interface QuadrantInfoBoxProps {
  quadrant: string;
  value: number;
  percentage: number;
  position: { x: number; y: number };
  onClose: () => void;
}

const QuadrantInfoBox: React.FC<QuadrantInfoBoxProps> = ({
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
          characteristics: 'Typically long-term customers who advocate for your brand.',
          strategy: 'Focus on retention and encouraging advocacy.'
        };
      case 'mercenaries':
        return { 
          title: 'Mercenaries', 
          color: '#F7B731', 
          description: 'High satisfaction but low loyalty. These customers are satisfied but may switch to competitors.',
          characteristics: 'Often price-sensitive and opportunistic.',
          strategy: 'Build stronger relationships and increase switching costs.'
        };
      case 'hostages':
        return { 
          title: 'Hostages', 
          color: '#3A6494', 
          description: 'Low satisfaction but high loyalty. These customers stay despite being unsatisfied.',
          characteristics: 'May feel trapped by contracts, lack of alternatives, or switching costs.',
          strategy: 'Improve their experience to convert them to Loyalists.'
        };
      case 'defectors':
        return { 
          title: 'Defectors', 
          color: '#DC2626', 
          description: 'Low satisfaction and low loyalty. These customers are at high risk of leaving.',
          characteristics: 'Require immediate attention to prevent churn.',
          strategy: 'Conduct recovery outreach and implement targeted improvement plans.'
        };
      default:
        return { 
          title: 'Unknown', 
          color: '#6B7280', 
          description: '',
          characteristics: '',
          strategy: ''
        };
    }
  };
  
  const quadrantInfo = getQuadrantInfo();
  
  // Position the info box and handle click outside
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    
    // Get the event target element
    const targetElement = document.querySelector(`.draggable-quadrant.${quadrant}:active`) || 
                           document.querySelector(`.draggable-quadrant.${quadrant}`) || 
                           document.querySelector('.draggable-quadrant');
    
    if (targetElement) {
      const targetRect = targetElement.getBoundingClientRect();
      
      // Position the box near the target
      box.style.position = 'fixed';
      box.style.left = `${targetRect.left + targetRect.width / 2}px`;
      box.style.top = `${targetRect.top + targetRect.height / 2}px`; 
      
      // Center the box on the target
      const boxRect = box.getBoundingClientRect();
      box.style.left = `${targetRect.left + (targetRect.width / 2) - (boxRect.width / 2)}px`;
      box.style.top = `${targetRect.top + (targetRect.height / 2) - (boxRect.height / 2)}px`;
      
      // Adjust if off-screen
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const updatedBoxRect = box.getBoundingClientRect(); // Get updated rect after centering
      
      if (updatedBoxRect.right > viewportWidth - 10) {
        box.style.left = `${viewportWidth - updatedBoxRect.width - 10}px`;
      }
      
      if (updatedBoxRect.left < 10) {
        box.style.left = '10px';
      }
      
      if (updatedBoxRect.bottom > viewportHeight - 10) {
        box.style.top = `${viewportHeight - updatedBoxRect.height - 10}px`;
      }
      
      if (updatedBoxRect.top < 10) {
        box.style.top = '10px';
      }
    }
    
    // Click outside handler
    const handleClickOutside = (e: MouseEvent) => {
      if (box && !box.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, quadrant]);
  
  return (
    <div
      ref={boxRef}
      className="data-point-info"
      style={{
        position: 'absolute',
        zIndex: 2000,
        maxWidth: '320px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        overflow: 'hidden'
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header with title and count */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ 
          color: quadrantInfo.color, 
          fontSize: '18px', 
          fontWeight: 600,
          marginBottom: '4px'
        }}>
          {quadrantInfo.title}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {value} responses ({percentage.toFixed(1)}%)
        </div>
      </div>
  
      {/* Content */}
      <div style={{ padding: '12px 16px' }}>
        {/* Description */}
        <div style={{ 
          marginBottom: '16px',
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#374151'
        }}>
          {quadrantInfo.description}
        </div>
        
        {/* Characteristics */}
        <div style={{ 
          marginBottom: '8px',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          <span style={{ 
            fontWeight: 600, 
            color: '#4b5563'
          }}>Characteristics:</span> {quadrantInfo.characteristics}
        </div>
      </div>
    </div>
  );
};

export default QuadrantInfoBox;