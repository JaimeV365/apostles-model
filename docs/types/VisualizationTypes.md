# Visualization Types Documentation

## Overview
Defines the types and interfaces specific to the visualization components in the Apostles Model.

## Grid Types

### GridDimensions
```typescript
interface GridDimensions {
  /** Cell width percentage */
  cellWidth: number;
  
  /** Cell height percentage */
  cellHeight: number;
  
  /** Total columns */
  totalCols: number;
  
  /** Total rows */
  totalRows: number;
  
  /** Midpoint column */
  midpointCol: number;
  
  /** Midpoint row */
  midpointRow: number;
  
  /** Near-apostles availability */
  hasNearApostles: boolean;
}
```

### GridConfig
```typescript
interface GridConfig {
  /** Scale formats */
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  
  /** Midpoint position */
  midpoint: Midpoint;
  
  /** Zone sizes */
  apostlesZoneSize: number;
  terroristsZoneSize: number;
}
```

## Zone Types

### QuadrantCell
```typescript
interface QuadrantCell {
  /** Position and size */
  left: string;
  bottom: string;
  width: string;
  height: string;
}

interface SpecialCell extends QuadrantCell {
  size: number;
}
```

### QuadrantLayout
```typescript
interface QuadrantLayout {
  /** Special zones */
  apostles: SpecialCell;
  terrorists: SpecialCell;
  nearApostles: Array<SpecialCell> | null;
  
  /** Main quadrants */
  quadrants: {
    loyalists: QuadrantCell;
    mercenaries: QuadrantCell;
    hostages: QuadrantCell;
    defectors: QuadrantCell;
  };
}
```

## Data Point Types

### EnhancedDataPoint
```typescript
interface EnhancedDataPoint extends DataPoint {
  /** Point frequency */
  frequency: number;
  
  /** Assigned quadrant */
  quadrant: string;
  
  /** Normalized position */
  normalizedSatisfaction: number;
  normalizedLoyalty: number;
}
```

### FrequencyStats
```typescript
interface FrequencyStats {
  /** Maximum frequency */
  maxFrequency: number;
  
  /** Overlap indicator */
  hasOverlaps: boolean;
  
  /** Frequency mapping */
  frequencyMap: Map<string, number>;
}
```

## Style Types

### ZoneStyles
```typescript
interface ZoneStyles {
  /** Base styles */
  position: 'absolute';
  inset?: string;
  zIndex: number;
  
  /** Zone-specific */
  backgroundColor: string;
  border: string;
  borderRadius: string;
  
  /** Transitions */
  transition: string;
}
```

### PointStyles
```typescript
interface PointStyles {
  /** Position */
  left: string;
  bottom: string;
  
  /** Dimensions */
  width: string;
  height: string;
  
  /** Visual */
  backgroundColor: string;
  border: string;
  borderRadius: string;
  boxShadow: string;
  
  /** Interaction */
  cursor: string;
  zIndex: number;
  pointerEvents: string;
}
```

## Usage Examples

### Grid Configuration
```typescript
const grid: GridConfig = {
  satisfactionScale: '1-5',
  loyaltyScale: '1-7',
  midpoint: { sat: 3, loy: 4 },
  apostlesZoneSize: 1,
  terroristsZoneSize: 1
};
```

### Layout Calculation
```typescript
const layout: QuadrantLayout = {
  apostles: {
    left: '75%',
    bottom: '75%',
    width: '25%',
    height: '25%',
    size: 1
  },
  // ... other zones
};
```

## Type Guards

### Zone Validation
```typescript
function isSpecialCell(cell: QuadrantCell): cell is SpecialCell {
  return 'size' in cell;
}
```

### Point Validation
```typescript
function isEnhancedDataPoint(
  point: DataPoint
): point is EnhancedDataPoint {
  return (
    'frequency' in point &&
    'quadrant' in point &&
    'normalizedSatisfaction' in point &&
    'normalizedLoyalty' in point
  );
}
```

## Type Relationships
- GridConfig -> GridDimensions
- QuadrantCell -> SpecialCell
- DataPoint -> EnhancedDataPoint

## Usage Guidelines

### Grid Management
- Dimension calculation
- Position normalization
- Zone constraints
- Layout updates

### Point Handling
- Position calculation
- Frequency tracking
- Style generation
- Interaction states

### Zone Management
- Size constraints
- Position updates
- Style generation
- Transition handling

## Notes
- Coordinate systems
- Scale transitions
- Style inheritance
- Layout constraints