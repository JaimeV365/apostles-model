# Historical Analysis Feature Specification

[Previous sections remain unchanged until Significance Testing...]

## Significance Testing

### Threshold-Based Approach
- User-configurable thresholds for significant changes
- Default thresholds based on scale (e.g., 1-point change on 5-point scale)
- Visual indicators for changes exceeding thresholds
- Contextual guidance in Actions Report

### Implementation
```typescript
interface ThresholdConfig {
  satisfaction: number;
  loyalty: number;
  customThresholds?: {
    [key: string]: number;
  };
}

interface Change {
  magnitude: number;
  isSignificant: boolean;
  direction: 'increase' | 'decrease';
  context?: string;
}
```

### Visualization
- Arrow thickness proportional to change magnitude
- Color intensity based on threshold exceedance
- Tooltip explanations for significant changes
- Timeline highlights for significant periods

[Rest of document remains unchanged...]