# ZoneLabel Component

## Overview
The ZoneLabel component handles the display of labels for different zones in the visualization. It manages label positioning, styling, and visibility based on zone types and states.

## Features
- Dynamic positioning
- Multiple variants
- Offset management
- Collision avoidance
- Responsive sizing
- Animation support

## Interface

### Props
```typescript
interface ZoneLabelProps {
  /** Label text */
  text: string;
  
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'near';
  
  /** Zone type for styling */
  type?: 'apostles' | 'terrorists' | 'quadrant' | 'near';
  
  /** Additional CSS classes */
  className?: string;
  
  /** Position offset requirement */
  needsOffset?: 'up' | 'down' | 'none';
}
```

## Usage

```tsx
<ZoneLabel
  text="Apostles"
  variant="primary"
  type="apostles"
  needsOffset="up"
/>
```

## Key Methods

```typescript
const getOffsetClass = (needsOffset: 'up' | 'down' | 'none'): string => {
  return needsOffset !== 'none' ? `zone-label--offset-${needsOffset}` : '';
};
```

## Notes
- Label overlap prevention
- Responsive behavior
- Animation timing
- Accessibility considerations
