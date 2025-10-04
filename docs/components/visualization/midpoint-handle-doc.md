# MidpointHandle Component

## Overview
The MidpointHandle component provides interactive control of the quadrant division point in the Apostles Model visualization. It manages grid snapping, position constraints, and interactions with special zones.

## Features
- Draggable midpoint control
- Grid snapping with half-point support
- Automatic near-apostles management
- Position constraints enforcement
- Visual feedback for half positions

## Interface

### Props
```typescript
interface MidpointHandleProps {
  /** Current position */
  position: Position;
  /** Midpoint coordinates */
  midpoint: Midpoint;
  /** Grid dimensions */
  dimensions: GridDimensions;
  /** Scale formats */
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  /** Callback for position changes */
  onMidpointChange: (newMidpoint: Midpoint) => void;
  /** Enable/disable handle */
  isAdjustable?: boolean;
  /** Current special zone sizes */
  apostlesZoneSize: number;
  terroristsZoneSize: number;
  /** Near-apostles management */
  showNearApostles: boolean;
  onShowNearApostlesChange: (show: boolean) => void;
}
```

## Usage

### Basic Usage
```tsx
function VisualizationContainer() {
  return (
    <MidpointHandle
      position={position}
      midpoint={midpoint}
      dimensions={dimensions}
      satisfactionScale="1-7"
      loyaltyScale="1-5"
      onMidpointChange={handleMidpointChange}
      isAdjustable={true}
      apostlesZoneSize={1}
      terroristsZoneSize={1}
      showNearApostles={true}
      onShowNearApostlesChange={setShowNearApostles}
    />
  );
}
```

## Implementation Details

### Position Constraints
```typescript
// Minimum positions (stay away from special zones)
const minSat = terroristsZoneSize + 1;
const maxSat = dimensions.totalCols - apostlesZoneSize;
const minLoy = terroristsZoneSize + 1;
const maxLoy = dimensions.totalRows - apostlesZoneSize;
```

### Grid Snapping
- Snaps to grid intersections
- Supports half-grid positions
- Maintains alignment during movement

### Near-apostles Management
- Automatically deactivates when moving into near-apostles space
- Prevents invalid states
- Smooth state transitions

## Edge Cases

### Position Validation
- Cannot move into special zones
- Maintains minimum distances
- Handles scale boundaries

### Half-point Detection
- Proper detection of half positions
- Visual feedback for state
- Correct snapping behavior

### Interaction States
- Disabled state handling
- Drag state management
- Position update validation

## Performance Considerations
- Efficient position calculations
- Smooth transitions
- Proper event cleanup

## Related Components
- [ResizeHandles](./ResizeHandles.md)
- [SpecialZoneRenderer](./SpecialZones.md)
- [Special-Areas-Control-System](./Special-Areas-Control-System.md)

## Notes
- Always validate positions
- Clean up event listeners
- Consider special zones boundaries
- Maintain grid alignment
