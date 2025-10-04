# ControlSwitch Component

## Overview
The ControlSwitch component provides a labeled toggle switch control with customizable labels and styling.

## Interface
```typescript
interface ControlSwitchProps {
  /** Main label for the switch */
  label: string;
  
  /** Label for left/off state */
  leftLabel: string;
  
  /** Label for right/on state */
  rightLabel: string;
  
  /** Current state */
  isChecked: boolean;
  
  /** State change handler */
  onChange: (checked: boolean) => void;
  
  /** Disabled state */
  disabled?: boolean;
}
```

## Usage Example
```tsx
<ControlSwitch
  label="Mode"
  leftLabel="Simple"
  rightLabel="Advanced"
  isChecked={isAdvanced}
  onChange={setIsAdvanced}
/>
```

## Styling
```css
.control-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 24px;
}

.switch-track {
  background-color: #E5E7EB;
  border-radius: 12px;
  transition: background-color 0.2s;
}

.switch-thumb {
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s;
}
```

## Accessibility
- ARIA roles
- Keyboard navigation
- Focus management
- Screen reader support

## Animation
- Smooth transitions
- State feedback
- Visual cues
- Hover effects