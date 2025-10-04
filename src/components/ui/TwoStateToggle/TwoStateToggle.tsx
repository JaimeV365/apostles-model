import React, { useId } from 'react';
import './TwoStateToggle.css';

interface TwoStateToggleProps {
  leftLabel: string;
  rightLabel: string;
  value: 'left' | 'right';
  onChange: (value: 'left' | 'right') => void;
  disabled?: boolean;
  disabledReason?: string;
}

export const TwoStateToggle: React.FC<TwoStateToggleProps> = ({
  leftLabel,
  rightLabel,
  value,
  onChange,
  disabled = false,
  disabledReason
}) => {
  // Generate unique ID for this toggle group
  const id = useId();
  
  const handleChange = (newValue: 'left' | 'right') => {
    if (!disabled && value !== newValue) {
      onChange(newValue);
    }
  };

  return (
    <div className={`two-state-toggle ${disabled ? 'disabled' : ''}`}>
      {disabled && disabledReason && (
        <div className="tooltip">{disabledReason}</div>
      )}
      <input
        type="radio"
        id={`left-${id}`}
        name={`toggle-${id}`}
        checked={value === 'left'}
        onChange={() => handleChange('left')}
        disabled={disabled}
      />
      <label htmlFor={`left-${id}`}>{leftLabel}</label>

      <input
        type="radio"
        id={`right-${id}`}
        name={`toggle-${id}`}
        checked={value === 'right'}
        onChange={() => handleChange('right')}
        disabled={disabled}
      />
      <label htmlFor={`right-${id}`}>{rightLabel}</label>
    </div>
  );
};