import React from 'react';
import './ThreeStateToggle.css';

export type TogglePosition = 1 | 2 | 3;

interface ThreeStateToggleProps {
  position: TogglePosition;
  onChange: (position: TogglePosition) => void;
  labels: [string, string, string];
  disabled?: boolean;
  disabledReason?: string;
  disabledPositions?: TogglePosition[];
  disabledPositionReason?: string;
}

export const ThreeStateToggle: React.FC<ThreeStateToggleProps> = ({
  position,
  onChange,
  labels,
  disabled = false,
  disabledReason,
  disabledPositions = [],
  disabledPositionReason
}) => {
  const handlePositionClick = (newPosition: TogglePosition) => {
    if (!disabled && newPosition !== position) {
      onChange(newPosition);
    }
  };

  return (
    <div className={`three-state-toggle ${disabled ? 'disabled' : ''}`}>
      {disabled && disabledReason && (
        <div className="tooltip">{disabledReason}</div>
      )}
      <div className="three-state-toggle__buttons">
        <button
          className={`three-state-toggle__button ${position === 1 ? 'active' : ''}`}
          onClick={() => handlePositionClick(1)}
          type="button"
        >
          {labels[0]}
        </button>
        <button
          className={`three-state-toggle__button ${position === 2 ? 'active' : ''}`}
          onClick={() => handlePositionClick(2)}
          type="button"
        >
          {labels[1]}
        </button>
        <button
  className={`three-state-toggle__button ${position === 3 ? 'active' : ''} ${
    disabledPositions?.includes(3) ? 'three-state-toggle__button--disabled' : ''
  }`}
  onClick={() => handlePositionClick(3)}
  type="button"
  disabled={disabledPositions?.includes(3)}
  title={disabledPositions?.includes(3) ? disabledPositionReason : undefined}
>
  {labels[2]}
</button>
      </div>
    </div>
  );
};

export default ThreeStateToggle;