import React, { useState } from 'react';
import { X, Filter, Crown, Settings } from 'lucide-react';
import './InlineControls.css';

interface InlineControlsProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'filters' | 'watermark' | 'settings';
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
}

export const InlineControls: React.FC<InlineControlsProps> = ({
  isOpen,
  onClose,
  type,
  children,
  title,
  icon
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'filters':
        return <Filter size={16} />;
      case 'watermark':
        return <Crown size={16} />;
      case 'settings':
        return <Settings size={16} />;
      default:
        return <Settings size={16} />;
    }
  };

  return (
    <div className="inline-controls show">
      <div className="inline-controls-header">
        <div className="inline-controls-title">
          {getIcon()}
          {title}
        </div>
        <button 
          className="inline-controls-close" 
          onClick={onClose}
          aria-label={`Close ${title}`}
        >
          <X size={16} />
        </button>
      </div>
      <div className="inline-controls-content">
        {children}
      </div>
    </div>
  );
};

export default InlineControls;
