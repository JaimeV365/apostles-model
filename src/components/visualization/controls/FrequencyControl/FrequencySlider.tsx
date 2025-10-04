import React, { useState, useEffect } from 'react';
import './FrequencySlider.css';

interface FrequencySliderProps {
  maxFrequency: number;
  currentThreshold: number;
  onThresholdChange: (value: number) => void;
  showLabel?: boolean;
}

export const FrequencySlider: React.FC<FrequencySliderProps> = ({
  maxFrequency,
  currentThreshold,
  onThresholdChange,
  showLabel = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentThreshold.toString());

  useEffect(() => {
    if (!isEditing) {
      setInputValue(currentThreshold.toString());
    }
  }, [currentThreshold, isEditing]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onThresholdChange(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    let value = parseInt(inputValue);
    if (isNaN(value)) value = 1;
    value = Math.max(1, Math.min(value, maxFrequency));
    onThresholdChange(value);
    setIsEditing(false);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  return (
    <div className="frequency-slider">
      <div className="frequency-slider-controls">
        <input 
          type="range"
          min="1"
          max={maxFrequency}
          value={currentThreshold}
          onChange={handleSliderChange}
          className="frequency-range"
        />
        <div className="frequency-value">
          {isEditing ? (
            <input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyPress={handleInputKeyPress}
              min="1"
              max={maxFrequency}
              className="frequency-input"
              autoFocus
            />
          ) : (
            <span 
              className="frequency-number" 
              onClick={() => setIsEditing(true)}
            >
              {currentThreshold}
            </span>
          )}
          <span className="frequency-separator">/</span>
          <span className="frequency-max">{maxFrequency}</span>
        </div>
      </div>
    </div>
  );
};

export default FrequencySlider;