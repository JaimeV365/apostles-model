# ResizeHandles Component

## Overview
The ResizeHandles component manages the interactive resize controls for special zones in the Apostles Model visualization. It provides draggable handles for adjusting the size of Apostles and Terrorists zones.

## Features
- Interactive resize handles
- Size constraints management
- Visual feedback
- Smooth animations
- Touch support
- Position calculation
- Grid snapping

## Interface

### Props
```typescript
interface ResizeHandlesProps {
  /** Grid dimensions */
  dimensions: GridDimensions;
  
  /** Current zone sizes */
  apostlesZoneSize: number;
  terroristsZoneSize: number;
  
  /** Resize callback */
  onZoneResize: (zone: 'apostles' | 'terrorists', newSize: number) => void;
  
  /** Enable/disable handles */
  isAdjustable: boolean;
}
```

## Usage

```tsx
<ResizeHandles
  dimensions={dimensions}
  apostlesZoneSize={2}
  terroristsZoneSize={1}
  onZoneResize={handleResize}
  isAdjustable={true}
/>
```

## Key Methods

```typescript
const handleMouseDown = (zone: 'apostles' | 'terrorists') => (e: MouseEvent) => {
  e.preventDefault();
  const startX = e.clientX;
  const startY = e.clientY;
  
  // Resize logic
};
```

## Accessibility
- ARIA labels
- Keyboard support
- Focus management
- Touch targets

## Notes
- Grid snapping behavior
- Size constraints
- Performance monitoring
- Touch device support
