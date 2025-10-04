# FrequencySlider Component

## Overview
The FrequencySlider component provides an interactive slider interface for filtering data points based on their frequency. It allows users to set a threshold for displaying overlapping data points in the visualization.

## Features
- Interactive slider control
- Numeric input option
- Dynamic range handling
- Custom styling
- Accessibility support
- Visual feedback
- Smooth transitions

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

interface SliderState {
  /** Direct input mode state */
  isEditing: boolean;
  
  /** Current input value when editing */
  inputValue: string;
}
```

## Usage

### Basic Usage
```tsx
function FilterControls() {
  const [threshold, setThreshold] = useState(1);
  const maxFrequency = 5;

  return (
    <FrequencySlider
      maxFrequency={maxFrequency}
      currentThreshold={threshold}
      onThresholdChange={setThreshold}
    />
  );
}
```

### With Custom Configuration
```tsx
function AdvancedFilterControls() {
  return (
    <FrequencySlider
      maxFrequency={10}
      currentThreshold={2}
      onThresholdChange={handleThresholdChange}
      showLabel={true}
    />
  );
}
```

## Component Structure

### Main Elements
1. Slider Track
2. Slider Thumb
3. Value Display
4. Input Field (when editing)
5. Range Labels

### HTML Structure
```html
<div class="frequency-slider">
  <div class="frequency-slider-controls">
    <input type="range" class="frequency-range" />
    <div class="frequency-value">
      <span class="frequency-number">3</span>
      <span class="frequency-separator">/</span>
      <span class="frequency-max">5</span>
    </div>
  </div>
</div>
```

## Interaction Handling

### Slider Control
```typescript
const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = parseInt(e.target.value);
  onThresholdChange(value);
};
```

### Direct Input
```typescript
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

### CSS Classes
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

.frequency-value {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}
```

## Event Handling

### Value Updates
```typescript
useEffect(() => {
  if (!isEditing) {
    setInputValue(currentThreshold.toString());
  }
}, [currentThreshold, isEditing]);
```

### Input Validation
```typescript
const validateInput = (value: string): number => {
  const parsed = parseInt(value);
  if (isNaN(parsed)) return 1;
  return Math.max(1, Math.min(parsed, maxFrequency));
};
```

## Accessibility

### ARIA Attributes
```tsx
<input
  type="range"
  aria-label="Frequency threshold"
  aria-valuemin="1"
  aria-valuemax={maxFrequency}
  aria-valuenow={currentThreshold}
  role="slider"
/>
```

### Keyboard Support
- Arrow keys for increments
- Home/End for min/max
- Enter to confirm input
- Escape to cancel input

## Performance

### State Updates
- Debounced value changes
- Memoized callbacks
- Efficient re-renders

### Event Handling
- Throttled slider updates
- Optimized input handling
- Smooth animations

## Edge Cases

### Input Validation
- Non-numeric input
- Out of range values
- Empty input
- Decimal numbers

### UI States
- Zero frequency
- Single frequency
- Maximum reached
- Disabled state

## Related Components
- [DataPointRenderer](./DataPointRenderer.md)
- [ChartControls](./ChartControls.md)

## Dependencies
- React (useState, useEffect)
- CSS Modules

## Example Implementation

### Full Component
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
              min="1"
              max={maxFrequency}
              className="frequency-input"
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
```

## Changelog
| Version | Changes |
|---------|---------|
| 1.0.0   | Initial implementation |
| 1.1.0   | Added direct input |
| 1.2.0   | Added keyboard support |
| 1.3.0   | Improved accessibility |

## Notes
- Consider touch device support
- Monitor performance with frequent updates
- Maintain consistent behavior across browsers
- Document custom styling options
