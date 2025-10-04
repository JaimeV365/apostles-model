import React from 'react';
import './ImportModeModal.css';

export type ImportMode = 'append' | 'overwrite';

interface ImportModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: ImportMode) => void;
}

export const ImportModeModal: React.FC<ImportModeModalProps> = ({
  isOpen,
  onClose,
  onSelectMode
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="import-mode-overlay" onClick={() => onClose()}>
      <div className="import-mode-modal" onClick={(e) => e.stopPropagation()}>
        <div className="import-mode-header">
          <h3>Choose Import Mode</h3>
          <button className="import-mode-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="import-mode-content">
          <p className="import-mode-explanation">
            This file contains data with IDs that already exist in your dataset. Please choose how you want to handle this:
          </p>
          
          <div className="import-mode-buttons">
            <div 
              className="import-mode-button import-mode-button--append"
              onClick={() => onSelectMode('append')}
            >
              <div className="import-mode-button-icon">
                <span className="icon-plus">&#43;</span>
              </div>
              Add to Existing Data
              <div className="import-mode-button-description">
                Keep all existing data and add these new entries
              </div>
            </div>
            
            <div 
              className="import-mode-button import-mode-button--overwrite"
              onClick={() => onSelectMode('overwrite')}
            >
              <div className="import-mode-button-icon">
                <span className="icon-replace">&#8635;</span>
              </div>
              Replace All
              <div className="import-mode-button-description">
                Replace all existing data with this import
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};