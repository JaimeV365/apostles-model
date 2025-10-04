# MidpointHandle Component - Complete Documentation v4.0

## Overview
The MidpointHandle component provides interactive control of the quadrant division point in the Apostles Model visualization. It manages grid snapping, position constraints, and interactions with special zones, with intelligent constraint adaptation based on areas visibility mode and proper support for 0-10 scale systems.

## Features
- Draggable midpoint control
- Grid snapping with half-point support
- Automatic near-apostles management
- Position constraints enforcement
- Visual feedback for half positions
- **v3.0**: Areas-aware constraint system
- **v3.0**: Adaptive positioning based on visualization mode
- **NEW v4.0**: Full support for 0-10 scale systems with proper boundary calculations

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
  /** Areas visibility control */
  showSpecialZones: boolean;
}
```

## Usage

### Basic Usage (v4.0)
```tsx
function VisualizationContainer() {
  return (
    <MidpointHandle
      position={position}
      midpoint={midpoint}
      dimensions={dimensions}
      satisfactionScale="1-7"
      loyaltyScale="0-10"  // Now fully supported
      onMidpointChange={handleMidpointChange}
      isAdjustable={true}
      apostlesZoneSize={2}
      terroristsZoneSize={1}
      showNearApostles={true}
      onShowNearApostlesChange={setShowNearApostles}
      showSpecialZones={true}
    />
  );
}
```

### Areas Mode Integration (v4.0)
```tsx
// In QuadrantChart.tsx
<MidpointHandle
  // ... other props
  showSpecialZones={showSpecialZones}
  apostlesZoneSize={apostlesZoneSize}
  terroristsZoneSize={terroristsZoneSize}
  satisfactionScale={satisfactionScale}
  loyaltyScale={loyaltyScale}  // Supports both 1-X and 0-10
/>
```

## Implementation Details

### Position Constraints (Updated v4.0)

#### Standard Scales (1-X format)
```typescript
const effectiveApostlesSize = showSpecialZones ? apostlesZoneSize : 1;
const effectiveTerroristsSize = showSpecialZones ? terroristsZoneSize : 1;

const minSat = effectiveTerroristsSize + 1;
let maxSat = dimensions.totalCols - effectiveApostlesSize;
const minLoy = effectiveTerroristsSize + 1;
let maxLoy = dimensions.totalRows - effectiveApostlesSize;
```

#### 0-10 Scale Support (NEW v4.0)
```typescript
// Special handling for 0-10 loyalty scale
let minLoy, maxLoy;
if (loyaltyScale === '0-10') {
  minLoy = effectiveTerroristsSize;  // For 0-10: maintains 1-cell gap from bottom
  maxLoy = dimensions.totalRows - effectiveApostlesSize - 1;  // For 0-10: maintains 1-cell gap from top
} else {
  minLoy = effectiveTerroristsSize + 1;
  maxLoy = dimensions.totalRows - effectiveApostlesSize;
}

// Satisfaction axis uses standard logic (0-10 satisfaction scale not currently supported)
const minSat = effectiveTerroristsSize + 1;
let maxSat = dimensions.totalCols - effectiveApostlesSize;
```

### Scale-Specific Behavior (v4.0)

#### 1-5 / 0-10 Mixed Scale Example
```typescript
// satisfactionScale = "1-5", loyaltyScale = "0-10"
// effectiveTerroristsSize = 1, effectiveApostlesSize = 1

// Satisfaction bounds (standard logic):
// minSat = 1 + 1 = 2
// maxSat = 5 - 1 = 4
// Valid range: 2-4

// Loyalty bounds (0-10 special logic):  
// minLoy = 1 (maintains 1-cell gap from 0)
// maxLoy = 11 - 1 - 1 = 9 (maintains 1-cell gap from 10)
// Valid range: 1-9

// Result: Midpoint constrained to (2-4, 1-9)
```

### Constraint Behavior by Mode (v4.0)

#### When Areas Are Visible (`showSpecialZones = true`)
```typescript
// Uses actual zone sizes from resizers
const minSat = terroristsZoneSize + 1;     // e.g., 2 if terroristsZoneSize = 1
let maxSat = dimensions.totalCols - apostlesZoneSize; // e.g., 3 if apostlesZoneSize = 2

// For 0-10 loyalty scale:
const minLoy = terroristsZoneSize;         // e.g., 1 if terroristsZoneSize = 1
let maxLoy = dimensions.totalRows - apostlesZoneSize - 1; // e.g., 9 if apostlesZoneSize = 1
```

#### When Areas Are Hidden (`showSpecialZones = false`)
```typescript
// Uses default zone sizes (1,1) for constraints
const minSat = 1 + 1 = 2;                 // Always 2 (maintains quadrant integrity)
let maxSat = dimensions.totalCols - 1;    // e.g., 4 for 5-point scale

