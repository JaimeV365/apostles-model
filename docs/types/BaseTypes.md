# Base Types Documentation

## Overview
The base types define the core data structures used throughout the Apostles Model application.

## Core Types

### DataPoint
```typescript
interface DataPoint {
  /** Unique identifier */
  id: string;
  
  /** User name or email */
  name: string;
  
  /** Satisfaction score */
  satisfaction: number;
  
  /** Loyalty score */
  loyalty: number;
  
  /** Group assignment */
  group: string;
  
  /** Exclusion flag */
  excluded?: boolean;
}
```

### Scale Types
```typescript
/** Available scale formats */
type ScaleFormat = '1-5' | '1-7' | '1-10';

/** Scale categories */
type ScaleType = 'satisfaction' | 'loyalty';

/** Scale state management */
interface ScaleState {
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  isLocked: boolean;
}
```

### Position Types
```typescript
interface Position {
  x: number;
  y: number;
}

interface NormalizedPosition {
  normalizedX: number;
  normalizedY: number;
}
```

### Zone Types
```typescript
interface ZoneSizes {
  apostles: number;
  terrorists: number;
}

interface ZonePosition {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  width: string;
  height: string;
}
```

## Usage Examples

### Data Point Creation
```typescript
const newDataPoint: DataPoint = {
  id: 'ID-0001',
  name: 'John Doe',
  satisfaction: 4,
  loyalty: 5,
  group: 'loyalists'
};
```

### Scale Management
```typescript
const scaleState: ScaleState = {
  satisfactionScale: '1-5',
  loyaltyScale: '1-7',
  isLocked: false
};
```

## Type Guards

### Scale Format Validation
```typescript
function isValidScaleFormat(scale: string): scale is ScaleFormat {
  return ['1-5', '1-7', '1-10'].includes(scale);
}
```

### Data Point Validation
```typescript
function isValidDataPoint(data: unknown): data is DataPoint {
  if (typeof data !== 'object' || data === null) return false;
  
  const point = data as DataPoint;
  return (
    typeof point.id === 'string' &&
    typeof point.name === 'string' &&
    typeof point.satisfaction === 'number' &&
    typeof point.loyalty === 'number' &&
    typeof point.group === 'string'
  );
}
```

## Type Relationships
- DataPoint -> ScaleFormat (validation)
- ScaleState -> ScaleFormat (composition)
- ZonePosition -> Position (transformation)

## Usage Guidelines

### Data Point Management
- Always validate IDs
- Check scale ranges
- Handle exclusions
- Validate groups

### Scale Handling
- Check lock status
- Validate transitions
- Handle conversions
- Maintain consistency

### Position Calculations
- Normalize coordinates
- Handle boundaries
- Validate ranges
- Transform coordinates

## Notes
- Type immutability
- Optional properties
- Validation rules
- Scale constraints