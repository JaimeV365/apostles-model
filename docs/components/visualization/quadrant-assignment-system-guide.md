# Quadrant Assignment System - Complete Guide

## Overview

The Quadrant Assignment System is the core component that manages how data points are classified into quadrants in the Apostles Model visualization. It provides centralized management for:

- Quadrant classification based on satisfaction and loyalty scores
- Manual reassignment of boundary points
- Automatic validation of assignments
- Distribution statistics
- Terminology management (classic vs. modern)

## Architecture

### Core Components

1. **QuadrantAssignmentContext** - The main React context that provides:
   - State management for midpoint and manual assignments
   - Classification functions
   - Boundary detection logic
   - Distribution calculations
   - Validation system

2. **Dual Classification System**:
   - `getQuadrantForPoint` - Includes manual assignments (for display)
   - `getNaturalQuadrantForPoint` - Ignores manual assignments (for boundary detection)

## The Island Issue (Solved)

### Problem Description
When a point was exactly on the midpoint intersection and manually reassigned, then the midpoint was moved away, the point would become "stranded" in its manually assigned quadrant even when completely surrounded by a different zone. The validation system couldn't remove the invalid assignment.

### Root Cause
The boundary detection system was contaminated by manual assignments because:
1. Test points used to detect neighboring zones inherited the original point's ID
2. The wrong classification function was being called for boundary detection
3. This created circular logic where manual assignments affected their own validation

### Solution
1. **Unique IDs for all test points** - Prevents inheritance of manual assignments
2. **Consistent use of `getNaturalQuadrantForPoint`** - Ensures boundary detection uses natural classification
3. **Proper validation** - The system now correctly identifies and removes invalid assignments

## Key Functions

### getQuadrantForPoint
```typescript
const getQuadrantForPoint = useMemo(() => (point: DataPoint): QuadrantType => {
  // 1. Check manual assignments first
  if (manualAssignments.has(point.id)) {
    return manualAssignments.get(point.id)!;
  }
  
  // 2. Apply classification logic
  // Special zones, near zones, standard quadrants
  // Returns: QuadrantType
}, [dependencies]);
```

**Usage**: Display, reporting, export - anywhere the user should see their manual choices

### getNaturalQuadrantForPoint
```typescript
const getNaturalQuadrantForPoint = useCallback((point: DataPoint): QuadrantType => {
  // Identical classification logic to getQuadrantForPoint
  // BUT: Skips manual assignment check
  // Used for boundary detection to avoid contamination
}, [dependencies]);
```

**Usage**: Boundary detection only - determines actual zone positioning

### getBoundaryOptions
Determines if a point is on a boundary and what reassignment options are available.

**Special Cases**:
1. **Midpoint Intersection** - Point exactly on midpoint shows all 4 quadrant options
2. **Zone Boundaries** - Points on lines between zones show adjacent options
3. **Special Zone Edges** - Complex logic for apostles/terrorists boundaries

**Key Implementation Detail**: All test points must have unique IDs:
```typescript
const testPoint: DataPoint = {
  ...point,
  id: `test_${Math.random()}`, // Critical: Unique ID
  satisfaction: point.satisfaction + offset.dx,
  loyalty: point.loyalty + offset.dy
};
```

### validateManualAssignments
Automatically runs when dependencies change to clean up invalid manual assignments.

**Process**:
1. For each manually assigned point
2. Get current boundary options
3. Check if assigned zone is still valid
4. Remove if invalid, keep if valid

## Manual Assignment Flow

1. **User clicks boundary point** → InfoBox shows reassignment options
2. **User selects new quadrant** → `updateManualAssignment` called
3. **Assignment stored in Map** → Keyed by point ID
4. **Display updates** → `getQuadrantForPoint` returns manual assignment
5. **Validation runs** → On midpoint/zone changes
6. **Invalid assignments removed** → Automatic cleanup

## Boundary Detection Logic

### Standard Quadrants
Tests 8 directions (cardinal + diagonal) around the point:
- Right (0.1, 0)
- Left (-0.1, 0)
- Up (0, 0.1)
- Down (0, -0.1)
- Diagonals

### Near Zones (Near-Apostles, Near-Terrorists)
Special handling for inner and outer edges:
- **Inner edges** - Toward special zones
- **Outer edges** - Toward standard quadrants
- Different test directions based on position

### Edge Cases
- Grid boundaries (max satisfaction/loyalty)
- Special zone corners
- Midpoint intersection

## Display Terminology

The system supports two terminology modes:

### Classic Model
- Loyalists → Apostles
- Mercenaries → Mercenaries
- Hostages → Hostages
- Defectors → Terrorists

### Modern Model
- Loyalists → Advocates
- Mercenaries → Mercenaries
- Hostages → Hostages
- Defectors → Defectors

Special zones use consistent naming in both modes.

## Best Practices

### For Developers

1. **Always use `getQuadrantForPoint` for display** - Respects user choices
2. **Use `getNaturalQuadrantForPoint` only for boundary detection** - Avoids contamination
3. **Ensure all test points have unique IDs** - Prevents assignment inheritance
4. **Trust the validation system** - It automatically cleans invalid assignments

### For Performance

1. **Memoization** - Key functions are memoized with proper dependencies
2. **Throttled logging** - Prevents console spam
3. **Efficient Maps** - O(1) lookup for manual assignments
4. **Minimal re-renders** - Context updates only when necessary

## Integration Points

### Components Using the Context

1. **DataPointRenderer** - Displays points with correct colors/assignments
2. **DataPointInfoBox** - Shows reassignment UI for boundary points
3. **DistributionSection** - Reports statistics
4. **Export functionality** - Includes manual assignments in exports

### Required Props for Provider

```typescript
<QuadrantAssignmentProvider
  data={data}
  isClassicModel={isClassicModel}
  satisfactionScale={satisfactionScale}
  loyaltyScale={loyaltyScale}
  initialMidpoint={midpoint}
  apostlesZoneSize={apostlesZoneSize}
  terroristsZoneSize={terroristsZoneSize}
  showSpecialZones={showSpecialZones}
  showNearApostles={showNearApostles}
>
```

## Debugging Tips

### Console Logs
The system includes strategic logging:
- `🔍` - General flow and debugging
- `🔧` - Manual assignment operations
- `🎯` - Midpoint intersection handling
- `✅/❌` - Validation results

### Common Issues

**Points not showing reassignment options**
- Check if truly on boundary (within 0.1 tolerance)
- Verify special zones are enabled if needed
- Ensure boundary detection is using natural classification

**Manual assignments disappearing unexpectedly**
- This is likely correct behavior - validation removing invalid assignments
- Check the validation logs to understand why

**Performance issues**
- Check for excessive re-renders
- Verify memoization dependencies
- Consider throttling updates

## Version History

### Latest Update (The Island Fix)
- Fixed test point ID inheritance issue
- Standardized use of `getNaturalQuadrantForPoint` for boundary detection
- Comprehensive fix across all test point creation locations
- Resolved the "island issue" where points could get stranded

This system now provides reliable, predictable quadrant assignment with proper boundary detection and validation.