// For 0-10 loyalty scale:
const minLoy = 1;                         // 1 (maintains 1-cell gap from 0)
let maxLoy = dimensions.totalRows - 1 - 1 = dimensions.totalRows - 2; // e.g., 9 for 0-10 scale
```

### Grid Snapping
- Snaps to grid intersections
- Supports half-grid positions
- Maintains alignment during movement
- **v4.0**: Constraint enforcement respects scale type (1-X vs 0-10)

### Near-apostles Management
- Automatically deactivates when moving into near-apostles space
- Prevents invalid states
- Smooth state transitions
- **v4.0**: Works consistently across all scale types

## Quadrant Integrity Protection (v4.0)

### The 4-Quadrant Rule
The midpoint movement **ALWAYS** ensures all 4 quadrants have at least 1x1 size:
- **Loyalists** (top-right): Always ≥ 1x1
- **Mercenaries** (bottom-right): Always ≥ 1x1  
- **Hostages** (top-left): Always ≥ 1x1
- **Defectors** (bottom-left): Always ≥ 1x1

### Constraint Examples (v4.0)

#### 1-5 / 0-10 Scale Grid
```typescript
// With areas visible (apostlesZoneSize=2, terroristsZoneSize=1):
// minSat = 1 + 1 = 2
// maxSat = 5 - 2 = 3
// minLoy = 1 (0-10 special case)
// maxLoy = 11 - 2 - 1 = 8
// Result: Midpoint can move within (2-3, 1-8)

// With areas hidden (using default 1,1):
// minSat = 1 + 1 = 2
// maxSat = 5 - 1 = 4
// minLoy = 1 (0-10 special case)
// maxLoy = 11 - 1 - 1 = 9
// Result: Midpoint can move within (2-4, 1-9) - More freedom!
```

#### 1-7 / 1-10 Scale Grid (Standard)
```typescript
// With areas visible (apostlesZoneSize=2, terroristsZoneSize=1):
// minSat = 1 + 1 = 2
// maxSat = 7 - 2 = 5
// minLoy = 1 + 1 = 2  
// maxLoy = 10 - 2 = 8
// Result: Midpoint can move within (2-5, 2-8)
```

#### 3x5 Scale Grid (Small Grid)
```typescript
// With any zone sizes:
// minSat = 2, maxSat = 2 (only one valid column)
// minLoy = 2, maxLoy = 4 (or 1-4 if using 0-5 loyalty scale)
// Result: Midpoint constrained to maintain 4 quadrants
```

## Edge Cases (v4.0)

### Position Validation
- Cannot move into special zones (when visible)
- Maintains minimum distances from grid edges
- **NEW v4.0**: Handles 0-10 scale boundaries correctly
- Adapts to areas visibility automatically

### Scale Boundary Handling (NEW v4.0)
- **0-10 Scale**: Maintains 1-cell gap from both 0 and 10
- **1-X Scale**: Maintains 1-cell gap from both 1 and X
- **Mixed Scales**: Applies appropriate logic per axis

### Half-point Detection
- Proper detection of half positions
- Visual feedback for state
- Correct snapping behavior
- **v4.0**: Consistent across all scale types

### Interaction States
- Disabled state handling
- Drag state management  
- Position update validation
- **v4.0**: Seamless transitions across scale types

## User Experience Improvements (v4.0)

### Problem Solved in v3.0
**Before v3.0**: When users switched to "No Areas" mode:
- Midpoint was still constrained by invisible zone sizes
- Moving resizers to (3,8) would block midpoint movement at (3,x)
- Users couldn't understand why midpoint movement was restricted

**After v3.0**: Intelligent constraint adaptation:
- "No Areas" mode uses default constraints (1,1 zones)
- Midpoint gains movement freedom when areas hidden
- Maintains 4-quadrant integrity always
- Seamless transitions between modes

### Problem Solved in v4.0
**Before v4.0**: 0-10 scale systems had incorrect boundaries:
- Top edge: Could reach actual edge (no gap) ❌
- Bottom edge: Had 2-cell gap instead of 1-cell gap ❌
- Only affected loyalty axis with 0-10 scale

**After v4.0**: Proper 0-10 scale support:
- Top edge: Maintains 1-cell gap (stops at 9 for 0-10 scale) ✅
- Bottom edge: Maintains 1-cell gap (starts at 1 for 0-10 scale) ✅
- Consistent behavior across all scale combinations

### State Transitions (v4.0)
```typescript
// Switching TO "No Areas" with 0-10 loyalty scale:
// 1. showSpecialZones becomes false
// 2. Constraints switch to: minLoy = 1, maxLoy = 9 (for 0-10)
// 3. Midpoint movement freedom increases
// 4. Zone sizes preserved in memory

