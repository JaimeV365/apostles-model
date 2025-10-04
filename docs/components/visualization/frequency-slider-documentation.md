# FrequencySlider Component

## Overview
The FrequencySlider component provides an interactive control for filtering data points based on their frequency in the Apostles Model visualization. It offers both slider and direct input interfaces for threshold management, with smooth transitions and robust input validation.

## Features
- Interactive slider control
- Direct numeric input option
- Dynamic range handling
- Visual feedback
- Input validation
- Smooth transitions
- Accessibility support

## Interface

### Props
```typescript
interface FrequencySliderProps {
  /** Maximum frequency value from dataset */
  maxFrequency: number;
  
  /** Current threshold value */
  currentThreshold: number;
  
  /** Callback for threshold changes */
  onThresholdChange: (value: number) => void;
  
  /** Optional label visibility toggle */
  showLabel?: boolean;
}
```

## Implementation

### Core Component Structure
```tsx
const FrequencySlider: React.FC<FrequencySliderProps> = ({
  maxFrequency,
  currentThreshold,
  onThresholdChange,
  showLabel = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentThreshold.toString());

  return (
    <div className="frequency-slider">
      <div className="frequency-slider-controls">
        <RangeInput />
        <ValueDisplay />
      </div>
    </div>
  );
};
```

### Input Handling
```typescript
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
```

## Styling

### Core Styles
```css
.frequency-slider {
  width: 90%;
  padding: 0;
  margin-top: 8px;
}

.frequency-slider-controls {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.frequency-range {
  width: 100%;
  margin: 0;
}

.frequency-value {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}
```

### Thumb Styling
```css
.frequency-range::-webkit-slider-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #10b981;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.15s ease;
}

.frequency-range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #10b981;
  cursor: pointer;
}
```

## Value Management

### Validation
```typescript
const validateInput = (value: string): number => {
  const parsed = parseInt(value);
  if (isNaN(parsed)) return 1;
  return Math.max(1, Math.min(parsed, maxFrequency));
};
```

### State Updates
```typescript
useEffect(() => {
  if (!isEditing) {
    setInputValue(currentThreshold.toString());
  }
}, [currentThreshold, isEditing]);
```

## Interaction Patterns

### Direct Input Mode
```typescript
const handleNumberClick = () => {
  setIsEditing(true);
};

const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    handleInputBlur();
  }
};
```

### Focus Management
```typescript
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
```

## Accessibility Features

### ARIA Support
```typescript
<input
  type="range"
  aria-label="Frequency threshold"
  aria-valuemin="1"
  aria-valuemax={maxFrequency}
  aria-valuenow={currentThreshold}
  role="slider"
/>
```

### Keyboard Navigation
- Arrow keys for value adjustment
- Home/End for min/max values
- Enter to confirm input
- Escape to cancel input

## Edge Cases

### Input Validation
- Non-numeric input handling
- Out of range values
- Empty input
- Decimal numbers

### Visual States
- Zero frequency
- Single frequency
- Maximum reached
- Disabled state

## Performance Considerations

### State Updates
- Debounced value changes
- Memoized callbacks
- Efficient re-renders

### Event Handling
- Throttled slider updates
- Optimized input handling
- Smooth animations

## Dependencies
- React (useState, useEffect)
- CSS Modules

## Related Components
- ChartControls
- DataPointRenderer
- QuadrantChart

## Version History

### Current Version: 1.3.0
- Added direct input
- Improved accessibility
- Enhanced input validation
- Added keyboard support

### Planned Improvements
1. Touch device optimization
2. Custom range markers
3. Enhanced visual feedback
4. Advanced input validation