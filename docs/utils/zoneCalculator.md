# Zone Calculator Utility

## Overview
The zoneCalculator utility manages zone size calculations, constraints, and position adjustments for special zones in the visualization.

## Core Functions

### calculateAvailableSpace
```typescript
function calculateAvailableSpace(
  position: Position,
  dimensions: GridDimensions
): AvailableSpace;
```
Calculates maximum available space for zones.

### calculateZoneResize
```typescript
function calculateZoneResize(
  zone: 'apostles' | 'terrorists',
  currentSize: number,
  delta: { x: number; y: number },
  dimensions: GridDimensions
): number;
```
Handles zone resize calculations.

### calculateNearApostlesPositions
```typescript
function calculateNearApostlesPositions(
  showNearApostles: boolean,
  apostlesSize: number,
  dimensions: GridDimensions
): Array<Position>;
```
Determines positions for near-apostles zones.

## Usage Example
```typescript
// Calculate available space
const space = calculateAvailableSpace(currentPosition, gridDimensions);

// Calculate new zone size
const newSize = calculateZoneResize('apostles', currentSize, delta, dimensions);
```

## Constraints
- Minimum sizes
- Maximum sizes
- Grid alignment
- Overlap prevention

## Performance Notes
- Cache calculations
- Optimize transitions
- Batch updates