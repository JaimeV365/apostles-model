import React from 'react';
import { THEME } from '../styles/constants';
import { ScaleFormat } from '@/types';

interface ScaleSelectorProps {
  label: string;
  value: ScaleFormat;
  onChange: (value: ScaleFormat) => void;
  options: ScaleFormat[];
  disabled?: boolean;
}

const ScaleSelector: React.FC<ScaleSelectorProps> = ({
  label,
  value,
  onChange,
  options,
  disabled
}) => {
  return (
    <div className="scale-selector-container">
      {disabled && (
        <div className="scale-warning-message">
          Scales are locked while data exists
        </div>
      )}
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ScaleFormat)}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ScaleSelector;