import React from 'react';
import '../styles/ThreeStateSwitch.css';

export interface ThreeStateSwitchProps {
  value: 'all' | 'some' | 'none';
  onChange: (value: 'all' | 'some' | 'none') => void;
  leftLabel?: string;
  middleLabel?: string;
  rightLabel?: string;
  disabled?: boolean;
}

export const ThreeStateSwitch: React.FC<ThreeStateSwitchProps> = ({
  value,
  onChange,
  leftLabel = 'All',
  middleLabel = 'Some',
  rightLabel = 'None',
  disabled = false
}) => {
  return (
    <div 
      className="three-state-switch"
      onClick={() => {
        if (disabled) return;
        const nextValue = value === 'all' ? 'some' : value === 'some' ? 'none' : 'all';
        onChange(nextValue);
      }}
      role="radiogroup"
      aria-label="Label visibility options"
    >
      <div className={`switch-slider slider-${value}`} />
      <div className="switch-labels">
        <span 
          className={`label ${value === 'all' ? 'active' : ''}`}
          role="radio"
          aria-checked={value === 'all'}
        >
          {leftLabel}
        </span>
        <span 
          className={`label ${value === 'some' ? 'active' : ''}`}
          role="radio"
          aria-checked={value === 'some'}
        >
          {middleLabel}
        </span>
        <span 
          className={`label ${value === 'none' ? 'active' : ''}`}
          role="radio"
          aria-checked={value === 'none'}
        >
          {rightLabel}
        </span>
      </div>
    </div>
  );
};

export default ThreeStateSwitch;