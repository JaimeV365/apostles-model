# ScaleSelector Component

## Overview
The ScaleSelector component manages scale selection and display for satisfaction and loyalty measurements in the Apostles Model.

## Features
- Scale selection
- Lock management
- Visual feedback
- Disabled states
- Label display
- Scale validation

## Interface
```typescript
interface ScaleSelectorProps {
  /** Selector label */
  label: string;
  
  /** Current scale value */
  value: ScaleFormat;
  
  /** Scale change handler */
  onChange: (value: ScaleFormat) => void;
  
  /** Available scale options */
  options: ScaleFormat[];
  
  /** Disabled state */
  disabled: boolean;
}

type ScaleFormat = '1-5' | '1-7' | '1-10';
```

## Usage Example
```tsx
<ScaleSelector
  label="Satisfaction Scale"
  value="1-5"
  onChange={handleScaleChange}
  options={['1-5', '1-7']}
  disabled={scalesLocked}
/>
```

## State Management
- Scale selection
- Lock status
- Validation state
- Error handling

## Styling
```css
.scale-selector {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.scale-selector__label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.scale-selector__select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.scale-selector__select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}
```

## Accessibility
- ARIA labels
- Disabled states
- Focus handling
- Error messages

## Related Components
- DataInput
- InputField
- ScaleManager

## Notes
- Scale constraints
- Lock behavior
- State persistence
- Validation rules