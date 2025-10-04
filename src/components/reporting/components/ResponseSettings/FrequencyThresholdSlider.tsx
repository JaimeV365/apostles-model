// FrequencyThresholdSlider.tsx - FIXED VERSION
import React from 'react';
import './FrequencyThresholdSlider.css';

interface FrequencyThresholdSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  inPremiumSection?: boolean;
}

export const FrequencyThresholdSlider: React.FC<FrequencyThresholdSliderProps> = ({
  value,
  onChange,
  min = 2,
  max = 10,
  disabled = false,
  inPremiumSection = false
}) => {
  // Ensure minimum value is enforced
  const effectiveMin = Math.max(min, 2);
  const effectiveValue = Math.max(value, effectiveMin);
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(parseInt(e.target.value), effectiveMin);
    onChange(newValue);
  };

  const getSliderBackground = () => {
    const percentage = ((effectiveValue - effectiveMin) / (max - effectiveMin)) * 100;
    return `linear-gradient(to right, #3a863e 0%, #3a863e ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
  };

  // CHANGE: Use inPremiumSection flag instead of premium class
  const containerClass = `frequency-threshold-slider ${disabled ? 'disabled' : ''} ${inPremiumSection ? 'in-premium-section' : ''}`;

  return (
    <div className={containerClass}>
      <div className="slider-header">
        <label className="slider-label">
          Show combinations appearing
        </label>
        <span className="slider-value">
          {effectiveValue}+ times
        </span>
      </div>
      
      <div className="slider-container">
        <input
          type="range"
          className="frequency-slider"
          min={effectiveMin}
          max={max}
          value={effectiveValue}
          onChange={handleSliderChange}
          disabled={disabled}
          style={{ background: getSliderBackground() }}
        />
        
        <div className="slider-ticks">
          {Array.from({ length: max - effectiveMin + 1 }, (_, i) => (
            <div 
              key={i + effectiveMin}
              className={`tick ${effectiveValue === i + effectiveMin ? 'active' : ''}`}
            >
              {i + effectiveMin}
            </div>
          ))}
        </div>
      </div>
      
     <div className="slider-description">
        <span className="text-xs text-gray-500">
          {effectiveValue === 2
            ? "Shows combinations that appear multiple times"
            : `Shows only high-frequency combinations (${effectiveValue}+ occurrences)`
          }
        </span>
      </div>
    </div>
  );
};

export default FrequencyThresholdSlider;