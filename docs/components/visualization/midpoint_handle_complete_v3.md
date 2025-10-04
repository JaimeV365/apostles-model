# MidpointHandle Component - Complete Documentation v3.0

## Overview
The MidpointHandle component provides interactive control of the quadrant division point in the Apostles Model visualization. It manages grid snapping, position constraints, and interactions with special zones, with intelligent constraint adaptation based on areas visibility mode.

## Features
- Draggable midpoint control
- Grid snapping with half-point support
- Automatic near-apostles management
- Position constraints enforcement
- Visual feedback for half positions
- **NEW v3.0**: Areas-aware constraint system
- **NEW v3.0**: Adaptive positioning based on visualization mode

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
  /** NEW v3.0: Areas visibility control */
  showSpecialZones: boolean;
}
```

## Usage

### Basic Usage (v3.0)
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
      apostlesZoneSize={2}
      terroristsZoneSize={1}
      showNearApostles={true}
      onShowNearApostlesChange={setShowNearApostles}
      showSpecialZones={true} // NEW v3.0
    />
  );
}
```

### Areas Mode Integration (v3.0)
```tsx
// In QuadrantChart.tsx
<MidpointHandle
  // ... other props
  showSpecialZones={showSpecialZones}
  apostlesZoneSize={apostlesZoneSize}
  terroristsZoneSize={terroristsZoneSize}
/>
```

## Implementation Details

### Position Constraints (Updated v3.0)
```typescript
// NEW v3.0: Adaptive constraint system
const effectiveApostlesSize = showSpecialZones ? apostlesZoneSize : 1;
const effectiveTerroristsSize = showSpecialZones ? terroristsZoneSize : 1;

const minSat = effectiveTerroristsSize + 1;
let maxSat = dimensions.totalCols - effectiveApostlesSize;
const minLoy = effectiveTerroristsSize + 1;
let maxLoy = dimensions.totalRows - effectiveApostlesSize;
```

### Constraint Behavior by Mode (v3.0)

#### When Areas Are Visible (`showSpecialZones = true`)
```typescript
// Uses actual zone sizes from resizers
const minSat = terroristsZoneSize + 1;     // e.g., 2 if terroristsZoneSize = 1
let maxSat = dimensions.totalCols - apostlesZoneSize; // e.g., 3 if apostlesZoneSize = 2
```

#### When Areas Are Hidden (`showSpecialZones = false`)
```typescript
// Uses default zone sizes (1,1) for constraints
const minSat = 1 + 1 = 2;                 // Always 2 (maintains quadrant integrity)
let maxSat = dimensions.totalCols - 1;    // e.g., 4 for 5-point scale
```

### Grid Snapping
- Snaps to grid intersections
- Supports half-grid positions
- Maintains alignment during movement
- **NEW v3.0**: Constraint enforcement respects areas mode

### Near-apostles Management
- Automatically deactivates when moving into near-apostles space
- Prevents invalid states
- Smooth state transitions
- **NEW v3.0**: Works consistently across areas modes

## Quadrant Integrity Protection (v3.0)

### The 4-Quadrant Rule
The midpoint movement **ALWAYS** ensures all 4 quadrants have at least 1x1 size:
- **Loyalists** (top-right): Always ≥ 1x1
- **Mercenaries** (bottom-right): Always ≥ 1x1  
- **Hostages** (top-left): Always ≥ 1x1
- **Defectors** (bottom-left): Always ≥ 1x1

### Constraint Examples

#### 5x10 Scale Grid
```typescript
// With areas visible (apostlesZoneSize=2, terroristsZoneSize=1):
// minSat = 1 + 1 = 2
// maxSat = 5 - 2 = 3
// minLoy = 1 + 1 = 2  
// maxLoy = 10 - 2 = 8
// Result: Midpoint can move within (2-3, 2-8)

// With areas hidden (using default 1,1):
// minSat = 1 + 1 = 2
// maxSat = 5 - 1 = 4
// minLoy = 1 + 1 = 2
// maxLoy = 10 - 1 = 9  
// Result: Midpoint can move within (2-4, 2-9) - More freedom!
```

#### 3x5 Scale Grid (Small Grid)
```typescript
// With any zone sizes:
// minSat = 2, maxSat = 2 (only one valid column)
// minLoy = 2, maxLoy = 4
// Result: Midpoint constrained to (2, 2-4) - Maintains 4 quadrants
```

## Edge Cases

### Position Validation
- Cannot move into special zones (when visible)
- Maintains minimum distances from grid edges
- Handles scale boundaries correctly
- **NEW v3.0**: Adapts to areas visibility automatically

