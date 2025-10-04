# Frequency Calculator Utility

## Overview
The frequencyCalculator utility manages point frequency calculations, clustering, and filtering for overlapping data points in the visualization.

## Core Functions

### calculatePointFrequencies
```typescript
function calculatePointFrequencies(data: DataPoint[]): FrequencyStats;
```
Calculates frequency statistics for data points.

### calculateDotSize
```typescript
function calculateDotSize(
  frequency: number,
  maxFrequency: number,
  config: SizeConfig = SIZE_CONFIG
): number;
```
Determines dot size based on frequency.

### shouldDisplayPoint
```typescript
function shouldDisplayPoint(
  frequency: number,
  threshold: number,
  filterEnabled: boolean
): boolean;
```
Determines point visibility based on frequency.

## Usage Example
```typescript
// Calculate frequencies
const stats = calculatePointFrequencies(dataPoints);

// Calculate dot size
const size = calculateDotSize(frequency, maxFrequency);

// Check visibility
const isVisible = shouldDisplayPoint(frequency, threshold, true);
```

## Configuration
```typescript
interface SizeConfig {
  MIN_SIZE: number;
  MAX_SIZE: number;
  SCALE_FACTOR: number;
}
```

## Performance Notes
- Cache frequencies
- Optimize calculations
- Batch updates