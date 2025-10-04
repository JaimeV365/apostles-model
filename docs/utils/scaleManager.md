# Scale Manager Utility

## Overview
The ScaleManager utility handles all scale-related operations, including validation, conversion, and state management for the visualization scales.

## Core Functions

### validateScales
```typescript
function validateScales(
  currentState: ScaleState,
  importedSatisfactionScale: ScaleFormat,
  importedLoyaltyScale: ScaleFormat
): ValidationResult;
```
Validates scale compatibility.

### getDefaultScales
```typescript
function getDefaultScales(): ScaleState;
```
Returns default scale configuration.

### validateDataPoint
```typescript
function validateDataPoint(
  currentState: ScaleState,
  satisfaction: number,
  loyalty: number
): ValidationResult;
```
Validates data point against current scales.

## Usage Example
```typescript
const scaleManager = ScaleManager.getInstance();

// Validate imported scales
const validation = scaleManager.validateScales(
  currentState,
  importedSatisfactionScale,
  importedLoyaltyScale
);

// Get default scales
const defaults = scaleManager.getDefaultScales();
```

## Scale States
- Locked state
- Transition handling
- Validation rules
- Default values

## Error Handling
- Scale mismatches
- Invalid values
- State conflicts
- Transition errors