// Switching FROM "No Areas" with 0-10 loyalty scale:  
// 1. showSpecialZones becomes true
// 2. Constraints restore using 0-10 logic: minLoy = terroristsZoneSize
// 3. Midpoint movement respects resizer positions
// 4. Smooth transition without position jumping
```

## Performance Considerations
- Efficient position calculations
- Smooth transitions during mode changes
- Proper event cleanup
- **v4.0**: Optimized scale-specific constraint calculations

## Testing Scenarios (v4.0)

### Critical Test Cases

#### Basic Constraint Adaptation
1. Set resizers to custom positions (e.g., apostles=2, terrorists=1)
2. Switch to "No Areas"
3. Verify midpoint movement uses default constraints
4. Switch back to areas
5. Verify constraints restore to custom positions

#### 0-10 Scale Boundary Testing (NEW v4.0)
1. Use 1-5 / 0-10 scale combination
2. Test top boundary: Verify stops at loy=9 (not 10)
3. Test bottom boundary: Verify stops at loy=1 (not 2)
4. Test side boundaries: Verify normal 1-5 logic (sat=2 to sat=4)
5. Switch areas modes and retest

#### Small Grid Behavior
1. Use 3x5 scale 
2. Verify midpoint constrained to maintain 4 quadrants
3. Switch areas mode
4. Verify constraints adapt but maintain integrity

#### Mixed Scale Scenarios (NEW v4.0)
1. Test 1-7 / 0-10 combination
2. Test 0-10 / 1-5 combination (when 0-10 satisfaction support added)
3. Verify each axis uses appropriate boundary logic
4. Test transitions between scale types

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

### Version 4.0 (Current)
- **MAJOR**: Added full support for 0-10 scale systems
- **FIXED**: Boundary calculations for mixed scale scenarios (e.g., 1-5 / 0-10)
- **IMPROVED**: Scale-specific constraint logic
- **ENHANCED**: Consistent 1-cell gap maintenance across all scale types

### Version 3.0
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

### Updating from v3.0 to v4.0

#### No Breaking Changes
v4.0 is fully backward compatible with v3.0. All existing implementations will continue to work.

#### Enhanced Scale Support
```typescript
// NEW (v4.0) - 0-10 scales now work correctly
<MidpointHandle
  satisfactionScale="1-5"
  loyaltyScale="0-10"  // Now properly supported
  // ... other props
/>
```

#### Constraint Logic Improvements
```typescript
// OLD (v3.0) - 0-10 scale had incorrect boundaries
// minLoy = terroristsZoneSize + 1  // Would give 2 for 0-10 scale (wrong)
// maxLoy = dimensions.totalRows - apostlesZoneSize  // Would give 10 for 0-10 scale (wrong)

// NEW (v4.0) - 0-10 scale has correct boundaries
if (loyaltyScale === '0-10') {
  minLoy = terroristsZoneSize;  // Gives 1 for 0-10 scale (correct)
  maxLoy = dimensions.totalRows - apostlesZoneSize - 1;  // Gives 9 for 0-10 scale (correct)
}
```

### Updating from v2.0 to v4.0

Follow the v2.0 → v3.0 migration steps, then apply v4.0 enhancements.

#### Required Prop Addition
```typescript
// OLD (v2.0)
<MidpointHandle
  apostlesZoneSize={apostlesZoneSize}
  terroristsZoneSize={terroristsZoneSize}
  // ... other props
/>

// NEW (v4.0) - REQUIRED: Add showSpecialZones prop
<MidpointHandle
  apostlesZoneSize={apostlesZoneSize}
  terroristsZoneSize={terroristsZoneSize}
  showSpecialZones={showSpecialZones} // Required prop
  satisfactionScale={satisfactionScale} // Enhanced support
  loyaltyScale={loyaltyScale} // Enhanced support
  // ... other props
/>
```

## Notes
- Always validate positions
- Clean up event listeners
- Consider special zones boundaries when visible
- Maintain grid alignment
- **v3.0**: Consider areas visibility for constraint calculation
- **v3.0**: Always preserve 4-quadrant integrity
- **NEW v4.0**: Handle 0-10 scale boundaries correctly
- **NEW v4.0**: Apply scale-specific constraint logic per axis

---

*Document Version: 4.0*  
*Last Updated: January 2025*  
*Status: Production Ready ✅*  
*Major Update: 0-10 Scale Support ✅*  
*Backward Compatible: v3.0+ ✅*