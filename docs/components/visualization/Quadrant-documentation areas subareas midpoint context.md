# Apostles Model Quadrant Classification System Documentation

**Created: May 07, 2025**

## Overview

This document outlines the quadrant classification system used in the Apostles Model, focusing on the Context API implementation, data point processing, and integration with reporting components. This updated documentation reflects the most recent changes to the system architecture, particularly the centralized classification approach through the `QuadrantAssignmentContext`.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Classification Logic](#classification-logic)
3. [Data Flow](#data-flow)
4. [Integrating with Reports](#integrating-with-reports)
5. [Technical Reference](#technical-reference)
6. [Common Issues and Solutions](#common-issues-and-solutions)

## System Architecture

The Apostles Model quadrant classification system consists of several interconnected components:

### Core Components

1. **QuadrantAssignmentContext** - Central classification system that determines which quadrant each data point belongs to, tracking both standard quadrants and special zones.

2. **DataPointRenderer** - Handles the visualization of data points, using classifications from the context to determine colors and positioning.

3. **Reporting Components** - Various components that display statistics and analyses based on the distribution of points across quadrants.

### Design Philosophy

The system follows these key principles:

- **Centralized Classification** - All quadrant classification logic is centralized in the `QuadrantAssignmentContext`, ensuring consistency throughout the application.

- **Detailed + Simplified Views** - The system maintains detailed classifications (including special zones like apostles/terrorists) internally, but provides simplified views (just 4 main quadrants) when appropriate for reporting.

- **Scale-Aware Calculations** - All calculations adapt to different satisfaction and loyalty scales (1-5, 1-7, 1-10, etc.).

## Classification Logic

### Quadrant Types

The system recognizes these quadrant types:

- **Main Quadrants**:
  - `loyalists` - High satisfaction, high loyalty
  - `mercenaries` - High satisfaction, low loyalty
  - `hostages` - Low satisfaction, high loyalty
  - `defectors` - Low satisfaction, low loyalty

- **Special Zones**:
  - `apostles` - Maximum satisfaction and maximum loyalty
  - `terrorists` - Minimum satisfaction and minimum loyalty
  - `near_apostles` - Near-maximum satisfaction and loyalty
  - `near_terrorists` - Near-minimum satisfaction and loyalty

### Classification Rules

The classification follows this hierarchy:

1. **Special Cases First**: Check for apostles (max values) and terrorists (min values)
2. **Near-Special Zones**: Check for near_apostles and near_terrorists if enabled
3. **Standard Quadrants**: Classify based on midpoint comparison

The specific implementation in `QuadrantAssignmentContext.tsx`:

```typescript
const getQuadrantForPoint = (point: DataPoint): QuadrantType => {
  // Check for manual assignments first
  if (manualAssignments.has(point.id)) {
    return manualAssignments.get(point.id)!;
  }
  
  const { satisfaction: sat, loyalty: loy } = point;
  
  // Special cases: apostles and terrorists
  if (sat === maxSat && loy === maxLoy) {
    return 'apostles';
  }
  
  if (sat === 1 && loy === 1) {
    return 'terrorists';
  }
  
  // Near special zones if enabled
  if (sat >= maxSat - 1 && sat < maxSat && 
      loy >= maxLoy - 1 && loy < maxLoy) {
    return 'near_apostles';
  }
  
  if (sat <= 1 + 1 && sat > 1 && 
      loy <= 1 + 1 && loy > 1) {
    return 'near_terrorists';
  }
  
  // Standard quadrants
  if (sat >= midpoint.sat && loy >= midpoint.loy) {
    return 'loyalists';
  } else if (sat >= midpoint.sat && loy < midpoint.loy) {
    return 'mercenaries';
  } else if (sat < midpoint.sat && loy >= midpoint.loy) {
    return 'hostages';
  } else {
    return 'defectors';
  }
};
```

### Midpoint Calculation

The midpoint calculation is crucial for accurate quadrant determination:

```typescript
const calculatedInitialMidpoint = useMemo(() => {
  const minSat = parseInt(satisfactionScale.split('-')[0]);
  const maxSat = parseInt(satisfactionScale.split('-')[1]);
  const minLoy = parseInt(loyaltyScale.split('-')[0]);
  const maxLoy = parseInt(loyaltyScale.split('-')[1]);
  
  return {
    sat: minSat + (maxSat - minSat) / 2,
    loy: minLoy + (maxLoy - minLoy) / 2
  };
}, [satisfactionScale, loyaltyScale]);
```

This ensures that the midpoint is correctly calculated based on the scale range, not just the maximum values.

## Data Flow

### 1. Context Initialization

```typescript
<QuadrantAssignmentProvider
  data={data}
  satisfactionScale={satisfactionScale}
  loyaltyScale={loyaltyScale}
>
  {/* Child components */}
</QuadrantAssignmentProvider>
```

### 2. Quadrant Determination

When a component needs to know a data point's quadrant:

```typescript
const { getQuadrantForPoint } = useQuadrantAssignment();
const quadrant = getQuadrantForPoint(dataPoint);
```

### 3. Distribution Calculation

The context automatically calculates the distribution of points across all quadrants:

```typescript
const { distribution } = useQuadrantAssignment();
// distribution contains counts for all quadrant types
```

### 4. Visualization

The `DataPointRenderer` uses the quadrant information to determine colors:

```typescript
const getQuadrantInfo = useCallback((point: DataPoint): ExtendedQuadrantInfo => {
  // ...
  const quadrantType = getQuadrantForPoint(point);
  
  // Map quadrant type to colors
  switch (quadrantType) {
    case 'apostles':
      return { ...QUADRANTS.loyalists, ...baseInfo, group: 'Apostles' };
    case 'terrorists':
      return { ...QUADRANTS.defectors, ...baseInfo, group: 'Terrorists' };
    // ...other cases
  }
}, [...]);
```

## Integrating with Reports

### Distribution Reports

When showing distribution statistics, reports should combine special zones with their corresponding main quadrants:

```typescript
// Correct approach for Quadrant Distribution reports
const effectiveLoyalistsCount = 
  contextDistribution.loyalists + 
  contextDistribution.apostles + 
  contextDistribution.near_apostles;

const effectiveDefectorsCount = 
  contextDistribution.defectors + 
  contextDistribution.terrorists + 
  contextDistribution.near_terrorists;
```

### Implementation in DistributionSection.tsx

```typescript
<DraggableQuadrant 
  type="loyalists"
  index={1}
  value={effectiveDistribution.loyalists + 
         (effectiveDistribution.apostles || 0) + 
         (effectiveDistribution.near_apostles || 0)}
  total={Math.max(1, effectiveTotal)}
  isPremium={isPremium}
  moveQuadrant={onQuadrantMove}
  onClick={(e) => handleQuadrantClick('loyalists', effectiveDistribution.loyalists, e)}
/>
```

### Detailed Analytics

For more detailed analytics, you can still access the granular classifications:

```typescript
const apostlesCount = contextDistribution.apostles;
const nearApostlesCount = contextDistribution.near_apostles;
```

## Technical Reference

### Key Files

1. **QuadrantAssignmentContext.tsx** - Context provider for quadrant classification
2. **DataPointRenderer.tsx** - Visualization of data points
3. **DistributionSection.tsx** - Reporting component for quadrant distribution

### Important Interfaces

```typescript
// Quadrant Types
export type QuadrantType = 
  'loyalists' | 'mercenaries' | 'hostages' | 'defectors' | 
  'apostles' | 'terrorists' | 'near_apostles' | 'near_terrorists';

// Context Interface
interface QuadrantAssignmentContextType {
  midpoint: { sat: number; loy: number };
  setMidpoint: (newMidpoint: { sat: number; loy: number }) => void;
  manualAssignments: Map<string, QuadrantType>;
  updateManualAssignment: (pointId: string, quadrant: QuadrantType) => void;
  clearManualAssignment: (pointId: string) => void;
  getQuadrantForPoint: (point: DataPoint) => QuadrantType;
  distribution: Record<QuadrantType, number>;
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
}
```

## Common Issues and Solutions

### Issue: Data points not showing correct colors

**Solution**: Ensure the `getQuadrantInfo` function in `DataPointRenderer.tsx` has case handlers for all quadrant types, including special zones:

```typescript
switch (quadrantType) {
  case 'apostles':
    return { ...QUADRANTS.loyalists, ...baseInfo, group: 'Apostles' };
  case 'terrorists':
    return { ...QUADRANTS.defectors, ...baseInfo, group: 'Terrorists' };
  case 'near_apostles':
    return { ...QUADRANTS.loyalists, ...baseInfo, group: 'Near-Apostles' };
  case 'near_terrorists':
    return { ...QUADRANTS.defectors, ...baseInfo, group: 'Near-Terrorists' };
  // ... standard quadrants
}
```

### Issue: Incorrect counts in reports

**Solution**: Combine special zones with their corresponding main quadrants when calculating totals:

```typescript
// For loyalists total in reports
const loyalistsTotal = 
  distribution.loyalists + 
  distribution.apostles + 
  distribution.near_apostles;
```

### Issue: Midpoint calculation incorrect

**Solution**: Ensure midpoint is calculated based on scale range, not just maximum:

```typescript
const midpointSat = minSat + (maxSat - minSat) / 2;
const midpointLoy = minLoy + (maxLoy - minLoy) / 2;
```

---

## Conclusion

The Apostles Model quadrant classification system provides a robust and flexible way to categorize data points across different scales. By centralizing the classification logic in the `QuadrantAssignmentContext`, we ensure consistency throughout the application while maintaining the ability to show both detailed and simplified views based on the reporting needs.

For updates or questions about this documentation, please contact the development team.

Last updated: May 07, 2025
