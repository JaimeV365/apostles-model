# Switch Component

## Overview
The Switch component provides a toggleable switch control with optional labels for the visualization controls. It supports both enabled and disabled states with smooth transitions.

## Features
- Binary state toggle
- Optional labels
- Disabled state
- Smooth transitions
- Customizable styling
- Accessibility support

## Interface

### Props
```typescript
interface SwitchProps {
  /** Current state */
  checked: boolean;
  
  /** State change handler */
  onChange: (checked: boolean) => void;
  
  /** Optional left label */
  leftLabel?: string;
  
  /** Optional right label */
  rightLabel?: string;
  
  /** Disabled state */
  disabled?: boolean;
}
```

## Usage

```tsx
<Switch
  checked={isEnabled}
  onChange={setIsEnabled}
  leftLabel="Off"
  rightLabel="On"
  disabled={false}
/>
```

## Key Features
- Visual feedback
- State management
- Label positioning
- Animation handling

## Notes
- Accessibility support
- Touch targets
- State transitions
- Color themes
