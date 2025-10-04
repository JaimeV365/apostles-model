# Position Calculator Utility

## Overview
The positionCalculator utility handles all position-related calculations for the visualization, including grid positions, normalizations, and coordinate transformations.

## Core Functions

### normalizeToPercentage
```typescript
function normalizeToPercentage(value: number, scale: ScaleFormat): number;
```
Converts a scale value to a percentage position.

### calculateMidpointPosition
```typescript
function calculateMidpointPosition(
  midpoint: Midpoint,
  dimensions: GridDimensions
): Position;
```
Calculates the visual position of the midpoint.

### calculateZonePositions
```typescript
function calculateZonePositions(
  dimensions: GridDimensions,
  apostlesSize: number,
  terroristsSize: number
): ZonePositions;
```
Determines positions for special zones.

## Usage Example
```typescript
// Normalize a satisfaction score
const percentage = normalizeToPercentage(4, '1-5'); // Returns 75

// Calculate midpoint position
const position = calculateMidpointPosition(
  { sat: 3, loy: 3 },
  dimensions
);
```

## Edge Cases
- Boundary values
- Scale transitions
- Grid alignment
- Position constraints

## Performance Notes
- Memoize calculations
- Cache frequent operations
- Optimize for frequency