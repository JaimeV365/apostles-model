# ResizeHandles Component - Complete Documentation v3.0

## Overview
The ResizeHandles component manages interactive controls for resizing special zones (Apostles/Advocates and Terrorists/Trolls areas) in the Apostles Model visualization. It provides both click and drag functionality with support for half-grid positions and intelligent visibility control based on areas display mode.

## Features
- Interactive resize handles for special zones
- Click-to-resize functionality
- Diagonal drag resizing
- Half-grid size support
- Automatic limit enforcement
- Grid snapping
- **NEW v3.0**: Automatic hiding when areas are not visible
- **NEW v3.0**: Smart visibility based on areas display mode

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
  /** Enable/disable handles - NEW: Now considers areas visibility */
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
      isAdjustable={isAdjustableMidpoint && showSpecialZones} // NEW: Combined condition
    />
  );
}
```

### Areas Display Mode Integration (v3.0)
```tsx
// In QuadrantChart.tsx
const shouldShowResizers = isAdjustableMidpoint && showSpecialZones;

<ResizeHandle
  dimensions={dimensions}
  apostlesZoneSize={apostlesZoneSize}
  terroristsZoneSize={terroristsZoneSize}
  onZoneResize={handleZoneResize}
  isAdjustable={shouldShowResizers}
/>
```

## Visibility Behavior (v3.0)

### When Resizers Are Shown
- ✅ Chart is in adjustable mode (`isAdjustableMidpoint = true`)
- ✅ Areas are visible (`showSpecialZones = true`)
- ✅ Zones have valid sizes (≥1 and ≤max)

### When Resizers Are Hidden
- ❌ Chart is in fixed mode (`isAdjustableMidpoint = false`)
- ❌ "No Areas" mode active (`showSpecialZones = false`)
- ❌ Zone sizes are invalid or at limits

### Areas Display Mode Interaction
```typescript
// Areas Display Modes:
// 1 = "No Areas"     → showSpecialZones = false → Resizers HIDDEN
// 2 = "Main Areas"   → showSpecialZones = true  → Resizers VISIBLE (if adjustable)
// 3 = "All Areas"    → showSpecialZones = true  → Resizers VISIBLE (if adjustable)
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
- **NEW v3.0**: No interaction when areas hidden

### Drag Behavior
- Diagonal movement only
- Snaps to grid lines
- Supports half-grid positions
- Continuous limit validation
- **NEW v3.0**: Disabled when areas not visible

## Edge Cases

### Half-Grid Handling
- Only available when midpoint is at half position
- Proper snapping during drag
- Correct retracting behavior

### Size Constraints
- Minimum size: 1x1
- Maximum size: Based on midpoint position
- Cannot exceed quadrant boundaries

### Visual States (Updated v3.0)
- **Hidden when not adjustable OR when areas not shown**
- Proper positioning at area corners
- Clear movement feedback
- Smooth show/hide transitions

## User Experience Improvements (v3.0)

### Problem Solved
**Before v3.0**: Users could interact with resizers even when areas were hidden ("No Areas" mode), leading to:
- Invisible resizers blocking midpoint movement
- Confusing interaction with non-visible elements
- Inconsistent constraint behavior

**After v3.0**: Resizers are intelligently hidden when not needed:
- Clean "No Areas" visualization with no interactive clutter
- Midpoint movement unrestricted by invisible zone constraints
- Consistent visual and interactive behavior

### State Management
```typescript
// When switching TO "No Areas" mode:
// 1. showSpecialZones becomes false
// 2. Resizers disappear immediately
// 3. Zone sizes remain in memory
// 4. Midpoint constraints use default zone sizes (1,1)

// When switching FROM "No Areas" mode:
// 1. showSpecialZones becomes true
// 2. Resizers reappear at last positions
// 3. Zone sizes restore from memory
// 4. Midpoint constraints use actual zone sizes
```

## Performance Considerations
- Efficient size calculations
- Smooth transitions for show/hide
- Proper event cleanup
- **NEW v3.0**: No unnecessary rendering when hidden

## Testing Scenarios (v3.0)

### Critical Test Cases
1. **Areas Mode Switching**: 
   - Switch between "No Areas" ↔ "Main Areas" ↔ "All Areas"
   - Verify resizers show/hide correctly
   
2. **Midpoint Movement**: 
   - Move resizers to custom positions
   - Switch to "No Areas"
   - Verify midpoint can move freely
   - Switch back to areas mode
   - Verify resizers restore positions

3. **Small Scale Grids**:
   - Test with 3x5 scale
   - Verify resizers hidden when useless
   - Verify constraints still maintain 4 quadrants

## Related Components
- [MidpointHandle](./MidpointHandle.md) - Coordinates with resizer constraints
- [ChartControls](./ChartControls.md) - Controls areas display mode
- [SpecialZoneRenderer](./SpecialZones.md) - Renders visual zones

## Changelog

### Version 3.0 (Current)
- **BREAKING**: Added areas visibility dependency to `isAdjustable`
- **NEW**: Resizers automatically hidden in "No Areas" mode
- **NEW**: Improved UX with intelligent visibility control
- **FIXED**: Midpoint movement no longer blocked by invisible resizers

### Version 2.0
- Added half-grid support
- Improved constraint calculations
- Enhanced drag behavior

### Version 1.0
- Initial implementation
- Basic resize functionality

## Migration Guide

### Updating from v2.0 to v3.0
```typescript
// OLD (v2.0)
<ResizeHandle
  isAdjustable={isAdjustableMidpoint}
/>

// NEW (v3.0)
<ResizeHandle
  isAdjustable={isAdjustableMidpoint && showSpecialZones}
/>
```

## Notes
- Always enforce size limits
- Handle cleanup on unmount
- Consider midpoint position for limits
- Maintain grid alignment
- **NEW v3.0**: Consider areas visibility for user experience

---

*Document Version: 3.0*  
*Last Updated: January 2025*  
*Status: Production Ready ✅*  
*Major Update: Areas-aware visibility control ✅*