# ResizeHandles Component

## Overview
The ResizeHandles component manages interactive controls for resizing special zones (Apostles/Advocates and Terrorists/Trolls areas) in the Apostles Model visualization. It provides both click and drag functionality with support for half-grid positions.

## Features
- Interactive resize handles for special zones
- Click-to-resize functionality
- Diagonal drag resizing
- Half-grid size support
- Automatic limit enforcement
- Grid snapping

## Interface

### Props
```typescript
interface ResizeHandleProps {
  /** Grid dimensions for calculations */
  dimensions: GridDimensions;
  /** Current size of apostles zone */
  apostlesZoneSize: number;
  /** Current size of terrorists zone */
  terroristsZoneSize: number;
  /** Callback for zone size changes */
  onZoneResize: (zone: 'apostles' | 'terrorists', newSize: number) => void;
  /** Enable/disable handles */
  isAdjustable: boolean;
}
```

## Usage

### Basic Usage
```tsx
function VisualizationContainer() {
  return (
    <ResizeHandle
      dimensions={dimensions}
      apostlesZoneSize={apostlesZoneSize}
      terroristsZoneSize={terroristsZoneSize}
      onZoneResize={handleZoneResize}
      isAdjustable={true}
    />
  );
}
```

## Implementation Details

### Size Limits
```typescript
// For apostles (must leave space for near-apostles)
const spaceToMidpointX = dimensions.totalCols - midCol - 1;
const spaceToMidpointY = dimensions.totalRows - midRow - 1;

// For terrorists (can reach midpoint)
const maxTerroristsX = Math.floor(midCol * 2) / 2;
const maxTerroristsY = Math.floor(midRow * 2) / 2;
```

### Click Behavior
- Single click increases size by 1 grid unit
- Half-grid increases when near midpoint half positions
- Auto-retraction when reaching maximum size

### Drag Behavior
- Diagonal movement only
- Snaps to grid lines
- Supports half-grid positions
- Continuous limit validation

## Edge Cases

### Half-Grid Handling
- Only available when midpoint is at half position
- Proper snapping during drag
- Correct retracting behavior

### Size Constraints
- Minimum size: 1x1
- Maximum size: Based on midpoint position
- Cannot exceed quadrant boundaries

### Visual States
- Hidden when not adjustable
- Proper positioning at area corners
- Clear movement feedback

## Performance Considerations
- Efficient size calculations
- Smooth transitions
- Proper event cleanup

## Related Components
- [MidpointHandle](./MidpointHandle.md)
- [SpecialZoneRenderer](./SpecialZones.md)
- [Special-Areas-Control-System](./Special-Areas-Control-System.md)

## Notes
- Always enforce size limits
- Handle cleanup on unmount
- Consider midpoint position for limits
- Maintain grid alignment
