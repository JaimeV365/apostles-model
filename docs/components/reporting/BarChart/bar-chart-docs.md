# Bar Chart System Documentation

## Overview
The Bar Chart system provides an interactive visualization component with premium customization features, including color customization, grid controls, and value display options.

## File Structure
```
components/
└── reporting/
    ├── components/
    │   ├── BarChart/
    │   │   ├── index.tsx    # Main component
    │   │   └── styles.css   # Styles
    └── hooks/
        └── useReportCustomization.ts # Customization hook
```

## Core Components

### 1. BarChart Component
Location: `/components/reporting/components/BarChart/index.tsx`

#### Props Interface
```typescript
interface BarChartProps {
  data: BarChartData[];
  showGrid?: boolean;
  showLabels?: boolean;
  interactive?: boolean;
  customColors?: Record<number, string>;
  onColorChange?: (value: number, color: string) => void;
  onGridChange?: (showGrid: boolean) => void;
  className?: string;
  chartType?: 'bar' | 'mini';
  chartId?: string;
  title?: string;
  showLegend?: boolean;
}

interface BarChartData {
  value: number;
  count: number;
}
```

#### Key Features
- Dynamic bar scaling
- Interactive color customization
- Grid toggle system
- Value display controls
- Premium feature gating
- Bar selection system

## State Management

### 1. Internal State
```typescript
const [hoveredBar, setHoveredBar] = useState<number | null>(null);
const [selectedBar, setSelectedBar] = useState<number | null>(null);
const [showSettings, setShowSettings] = useState(false);
const [showValues, setShowValues] = useState(true);
const [internalShowGrid, setInternalShowGrid] = useState(showGrid);
const [selectedBars, setSelectedBars] = useState<Set<number>>(new Set());
```

### 2. Scale Calculation
```typescript
const maxCount = Math.max(...data.map(d => d.count), 1);
const yScale = scaleLinear()
  .domain([0, maxCount])
  .nice()
  .range([0, 100]);

const scaleMarkers = yScale.ticks(5)
  .map(value => ({
    value,
    position: yScale(value)
  }));
```

## Premium Features

### 1. Color Customization
```typescript
const handleColorChange = (value: number, color: string) => {
  if (!interactive) return;
  onColorChange?.(value, color);
};
```

### 2. Multi-Selection
```typescript
const handleBarClick = (value: number, event: React.MouseEvent) => {
  if (!interactive) return;

  if (event.ctrlKey) {
    setSelectedBars(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(value)) {
        newSelection.delete(value);
      } else {
        newSelection.add(value);
      }
      return newSelection;
    });
  } else {
    setSelectedBars(prev => {
      if (prev.has(value) && prev.size === 1) {
        return new Set();
      }
      return new Set([value]);
    });
  }
};
```

## Styling System

### 1. Container Layout
```css
.bar-chart-container {
  --grid-top-space: 0;
  --legend-height: 45px;
  --bottom-spacing: 35px;
  --content-padding: 10px;
  --base-height: 250px;

  position: relative;
  width: 100%;
  min-height: var(--base-height);
  height: fit-content;
  padding: var(--content-padding);
  padding-bottom: var(--bottom-spacing);
}
```

### 2. Bar Styling
```css
.bar-chart-bar {
  width: 100%;
  max-width: 30px;
  background-color: #3a863e;
  transition: all 0.2s ease;
  min-height: 1px;
  position: absolute;
  bottom: 0;
}

.bar-chart-bar.premium {
  cursor: pointer;
}

.bar-chart-bar.selected-bar {
  border: 2px solid #3a863e;
  box-shadow: 0 0 0 2px rgba(58, 134, 62, 0.3);
}
```

## Interactive Features

### 1. Settings Panel
```typescript
const SettingsPanel: React.FC = () => (
  <div className="bar-chart-settings-panel">
    <div className="bar-chart-settings-group">
      <div className="bar-chart-switches">
        {/* Value Display Toggle */}
        {/* Grid Toggle */}
        {/* Legend Toggle */}
      </div>
    </div>
    <div className="bar-chart-color-customization">
      {/* Color Palette */}
      {/* Custom Color Input */}
    </div>
  </div>
);
```

### 2. Color Palette
```typescript
const colorPalette = [
  '#3a863e', // Brand green
  '#dc2626', // Red
  '#f59e0b', // Yellow
  '#4682b4', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#78716c', // Warm gray
];
```

## Grid System

### 1. Scale Markers
```typescript
const ScaleMarkers: React.FC = () => (
  <div className="bar-chart-scale">
    {scaleMarkers.map(marker => (
      <div
        key={marker.value}
        className="bar-chart-scale-marker"
        style={{ '--position': marker.position }}
      >
        {marker.value}
      </div>
    ))}
  </div>
);
```

### 2. Grid Lines
```typescript
const GridLines: React.FC = () => (
  <div className="bar-chart-grid">
    {scaleMarkers.map(marker => (
      <div
        key={marker.value}
        className="bar-chart-grid-line"
        style={{ bottom: `${marker.position}%` }}
      />
    ))}
  </div>
);
```

## Event Handling

### 1. Click Outside Detection
```typescript
const handleClickOutside = useCallback((event: MouseEvent) => {
  const targetElement = event.target as HTMLElement;
  const isBarClick = targetElement.closest('.bar-chart-bar');
  const isSettingsClick = settingsPanelRef.current?.contains(targetElement);
  
  if (!isBarClick && !isSettingsClick) {
    setSelectedBars(new Set());
  }
}, []);
```

### 2. Color Application
```typescript
const applyColor = (color: string) => {
  if (selectedBars.size === 0) return;
  selectedBars.forEach(barValue => {
    onColorChange?.(barValue, color);
  });
};
```

## Performance Optimizations

### 1. Memoization
- Use of useCallback for event handlers
- Memoized calculations for scale markers
- Optimized re-renders for bar updates

### 2. DOM Updates
- Efficient class toggling
- Minimal style recalculations
- Batched state updates

## Error Handling

### 1. Data Validation
```typescript
const validateData = (data: BarChartData[]) => {
  if (!Array.isArray(data)) return [];
  return data.filter(d => 
    typeof d.value === 'number' && 
    typeof d.count === 'number'
  );
};
```

### 2. Premium Feature Guards
```typescript
if (!interactive) return;
```

## Usage Examples

### 1. Basic Implementation
```tsx
<BarChart
  data={transformData(statistics.satisfaction.distribution)}
  showGrid={true}
  showLabels={true}
  title="Satisfaction Distribution"
/>
```

### 2. Premium Features
```tsx
<BarChart
  data={transformData(statistics.satisfaction.distribution)}
  interactive={isPremium}
  customColors={satisfactionColors}
  onColorChange={(value, color) => {
    setSatisfactionColors(prev => ({
      ...prev,
      [value]: color
    }));
  }}
/>
```

## Future Improvements

### 1. Planned Features
- Animation system
- Custom tooltips
- Advanced interactions
- Export capabilities
- Theme support

### 2. Technical Enhancements
- Performance optimization
- Accessibility improvements
- Mobile interactions
- Testing coverage

## Troubleshooting Guide

### Common Issues
1. Bar Rendering
   - Check data format
   - Verify scale calculations
   - Validate container dimensions

2. Interaction Problems
   - Verify premium status
   - Check event propagation
   - Validate state updates

3. Style Inconsistencies
   - Check CSS specificity
   - Verify class application
   - Validate theme variables