# Apostles Model Visualization Refactoring Plan

## Project Overview

**Primary Issue:** Inconsistent classification of data points between visual rendering and InfoBox display, particularly when resizing zones or activating near-apostles features.

**Approach:** Targeted refactoring with centralized classification logic rather than complete rebuild.

**Timeline:** 3-day implementation plan with clearly defined milestones and validation steps.

## Risk Assessment

| Risk Level | Probability | Impact | Mitigation Strategy |
|------------|------------|--------|-------------------|
| Complete Failure | ~5% | High | Feature flags, branch-based development |
| Partial Issues | ~15% | Medium | Incremental implementation, thorough testing |
| Persisting Issues | ~20% | Medium | Clear documentation of edge cases, comprehensive test suite |
| Success | ~60% | Positive | Controlled rollout, validation at each step |

## Core Principles

1. **Single Source of Truth** for all classification logic
2. **No Duplication** of classification calculations
3. **Deterministic Behavior** across all components
4. **Clear Documentation** of all edge cases
5. **Comprehensive Testing** of all classification scenarios

## Detailed Implementation Plan

### Day 1: Classification Service Development

#### 1. Create Classification Service Module
**File:** `src/components/visualization/utils/ClassificationService.ts`

```typescript
// Core interfaces
export interface ClassificationContext {
  gridDimensions: GridDimensions;
  midpoint: Midpoint;
  apostlesZoneSize: number;
  terroristsZoneSize: number;
  isClassicModel: boolean;
  showNearApostles: boolean;
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
}

export type QuadrantType = 'loyalists' | 'mercenaries' | 'hostages' | 'defectors' | 
                          'apostles' | 'terrorists' | 'near_apostles' | 'near_terrorists';

// Main classification function
export function classifyDataPoint(
  point: DataPoint, 
  context: ClassificationContext
): QuadrantType {
  // Will contain comprehensive classification logic
}

// Helper functions
export function isInApostlesZone(point: DataPoint, context: ClassificationContext): boolean {}
export function isInTerroristsZone(point: DataPoint, context: ClassificationContext): boolean {}
export function isInNearApostlesZone(point: DataPoint, context: ClassificationContext): boolean {}
export function calculateNormalizedPosition(point: DataPoint, scales: ScaleContext): NormalizedPosition {}
// etc.
```

#### 2. Create Test File
**File:** `src/components/visualization/utils/__tests__/ClassificationService.test.ts`

Tests will cover:
- Standard quadrant classification
- Special zone classification (apostles/terrorists)
- Near zone classification
- Edge cases (boundary points)
- Different scale combinations
- Various zone sizes
- Half-grid positions

#### 3. Create Validation Utility
**File:** `src/components/visualization/utils/ClassificationValidator.ts`

Will compare:
- New vs. existing classification for the same inputs
- Document inconsistencies found
- Provide debugging information

### Day 2: Integration with InfoBox Component

#### 1. Modify QuadrantAssignmentContext
**File:** `src/components/visualization/context/QuadrantAssignmentContext.tsx`

Update to:
- Use ClassificationService internally 
- Maintain the same API for backwards compatibility
- Log detailed information about classification changes

#### 2. Update InfoBox Component
**File:** `src/components/visualization/components/DataPoints/DataPointInfoBox.tsx`

Modify to:
- Receive pre-classified data
- Remove any internal classification logic
- Ensure consistent display of quadrant information

#### 3. Create Feature Flag System
**File:** `src/components/visualization/context/FeatureFlags.ts`

Implement:
- Toggle between old and new classification logic
- Easily revert to original behavior if needed
- Debugging capability to log classification differences

### Day 3: Complete Integration and Testing

#### 1. Update DataPointRenderer
**File:** `src/components/visualization/components/DataPoints/DataPointRenderer.tsx`

Modify to:
- Use ClassificationService consistently
- Ensure visual display matches classification logic
- Remove duplicate calculations

#### 2. Comprehensive Testing
Test all combinations of:
- Different scales (1-5, 1-7, 1-10)
- Special zone sizes
- Near-apostles enabled/disabled
- Classic/modern terminology
- Midpoint positions (including half-grid)

#### 3. Document Final Solution
- Create technical documentation of the classification rules
- Document any edge cases and how they're handled
- Update component documentation

## Classification Logic Specification

### Standard Quadrants
- **Loyalists:** Satisfaction ≥ midpoint.sat AND Loyalty ≥ midpoint.loy
- **Mercenaries:** Satisfaction ≥ midpoint.sat AND Loyalty < midpoint.loy
- **Hostages:** Satisfaction < midpoint.sat AND Loyalty ≥ midpoint.loy
- **Defectors:** Satisfaction < midpoint.sat AND Loyalty < midpoint.loy

### Special Zones
- **Apostles Zone:** Satisfaction ≥ (maxSat - apostlesZoneSize) AND Loyalty ≥ (maxLoy - apostlesZoneSize)
- **Terrorists Zone:** Satisfaction ≤ terroristsZoneSize AND Loyalty ≤ terroristsZoneSize

### Near Zones
- **Near-Apostles:** Adjacent to Apostles zone but not in Apostles zone
- **Near-Terrorists:** Adjacent to Terrorists zone but not in Terrorists zone

### Edge Cases
- Points exactly on midpoint boundaries
- Half-grid midpoint positions
- Multiple zone membership resolution (priority: special zones > near zones > standard quadrants)

## Success Criteria

1. InfoBox consistently displays correct classification in all scenarios
2. Visual appearance matches classification logic
3. All user interactions (resizing, toggling) maintain consistent classification
4. Performance remains acceptable during interactions
5. No regression in other visualization features

## Rollback Plan

If issues arise:
1. Toggle feature flag to revert to original classification logic
2. Document specific scenarios that failed
3. Address issues in the classification service
4. Re-test before re-enabling

## Future Enhancement Opportunities

After successful implementation, consider:
1. Performance optimization using memoization
2. Enhanced visual feedback for classification changes
3. Improved documentation in the UI about classification rules
4. Additional test coverage for edge cases
