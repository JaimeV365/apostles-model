import React from 'react';
import './Switch.css';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  leftLabel?: string;
  rightLabel?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  leftLabel,
  rightLabel,
  disabled = false
}) => (
  <div className="switch-container">
    {leftLabel && <span className="switch-label">{leftLabel}</span>}
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`switch ${checked ? 'switch--checked' : ''} ${disabled ? 'switch--disabled' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <span className="switch-thumb" />
    </button>
    {rightLabel && <span className="switch-label">{rightLabel}</span>}
  </div>
);