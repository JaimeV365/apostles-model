# GridSystem Documentation

## Overview
The GridSystem refers to the collection of components that manage the visualization's underlying grid structure, scale markers, and axis labels. While a unified `GridSystem.tsx` component exists, the current implementation uses separate specialized components for different aspects of the grid system.

## Current Architecture

### Actual Rendering Chain
The grid system is implemented through multiple specialized components:

```typescript
{/* Grid Lines */}
<GridRenderer 
  dimensions={dimensions} 
  showGrid={showGrid} 
/>

{/* Scale Numbers */}
{showScaleNumbers && (
  <ScaleMarkers
    satisfactionScale={satisfactionScale}
    loyaltyScale={loyaltyScale}
    showScaleNumbers={showScaleNumbers}
  />
)}

{/* Axis Legends */}
{showLegends && (
  <AxisLegends
    satisfactionScale={satisfactionScale}
    loyaltyScale={loyaltyScale}
    showLegends={showLegends}
    showScaleNumbers={showScaleNumbers}
  />
)}
```

### Component Responsibilities

#### GridRenderer.tsx 🔧
- Renders grid lines only
- Calculates line positions using `calculateGridLines` from `gridCalculator.ts`
- Positions lines at cell boundaries between data points

#### ScaleMarkers.tsx 🔢
- Renders scale numbers at grid intersections
- Uses `calculateScaleMarkers` from `positionNormalizer.ts`
- Positions numbers exactly where data points appear
- Handles coordinate system alignment for both axes

#### AxisLegends.tsx 📝
- Renders axis labels ("Satisfaction", "Loyalty") with scale ranges
- Positions labels outside the grid area
- Manages spacing when scale numbers are also visible

#### GridSystem.tsx 💤
- Unified component that exists but is not currently used
- Contains alternative implementation of all grid functionality
- Could potentially replace the current multi-component approach

## Features
- Fixed-size grid layout
- Scale marker display at data point intersections
- Axis labeling with scale ranges
- Half-grid support for midpoints
- Scale number display
- Legend management
- Stable positioning
- Multi-scale support (1-5, 1-7, 1-10, etc.)

## Container Management

### Fixed Grid Size
- Grid maintains constant size regardless of container adjustments
- Only padding adjusts for scale numbers and legends
- Cell sizes remain consistent for accurate data point positioning

### Coordinate System
- **Grid lines**: Mark boundaries between cells
- **Scale numbers**: Positioned at grid intersections (data point locations)
- **Data points**: Positioned at exact intersections using same coordinate system
- **Container**: Uses `inset: '-24px'` with left/right compensation for proper alignment

### Scale Number Positioning
The recent fix for satisfaction scale alignment involved correcting the container positioning:

```typescript
// FIXED: Proper container compensation
<div className="scale-x" style={{
  position: 'absolute',
  bottom: 0,
  left: '24px',
  right: '24px'  // ← Added to match left compensation
}}>
```

This ensures scale numbers align perfectly with grid intersections where data points appear.

## Padding System
```css
/* Base container size */
padding: 20px 40px 20px 20px;

/* When scale numbers are shown */
padding-left: 40px;
padding-bottom: 40px;

/* When legends are shown */
padding-left: 60px;
padding-bottom: 60px;

/* When both are shown */
padding-left: 80px;
padding-bottom: 80px;
```

### Grid Area
- Fixed positioning within container
- Consistent right-side gap (40px)
- Top and left edges maintain stable spacing (20px)

## Scale and Legend Management
- Scale numbers positioned at grid intersections (not cell centers)
- Scale numbers mark exact positions where data points appear
- Legends positioned outside scale numbers when both visible
- Non-overlapping placement with automatic spacing
- Maintains readability regardless of visibility combinations

### Scale Number Calculation
Uses `calculateScaleMarkers` from `positionNormalizer.ts`:
```typescript
export function calculateScaleMarkers(
  scale: ScaleFormat,
  isHorizontal: boolean = true
): Array<{ position: string; value: number }> {
  const maxValue = parseInt(scale.split('-')[1]);
  
  return Array.from({ length: maxValue }, (_, i) => {
    const value = i + 1;
    const position = normalizeToPercentage(value, scale);
    
    return {
      position: `${isHorizontal ? position : 100 - position}%`,
      value: isHorizontal ? value : maxValue - i
    };
  });
}
```

## Component Export Mapping

Note the potentially confusing export structure:
```typescript
// From grid/index.ts
export { default as GridSystem } from './GridRenderer';  // ← Misleading name
export { default as GridRenderer } from './GridRenderer'; // ← Actual component  
export { default as ScaleMarkers } from './ScaleMarkers'; // ← Scale numbers
export { default as AxisLegends } from './AxisLegends';   // ← Axis labels
```

The `GridSystem` export actually points to `GridRenderer`, while the actual `GridSystem.tsx` file is not part of the current rendering chain.

## Key Layout Principles
- Grid maintains fixed size for stability
- Only container padding adjusts for UI elements
- Consistent right-side spacing (40px)
- Automatic padding management for scale/legend visibility
- Non-overlapping element placement

## Element Positioning
- Grid lines align with cell boundaries
- Data points position exactly on intersections
- Scale numbers positioned at same intersections as data points
- Quadrant backgrounds match grid cells
- Scale numbers and legends have dedicated spaces outside grid area

## Scale Independence
The grid system works with any satisfaction/loyalty scale combination:
- 1-5, 1-7, 1-10 scales supported
- Dynamic cell sizing based on scale
- Consistent positioning regardless of scale size
- Half-grid positions supported for midpoints

## Future Considerations
- The unified `GridSystem.tsx` component could potentially replace the current multi-component approach
- Consider consolidating duplicate `calculateScaleMarkers` functions from `positionNormalizer.ts` and `positionCalculator.ts`
- Evaluate whether the current specialized component approach or unified approach is more maintainable

## Technical Notes
- Scale numbers appear at grid intersections, not cell centers
- This matches exactly where data points are positioned
- Container positioning compensation ensures perfect alignment
- Coordinate system consistency across all grid components is critical for proper alignment