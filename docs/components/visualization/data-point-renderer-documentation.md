# DataPointRenderer Component

## Overview
The DataPointRenderer component handles the visualization and interaction of data points within the Apostles Model chart. It manages point positioning, frequency-based sizing, quadrant assignment, and interactive features including selection and group reassignment.

## Features
- Dynamic point positioning
- Frequency-based sizing
- Quadrant assignment
- Boundary point handling
- Multi-point clustering
- Interactive selection
- Group reassignment
- Tooltip display

## Interface

### Props
```typescript
interface DataPointRendererProps {
  /** Array of data points to render */
  data: DataPoint[];
  
  /** Grid dimensions */
  dimensions: GridDimensions;
  
  /** Current position of midpoint */
  position: Position;
  
  /** Frequency filtering state */
  frequencyFilterEnabled: boolean;
  frequencyThreshold: number;
  
  /** Scale formats */
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  
  /** Selection handlers */
  onPointSelect?: (point: EnhancedDataPoint) => void;
  selectedPointId?: string;
}

interface EnhancedDataPoint extends DataPoint {
  frequency: number;
  quadrant: string;
  normalizedSatisfaction: number;
  normalizedLoyalty: number;
  duplicates?: Array<{ id: string; name: string; }>;
}
```

## Implementation Details

### Point Positioning
```typescript
const calculatePointPosition = (point: DataPoint): Position => {
  const normalized = normalizeDataPointPosition(
    point.satisfaction,
    point.loyalty,
    dimensions
  );
  
  return {
    x: normalized.x,
    y: normalized.y
  };
};
```

### Quadrant Assignment
```typescript
const getQuadrantInfo = (x: number, y: number): QuadrantInfo => {
  const satValue = normalize(x, dimensions);
  const loyValue = normalize(y, dimensions);
  
  if (satValue >= position.x && loyValue >= position.y) {
    return QUADRANTS.loyalists;
  }
  // Other quadrant assignments...
};
```

### Frequency Calculation
```typescript
const calculatePointGroups = () => {
  const groups = new Map<string, DataPoint[]>();
  
  data.forEach(point => {
    const key = `${point.satisfaction}-${point.loyalty}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)?.push(point);
  });
  
  return groups;
};
```

## Point Visualization

### Size Calculation
```typescript
const calculateDotSize = (frequency: number): number => {
  const baseSize = 12;
  const maxSize = 60;
  const growthFactor = 3;
  
  return Math.min(
    baseSize + (frequency - 1) * growthFactor,
    maxSize
  );
};
```

### Style Generation
```typescript
const getPointStyle = (point: DataPoint, position: Position): React.CSSProperties => ({
  position: 'absolute',
  left: `${position.x}%`,
  bottom: `${position.y}%`,
  width: `${size}px`,
  height: `${size}px`,
  backgroundColor: quadrantInfo.color,
  transform: 'translate(-50%, 50%)',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  borderRadius: '50%',
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  zIndex: isSelected ? 45 : count > 1 ? 42 : 40
});
```

## Interaction Handling

### Selection Management
```typescript
const handlePointClick = (point: DataPoint) => {
  if (onPointSelect) {
    onPointSelect({
      ...point,
      frequency: count,
      quadrant: quadrantInfo.group,
      normalizedSatisfaction: position.x,
      normalizedLoyalty: position.y,
      duplicates: getDuplicates(point)
    });
  }
};
```

### Group Reassignment
```typescript
const handleGroupChange = (pointId: string, newGroup: QuadrantInfo) => {
  setManualGroups(new Map(manualGroups.set(pointId, newGroup)));
};
```

## State Management

### Group Management
```typescript
const [manualGroups, setManualGroups] = useState<Map<string, QuadrantInfo>>(
  new Map()
);

useEffect(() => {
  // Clean up invalid manual assignments
  const newGroups = new Map(manualGroups);
  let hasChanges = false;

  data.forEach(point => {
    if (manualGroups.has(point.id)) {
      const isIntersection = isOnGridIntersection(point);
      if (!isIntersection) {
        newGroups.delete(point.id);
        hasChanges = true;
      }
    }
  });

  if (hasChanges) {
    setManualGroups(newGroups);
  }
}, [position, data, dimensions]);
```

## Performance Optimization

### Memoization
```typescript
const pointGroups = useMemo(() => 
  calculatePointGroups(),
  [data]
);

const quadrantInfo = useMemo(() => 
  getQuadrantInfo(normalized.x, normalized.y),
  [normalized.x, normalized.y, position]
);
```

### Render Optimization
- Efficient point filtering
- Batched state updates
- Position caching
- Style memoization

## Edge Cases

### Boundary Points
- Intersection detection
- Multiple group options
- Visual indicators
- Group reassignment

### High Frequency Points
- Size limits
- Overlap handling
- Information display
- Performance impact

### Selection States
- Multiple point handling
- Deselection logic
- Focus management
- Tooltip positioning

## Accessibility Features

### Interactive Elements
```typescript
<div
  role="button"
  tabIndex={0}
  aria-label={`Data point: ${point.name}`}
  aria-selected={isSelected}
  onKeyPress={handleKeyPress}
  onClick={handleClick}
>
  {/* Point content */}
</div>
```

### Keyboard Support
- Enter/Space for selection
- Arrow keys for navigation
- Escape for deselection
- Tab for point traversal

## Testing Strategy

### Unit Tests
```typescript
describe('DataPointRenderer', () => {
  it('should calculate correct point positions', () => {
    const position = calculatePointPosition(samplePoint);
    expect(position.x).toBe(expectedX);
    expect(position.y).toBe(expectedY);
  });

  it('should handle frequency-based sizing', () => {
    const size = calculateDotSize(3);
    expect(size).toBeGreaterThan(baseSize);
    expect(size).toBeLessThanOrEqual(maxSize);
  });
});
```

### Integration Tests
- Point selection flow
- Group reassignment
- Frequency filtering
- Position updates

## Related Components
- InfoBox
- QuadrantChart
- FrequencySlider

## Version History

### Current Version: 1.3.0
- Added frequency-based sizing
- Improved boundary point handling
- Enhanced selection management
- Optimized performance

### Planned Improvements
1. Mobile interaction enhancements
2. Advanced clustering options
3. Animated transitions
4. Extended keyboard navigation