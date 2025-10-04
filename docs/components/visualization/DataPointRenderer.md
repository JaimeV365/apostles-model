# DataPointRenderer Component

## Overview
The DataPointRenderer component is responsible for rendering and managing interactive data points in the Apostles Model visualization. It handles point positioning, clustering, frequency visualization, quadrant assignment, and interactive features like selection and group reassignment.

## Features
- Dynamic point positioning
- Frequency-based sizing
- Interactive point selection
- Quadrant assignment
- Boundary point handling
- Point clustering
- Group reassignment
- Tooltip display
- Frequency filtering

## Interface

### Props
```typescript
interface DataPointRendererProps {
  /** Array of data points to render */
  data: DataPoint[];
  
  /** Grid dimensions for positioning */
  dimensions: GridDimensions;
  
  /** Current midpoint position */
  position: Position;
  
  /** Frequency filtering state */
  frequencyFilterEnabled: boolean;
  
  /** Frequency display threshold */
  frequencyThreshold: number;
}
```

### State
```typescript
interface RendererState {
  /** Currently selected point ID */
  selectedPoint: string | null;
  
  /** Manual group assignments map */
  manualGroups: Map<string, QuadrantInfo>;
}
```

## Usage

### Basic Usage
```tsx
function VisualizationComponent() {
  const dimensions = calculateGridDimensions(scales);
  const position = { x: 50, y: 50 };

  return (
    <DataPointRenderer
      data={dataPoints}
      dimensions={dimensions}
      position={position}
      frequencyFilterEnabled={false}
      frequencyThreshold={1}
    />
  );
}
```

### With Frequency Filtering
```tsx
function AdvancedVisualization() {
  return (
    <DataPointRenderer
      data={dataPoints}
      dimensions={dimensions}
      position={position}
      frequencyFilterEnabled={true}
      frequencyThreshold={2}
    />
  );
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
  // ... other quadrant assignments
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

## Interaction Handling

### Point Selection
```typescript
const handlePointClick = (pointId: string) => {
  setSelectedPoint(selectedPoint === pointId ? null : pointId);
};
```

### Group Reassignment
```typescript
const handleGroupChange = (pointId: string, newGroup: QuadrantInfo) => {
  setManualGroups(new Map(manualGroups.set(pointId, newGroup)));
};
```

## Point Rendering Logic

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
const getPointStyle = (
  point: DataPoint,
  position: Position,
  isSelected: boolean
): React.CSSProperties => ({
  position: 'absolute',
  left: `${position.x}%`,
  bottom: `${position.y}%`,
  width: `${size}px`,
  height: `${size}px`,
  backgroundColor: quadrantInfo.color,
  transform: 'translate(-50%, 50%)',
  borderRadius: '50%',
  border: '2px solid white',
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  zIndex: isSelected ? 45 : count > 1 ? 42 : 40
});
```

## Performance Optimizations

### Memoization
```typescript
const quadrantInfo = useMemo(() => 
  getQuadrantInfo(normalized.x, normalized.y),
  [normalized.x, normalized.y, position]
);
```

### Efficient Updates
```typescript
useEffect(() => {
  const newManualGroups = new Map(manualGroups);
  let hasChanges = false;

  data.forEach(point => {
    if (manualGroups.has(point.id)) {
      const isIntersection = isOnGridIntersection(point);
      if (!isIntersection) {
        newManualGroups.delete(point.id);
        hasChanges = true;
      }
    }
  });

  if (hasChanges) {
    setManualGroups(newManualGroups);
  }
}, [position, data, dimensions]);
```

## Accessibility

### Interactive Elements
- Role assignments
- ARIA labels
- Focus management
- Keyboard navigation

### Color Considerations
- Contrast ratios
- Color-blind friendly
- Visual feedback

## Edge Cases

### Boundary Points
- Intersection detection
- Group assignment options
- Visual indicators

### High Frequency Points
- Size limits
- Overlap handling
- Information display

### Selection Management
- Multiple points
- Deselection
- Focus handling

## Dependencies
- React (useState, useEffect, useMemo)
- InfoBox component
- Position calculation utilities
- Quadrant determination utilities

## Related Components
- [InfoBox](./InfoBox.md)
- [QuadrantChart](./QuadrantChart.md)
- [FrequencySlider](./FrequencySlider.md)

## Changelog
| Version | Changes |
|---------|---------|
| 1.0.0   | Initial implementation |
| 1.1.0   | Added frequency filtering |
| 1.2.0   | Added group reassignment |
| 1.3.0   | Added performance optimizations |

## Notes
- Monitor performance with large datasets
- Consider mobile interactions
- Maintain z-index hierarchy
- Handle window resize events
