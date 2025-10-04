import React from 'react';
import { ScaleFormat } from '@/types/base';
import { ScaleSelectorProps } from '../../types';
import { THEME } from '../../../styles/constants';

const ScaleSelector: React.FC<ScaleSelectorProps> = ({
  value,
  onChange,
  label,
  options,
  disabled,
  type
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