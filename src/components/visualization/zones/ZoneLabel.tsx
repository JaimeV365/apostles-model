import React from 'react';
import './Labels.css';

interface ZoneLabelProps {
    text: string;
    variant?: 'primary' | 'secondary' | 'near';
    type?: 'apostles' | 'terrorists' | 'quadrant' | 'near';
    className?: string;
    needsOffset?: 'up' | 'down' | 'none';
    positioning?: 'above-dots' | 'below-dots';
  }
  
  export const ZoneLabel: React.FC<ZoneLabelProps> = ({
    text,
    variant = 'primary',
    type,
    className = '',
    needsOffset = 'none',
    positioning = 'above-dots'
  }) => {
    console.log(`🔍 ZoneLabel "${text}" received positioning:`, positioning);
    const offsetClass = needsOffset !== 'none' 
      ? `zone-label--offset-${needsOffset}` 
      : '';
    
    const positioningClass = `zone-label--${positioning}`;
    console.log(`🔍 ZoneLabel "${text}" positioningClass:`, positioningClass);


    return (
      <div 
        className={`
          zone-label
          zone-label--${variant}
          ${type ? `zone-label--${type}` : ''}
          ${offsetClass}
          ${positioningClass}
          ${className}
        `}
      >
        {text}
      </div>
    );
  };