import React from 'react';
import './Labels.css';

interface ZoneLabelProps {
    text: string;
    variant?: 'primary' | 'secondary' | 'near';
    type?: 'apostles' | 'terrorists' | 'quadrant' | 'near';
    className?: string;
    needsOffset?: 'up' | 'down' | 'none';
  }
  
  export const ZoneLabel: React.FC<ZoneLabelProps> = ({
    text,
    variant = 'primary',
    type,
    className = '',
    needsOffset = 'none'
  }) => {
    const offsetClass = needsOffset !== 'none' 
      ? `zone-label--offset-${needsOffset}` 
      : '';
  
    return (
      <div 
        className={`
          zone-label
          zone-label--${variant}
          ${type ? `zone-label--${type}` : ''}
          ${offsetClass}
          ${className}
        `}
      >
        {text}
      </div>
    );
  };