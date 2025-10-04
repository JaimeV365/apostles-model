// src/components/reporting/components/DistributionSection/ProximityPointInfoBox.tsx
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { DataPoint } from '@/types/base';
import '../../../visualization/components/DataPoints/DataPointInfoBox.css';

export interface QuadrantOption {
  group: string;
  color: string;
}

export const ProximityPointInfoBox: React.FC<{
  points: DataPoint[];
  position: { x: number; y: number };
  quadrant: string;
  proximityType?: string;
  onClose: () => void;
  context?: 'distribution' | 'proximity';
}> = ({ points, position, quadrant, proximityType, onClose, context = 'distribution' }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  
  // Reset showAll when points change
  useEffect(() => {
    setShowAll(false);
  }, [points]);
  
  // Colors based on quadrant
  const getQuadrantInfo = (): QuadrantOption => {
    switch (quadrant) {
      case 'loyalists':
        return { group: 'Loyalists', color: '#4CAF50' };
      case 'mercenaries':
        return { group: 'Mercenaries', color: '#F7B731' };
      case 'hostages':
        return { group: 'Hostages', color: '#3A6494' };
      case 'defectors':
        return { group: 'Defectors', color: '#DC2626' };
      default:
        return { group: 'Unknown', color: '#6B7280' };
    }
  };

  // Get the title based on context and proximity type
  const getFormattedTitle = (): string => {
    if (context === 'proximity' && proximityType) {
      // For proximity reports: "Loyalists near Mercenaries"
      const sourceQuadrant = quadrant.charAt(0).toUpperCase() + quadrant.slice(1);
      const targetQuadrant = proximityType.replace('near_', '').charAt(0).toUpperCase() + 
                           proximityType.replace('near_', '').slice(1);
      return `${sourceQuadrant} near ${targetQuadrant}`;
    }
    
    // For distribution reports: show dynamic titles based on proximity type
    if (context === 'distribution' && proximityType) {
      const sourceQuadrant = quadrant.charAt(0).toUpperCase() + quadrant.slice(1);
      
      // Handle special zone proximity types
      if (proximityType === 'apostles') {
        return `${sourceQuadrant} nearly Apostles`;
      }
      if (proximityType === 'near_apostles') {
        return `${sourceQuadrant} nearly Near-Apostles`;
      }
      if (proximityType === 'terrorists') {
        return `${sourceQuadrant} nearly Terrorists`;
      }
      
      // Handle regular quadrant proximity types
      if (proximityType === 'near_loyalists') {
        return `${sourceQuadrant} nearly Loyalists`;
      }
      if (proximityType === 'near_mercenaries') {
        return `${sourceQuadrant} nearly Mercenaries`;
      }
      if (proximityType === 'near_hostages') {
        return `${sourceQuadrant} nearly Hostages`;
      }
      if (proximityType === 'near_defectors') {
        return `${sourceQuadrant} nearly Defectors`;
      }
      
      // Fallback for other proximity types
      const targetQuadrant = proximityType.replace('near_', '').charAt(0).toUpperCase() + 
                           proximityType.replace('near_', '').slice(1);
      return `${sourceQuadrant} nearly ${targetQuadrant}`;
    }
    
    // For distribution reports without proximity type: show customer details
    if (context === 'distribution') {
      return `Customer Details`;
    }
    
    // Fallback
    return quadrant.charAt(0).toUpperCase() + quadrant.slice(1);
  };

  // Get customer display name with incremental numbering for anonymous customers
  const getCustomerDisplayName = (point: DataPoint, index: number): string => {
    // If customer has a name, use it
    if (point.name && point.name.trim()) return point.name.trim();
    // If customer has email but no name, use email
    if (point.email && point.email.trim()) return point.email.trim();
    // For anonymous customers, use incremental numbering starting from 1
    return `Customer ${index + 1}`;
  };

  const quadrantInfo = getQuadrantInfo();
  const title = getFormattedTitle();
  
  // Handle click outside for modal
useEffect(() => {
  const box = boxRef.current;
  if (!box) return;
  
  // Click outside handler
  const handleClickOutside = (e: MouseEvent) => {
    if (box && !box.contains(e.target as Node)) {
      onClose();
    }
  };
  
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [onClose]);
  
  // Add a guard clause to prevent rendering if points array is empty
  if (!points || points.length === 0) {
    return (
      <div
        ref={boxRef}
        className="data-point-info data-point-info--reports"
        style={{
          position: 'absolute',
          zIndex: 2000
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="data-point-info__header">
          <div className="data-point-info__title" style={{ color: getQuadrantInfo().color }}>
            {getFormattedTitle()}
          </div>
          <div className="data-point-info__id">
            0 points
          </div>
        </div>
        
        <div className="data-point-info__content">
          
          <div className="data-point-info__multiple">
            <div className="data-point-info__more">
              No customers in this proximity area
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const modalContent = (
    <div
      ref={boxRef}
      className="data-point-info data-point-info--reports"
      style={{
        position: 'absolute',
        zIndex: 99999,
        left: `${position.x + (window.pageXOffset || document.documentElement.scrollLeft) + 10}px`,
        top: `${position.y + (window.pageYOffset || document.documentElement.scrollTop) + 10}px`,
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        minWidth: '240px',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflowY: 'auto',
        color: '#333',
        fontSize: '14px'
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className="data-point-info__header">
        <div className="data-point-info__title" style={{ 
          color: quadrantInfo.color 
        }}>
          {title}
        </div>
        <div className="data-point-info__id">
          {points.length} {points.length === 1 ? 'point' : 'points'}
        </div>
      </div>
  
     <div className="data-point-info__content">
        
        <div className="data-point-info__multiple">
          <div className="data-point-info__list">
            {(showAll ? points : points.slice(0, 5)).map((point, index) => (
              <div key={index} className="data-point-info__list-item" style={{
                padding: '8px 0',
                borderBottom: index < (showAll ? points.length - 1 : Math.min(points.length, 5) - 1) ? '1px solid #e5e7eb' : 'none'
              }}>
                <div className="data-point-info__customer-name" style={{
                  fontWeight: '600',
                  fontSize: '14px',
                  marginBottom: '4px'
                }}>
                  {getCustomerDisplayName(point, index)}, ID: {point.id}
                </div>
                <div className="data-point-info__customer-coords" style={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  Satisfaction: {point.satisfaction}, Loyalty: {point.loyalty}
                </div>
              </div>
            ))}
          </div>
          
          {points.length > 5 && (
            <div className="data-point-info__more" style={{
              padding: '8px 0',
              borderTop: '1px solid #e5e7eb',
              marginTop: '8px'
            }}>
              {!showAll ? (
                <div>
                  <span style={{ color: '#6b7280', fontSize: '12px' }}>
                    Showing 5 of {points.length} customers
                  </span>
                  <button
                    onClick={() => setShowAll(true)}
                    style={{
                      marginLeft: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textDecoration: 'underline'
                    }}
                  >
                    Show All
                  </button>
                </div>
              ) : (
                <div>
                  <span style={{ color: '#6b7280', fontSize: '12px' }}>
                    Showing all {points.length} customers
                  </span>
                  <button
                    onClick={() => setShowAll(false)}
                    style={{
                      marginLeft: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textDecoration: 'underline'
                    }}
                  >
                    Show Less
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render modal using React Portal to document.body to avoid CSS clipping
  return ReactDOM.createPortal(modalContent, document.body);
};

export default ProximityPointInfoBox;