import React from 'react';
import './DuplicateHandler.css';

export interface DuplicateEntry {
  id: string;
  name?: string;
  email?: string;
  satisfaction: number;
  loyalty: number;
  date?: string;
}

interface DuplicateHandlerProps {
  isOpen: boolean;
  onClose: () => void;
  existingEntry: DuplicateEntry;
  newEntry: DuplicateEntry;
  onSkip: () => void;
  onAdd: () => void;
  onEdit: () => void;
}

const DuplicateHandler = ({
  isOpen,
  onClose,
  existingEntry,
  newEntry,
  onSkip,
  onAdd,
  onEdit
}: DuplicateHandlerProps) => {
  if (!isOpen) return null;

  
  // Format the display ID - keeping original values for existing entries
  const formatDisplayId = (id: string, isExisting: boolean) => {
    if (isExisting) {
      // For existing entries, show the actual ID
      return id || 'Anonymous';
    } else {
      // For new entries without IDs, show Anonymous
      return id || 'Anonymous';
    }
  };

  return (
    <div className="duplicate-handler-overlay">
      <div className="duplicate-handler-modal">
      <div className="duplicate-handler-header">
  <h2>Duplicate Entry Found</h2>
  <button onClick={onClose} className="duplicate-handler-close">&times;</button>
</div>
        
        <div className="duplicate-handler-content">
        <div className="duplicate-handler-description">
  ⚠️ An entry with matching information already exists:
</div>
          
          <div className="duplicate-handler-comparison">
            <div className="duplicate-handler-entry duplicate-handler-entry-existing">
              <h3>Existing Entry:</h3>
              <div>{formatDisplayId(existingEntry.id, true)}</div>
              {existingEntry.name && <div>Name: {existingEntry.name}</div>}
              {existingEntry.email && <div>Email: {existingEntry.email}</div>}
              {existingEntry.date && <div>Date: {existingEntry.date}</div>}
              <div>Satisfaction: {existingEntry.satisfaction}</div>
              <div>Loyalty: {existingEntry.loyalty}</div>
            </div>

            <div className="duplicate-handler-entry duplicate-handler-entry-new">
              <h3>New Entry:</h3>
              <div>{formatDisplayId(newEntry.id, false)}</div>
              {newEntry.name && <div>Name: {newEntry.name}</div>}
              {newEntry.email && <div>Email: {newEntry.email}</div>}
              {newEntry.date && <div>Date: {newEntry.date}</div>}
              <div>Satisfaction: {newEntry.satisfaction}</div>
              <div>Loyalty: {newEntry.loyalty}</div>
            </div>
          </div>

          <div className="duplicate-handler-message">
            <strong>What would you like to do?</strong>
          </div>
        </div>

        <div className="duplicate-handler-footer">
          <button onClick={onSkip} className="duplicate-handler-button duplicate-handler-button--secondary">
            Skip New Entry
          </button>
          <button onClick={onEdit} className="duplicate-handler-button duplicate-handler-button--warning">
            Edit Before Adding
          </button>
          <button onClick={onAdd} className="duplicate-handler-button duplicate-handler-button--primary">
            Add as New Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateHandler;