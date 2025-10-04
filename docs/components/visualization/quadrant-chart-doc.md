# QuadrantChart Component

## Overview
The QuadrantChart component is the core visualization element of the Apostles Model, providing an interactive grid-based representation of customer satisfaction and loyalty data. It manages quadrant divisions, special zones, data point visualization, and interactive controls.

## Component Architecture

### Container Structure
```plaintext
QuadrantChart
├── ChartControls
├── GridSystem
│   ├── GridRenderer
│   ├── ScaleMarkers
│   └── AxisLegends
├── QuadrantRenderer
├── SpecialZoneRenderer
├── DataPointRenderer
├── MidpointHandle
└── ResizeHandles
```

## Features
- Interactive data point visualization
- Dynamic quadrant management
- Special zones (Apostles/Advocates, Terrorists/Trolls)
- Near-apostles zone system
- Frequency-based point sizing
- Grid and scale system
- Axis legends and labels
- Comprehensive control interface

## Interface

### Props
```typescript
interface QuadrantChartProps {
  // Data
  data: DataPoint[];
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  
  // Display Settings
  isClassicModel: boolean;
  showNearApostles: boolean;
  showLabels: boolean;
  showGrid: boolean;
  hideWatermark: boolean;
  
  // Advanced Features
  showAdvancedFeatures: boolean;
  activeEffects: Set<string>;
  
  // Frequency Controls
  frequencyFilterEnabled: boolean;
  frequencyThreshold: number;
  isAdjustableMidpoint: boolean;
  
  // Callbacks
  onFrequencyFilterEnabledChange: (enabled: boolean) => void;
  onFrequencyThresholdChange: (threshold: number) => void;
  onIsAdjustableMidpointChange: (adjustable: boolean) => void;
  onIsClassicModelChange: (isClassic: boolean) => void;
  onShowNearApostlesChange: (show: boolean) => void;
  onShowLabelsChange: (show: boolean) => void;
  onShowGridChange: (show: boolean) => void;
}
```

## Container Layout

### Fixed Grid System
```typescript
interface ContainerLayout {
  /** Fixed grid size with adaptive padding */
  baseContainer: {
    padding: string;    // "20px 40px 20px 20px"
    width: string;      // "calc(100% - 80px)"
    height: string;     // "600px"
    margin: string;     // "40px"
  };

  /** Padding adjustments for various states */
  paddingStates: {
    withScales: string;     // "+20px left/bottom"
    withLegends: string;    // "+40px left/bottom"
    withBoth: string;       // "+60px left/bottom"
  };
}
```

### Key Layout Principles
- Fixed grid size for stability
- Adaptive container padding
- Consistent right-side spacing (40px)
- Non-overlapping element placement
- Automatic padding management

## Component Integration

### Grid System
```typescript
<GridSystem 
  dimensions={dimensions}
  showGrid={showGrid}
  showScaleNumbers={showScaleNumbers}
  showLegends={showLegends}
/>
```

### Special Zones
```typescript
<SpecialZoneRenderer
  dimensions={dimensions}
  apostlesZoneSize={apostlesZoneSize}
  terroristsZoneSize={terroristsZoneSize}
  showLabels={showLabels}
  isClassicModel={isClassicModel}
  showNearApostles={showNearApostles}
  maxSizes={maxSizes}
/>
```

### Data Points
```typescript
<DataPointRenderer
  data={data}
  dimensions={dimensions}
  position={position}
  frequencyFilterEnabled={frequencyFilterEnabled}
  frequencyThreshold={frequencyThreshold}
/>
```

## State Management

### Core States
```typescript
// Size States
const [apostlesZoneSize, setApostlesZoneSize] = useState(1);
const [terroristsZoneSize, setTerroristsZoneSize] = useState(1);

// Display States
const [labelMode, setLabelMode] = useState<LabelMode>('all');
const [showScaleNumbers, setShowScaleNumbers] = useState(true);
const [showLegends, setShowLegends] = useState(true);

// Selection States
const [selectedPoint, setSelectedPoint] = useState<EnhancedDataPoint | null>(null);
```

### Derived States
```typescript
// Position calculations
const position = useMemo(() => 
  calculateMidpointPosition(midpoint, dimensions),
  [midpoint, dimensions]
);

// Frequency statistics
const frequencyStats = useMemo(() => 
  calculatePointFrequencies(data),
  [data]
);
```

## Event Handling

### Zone Resizing
```typescript
const handleZoneResize = (
  zone: 'apostles' | 'terrorists', 
  newSize: number
) => {
  if (zone === 'apostles') {
    setApostlesZoneSize(newSize);
  } else {
    setTerroristsZoneSize(newSize);
  }
};
```

### Point Selection
```typescript
const handlePointSelect = (point: EnhancedDataPoint) => {
  const duplicates = data.filter(p => 
    !p.excluded && 
    p.satisfaction === point.satisfaction && 
    p.loyalty === point.loyalty && 
    p.id !== point.id
  );
  
  setSelectedPoint({
    ...point,
    duplicates: duplicates.map(d => ({ 
      id: d.id, 
      name: d.name 
    }))
  });
};
```

## Styling System

### Container Styles
```css
.quadrant-chart {
  width: 100%;
}

.chart-container {
  position: relative;
  width: calc(100% - 80px);
  height: 600px;
  margin: 40px auto;
  background-color: white;
  border-radius: 4px;
  overflow: visible;
}
```

### Layer Management
```css
/* Z-index hierarchy */
.grid-lines { z-index: 1; }
.quadrants { z-index: 2; }
.special-zones { z-index: 3; }
.data-points { z-index: 4; }
.controls { z-index: 5; }
```

## Performance Optimization

### Memoization Strategy
```typescript
// Grid dimensions
const dimensions = useMemo(() => 
  calculateGrid({
    satisfactionScale,
    loyaltyScale,
    midpoint,
    apostlesZoneSize,
    terroristsZoneSize
  }), 
  [satisfactionScale, loyaltyScale, midpoint, apostlesZoneSize, terroristsZoneSize]
);

// Frequency calculations
const frequencyStats = useMemo(() => 
  calculatePointFrequencies(data), 
  [data]
);
```

### Render Optimization
- Component memoization
- State batching
- Conditional rendering
- Event delegation

## Accessibility

### ARIA Attributes
```typescript
<div 
  role="region"
  aria-label="Apostles Model visualization"
  className="quadrant-chart"
>
  {/* Chart content */}
</div>
```

### Keyboard Navigation
- Focus management
- Key commands
- Tab order

## Error Handling

### Data Validation
```typescript
// Validate midpoint position
const validateMidpoint = (newMidpoint: Midpoint) => {
  const maxSat = parseInt(satisfactionScale.split('-')[1]);
  const maxLoy = parseInt(loyaltyScale.split('-')[1]);
  
  return {
    sat: Math.max(2, Math.min(maxSat - 1, newMidpoint.sat)),
    loy: Math.max(2, Math.min(maxLoy - 1, newMidpoint.loy))
  };
};
```

### Error Boundaries
- Component error catching
- State recovery
- User feedback

## Testing Strategy

### Unit Tests
1. Component rendering
2. State management
3. Event handling
4. Data processing

### Integration Tests
1. Component interaction
2