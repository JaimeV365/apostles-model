import React from 'react';

interface FormActionsProps {
  isEditing: boolean;
  onCancel: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isEditing,
  onCancel
}) => (
  <div className="data-input__actions">
    <button 
      type="submit" 
      className="data-input__button data-input__button--primary"
    >
      {isEditing ? 'Update' : 'Add Data'}
    </button>
    {isEditing && (
      <button 
        type="button" 
        onClick={onCancel}
        className="data-input__button data-input__button--secondary"
      >
        Cancel
      </button>
    )}
  </div>
);