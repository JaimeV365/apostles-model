import React from 'react';
import './ControlSwitch.css';

interface ControlSwitchProps {
  label: string;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  leftLabel?: string;
  rightLabel?: string;
  disabled?: boolean;
}

const ControlSwitch: React.FC<ControlSwitchProps> = ({
  label,
  isChecked,
  onChange,
  leftLabel,
  rightLabel,
  disabled = false
}) => (
  <div className={`control-switch ${disabled ? 'control-switch--disabled' : ''}`}>
    {leftLabel && <span className="control-switch__label">{leftLabel}</span>}
    <label className="control-switch__toggle" title={label}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="control-switch__slider"></span>
    </label>
    {rightLabel && <span className="control-switch__label">{rightLabel}</span>}
  </div>
);

export default ControlSwitch;