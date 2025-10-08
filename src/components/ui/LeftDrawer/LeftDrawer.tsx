import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Save, Settings, HelpCircle } from 'lucide-react';
import './LeftDrawer.css';

interface LeftDrawerProps {
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export const LeftDrawer: React.FC<LeftDrawerProps> = ({ 
  children, 
  isOpen, 
  onToggle 
}) => {
  return (
    <>
      {/* Drawer Toggle Button - Always visible */}
      <button
        className={`drawer-toggle ${isOpen ? 'open' : ''}`}
        onClick={onToggle}
        title={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="drawer-overlay"
          onClick={onToggle}
        />
      )}

      {/* Drawer Content */}
      <div className={`left-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3 className="drawer-title">Tools</h3>
        </div>
        
        <div className="drawer-content">
          {children}
        </div>
      </div>
    </>
  );
};

export default LeftDrawer;