### Half-point Detection
- Proper detection of half positions
- Visual feedback for state
- Correct snapping behavior
- **NEW v3.0**: Consistent across areas modes

### Interaction States
- Disabled state handling
- Drag state management  
- Position update validation
- **NEW v3.0**: Seamless areas mode transitions

## User Experience Improvements (v3.0)

### Problem Solved
**Before v3.0**: When users switched to "No Areas" mode:
- Midpoint was still constrained by invisible zone sizes
- Moving resizers to (3,8) would block midpoint movement at (3,x)
- Users couldn't understand why midpoint movement was restricted

**After v3.0**: Intelligent constraint adaptation:
- "No Areas" mode uses default constraints (1,1 zones)
- Midpoint gains movement freedom when areas hidden
- Maintains 4-quadrant integrity always
- Seamless transitions between modes

### State Transitions
```typescript
// Switching TO "No Areas":
// 1. showSpecialZones becomes false
// 2. Constraints switch to default (1,1) immediately
// 3. Midpoint movement freedom increases
// 4. Zone sizes preserved in memory

// Switching FROM "No Areas":  
// 1. showSpecialZones becomes true
// 2. Constraints restore to actual zone sizes
// 3. Midpoint movement respects resizer positions
// 4. Smooth transition without position jumping
```

## Performance Considerations
- Efficient position calculations
- Smooth transitions during mode changes
- Proper event cleanup
- **NEW v3.0**: Optimized constraint calculations

## Testing Scenarios (v3.0)

### Critical Test Cases

#### Basic Constraint Adaptation
1. Set resizers to custom positions (e.g., apostles=2, terrorists=1)
2. Switch to "No Areas"
3. Verify midpoint movement uses default constraints
4. Switch back to areas
5. Verify constraints restore to custom positions

#### Small Grid Behavior
1. Use 3x5 scale 
2. Verify midpoint constrained to maintain 4 quadrants
3. Switch areas mode
4. Verify constraints adapt but maintain integrity

#### Edge Position Handling
1. Move midpoint near grid boundaries
2. Switch areas modes
3. Verify no invalid positions allowed
4. Verify smooth transitions

## Related Components
- [ResizeHandles](./ResizeHandles.md) - Provides zone size values
- [ChartControls](./ChartControls.md) - Controls areas display mode
- [QuadrantAssignmentContext](./QuadrantAssignmentContext.md) - Manages state

## Changelog

### Version 3.0 (Current)
- **BREAKING**: Added `showSpecialZones` prop requirement
- **NEW**: Areas-aware constraint system
- **NEW**: Adaptive positioning based on visualization mode
- **IMPROVED**: Better user experience when switching areas modes
- **FIXED**: Midpoint movement no longer blocked by invisible constraints

### Version 2.0
- Added half-grid positioning support
- Improved near-apostles management
- Enhanced constraint calculations

### Version 1.0
- Initial implementation
- Basic midpoint control

## Migration Guide

### Updating from v2.0 to v3.0

#### Required Prop Addition
```typescript
// OLD (v2.0)
<MidpointHandle
  apostlesZoneSize={apostlesZoneSize}
  terroristsZoneSize={terroristsZoneSize}
  // ... other props
/>

// NEW (v3.0) - REQUIRED: Add showSpecialZones prop
<MidpointHandle
  apostlesZoneSize={apostlesZoneSize}
  terroristsZoneSize={terroristsZoneSize}
  showSpecialZones={showSpecialZones} // NEW: Required prop
  // ... other props
/>
```

#### Interface Update
```typescript
// Update your MidpointHandleProps interface
interface MidpointHandleProps {
  // ... existing props
  showSpecialZones: boolean; // ADD this line
}
```

### Constraint Logic Changes
The constraint calculation now considers areas visibility:
```typescript
// OLD (v2.0)
const minSat = terroristsZoneSize + 1;
let maxSat = dimensions.totalCols - apostlesZoneSize;

// NEW (v3.0)
const effectiveApostlesSize = showSpecialZones ? apostlesZoneSize : 1;
const effectiveTerroristsSize = showSpecialZones ? terroristsZoneSize : 1;
const minSat = effectiveTerroristsSize + 1;
let maxSat = dimensions.totalCols - effectiveApostlesSize;
```

## Notes
- Always validate positions
- Clean up event listeners
- Consider special zones boundaries when visible
- Maintain grid alignment
- **NEW v3.0**: Consider areas visibility for constraint calculation
- **NEW v3.0**: Always preserve 4-quadrant integrity

---

*Document Version: 3.0*  
*Last Updated: January 2025*  
*Status: Production Ready ✅*  
*Major Update: Areas-aware constraint system ✅*