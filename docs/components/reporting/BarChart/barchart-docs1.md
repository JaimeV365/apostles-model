# Bar Chart System Documentation

## Overview
The bar chart system in the reporting section handles data visualization with adaptive scaling and premium features. Recent updates focused on fixing spacing issues and improving legend visibility controls.

## Implementation Details

### Component Structure
```
BarChart/
├── index.tsx              # Main component
├── styles.css            # Styling and layout
└── types.ts             # Type definitions
```

### Core Interfaces
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

### Key Layout Solutions

#### 1. Space Management System
```css
.bar-chart-container {
  /* Base Layout Variables */
  --grid-top-space: 0;          /* Dynamic top space */
  --legend-height: 45px;        /* Fixed legend height */
  --bottom-spacing: 35px;       /* Fixed bottom space */
  --content-padding: 10px;      /* Container padding */
  --base-height: 250px;         /* Minimum height */

  /* Container Settings */
  position: relative;
  width: 100%;
  min-height: var(--base-height);
  height: fit-content;
  padding: var(--content-padding);
  padding-bottom: var(--bottom-spacing);
}

/* Legend Visibility Management */
.bar-chart-container:not(.show-legend) {
  --grid-top-space: 45px;  /* Compensate for hidden legend */
}

.bar-chart-container.show-legend {
  padding-top: calc(var(--legend-height) + var(--content-padding));
}
```

#### 2. Scaling and Grid System
```typescript
const calculateScale = (data: BarChartData[]) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  // Create linear scale
  const yScale = scaleLinear()
    .domain([0, maxCount])
    .nice()
    .range([0, 100]);

  // Generate tick marks
  const scaleMarkers = yScale.ticks(5)
    .map(value => ({
      value,
      position: yScale(value)
    }));

  return { yScale, scaleMarkers };
};
```

### Component Layout
```typescript
const BarChart: React.FC<BarChartProps> = ({
  data,
  showLegend = true,
  // ... other props
}) => {
  const { yScale, scaleMarkers } = useMemo(() => 
    calculateScale(data), [data]
  );

  return (
    <div className={`bar-chart-container ${showLegend ? 'show-legend' : ''}`}>
      {/* Legend Section */}
      {showLegend && title && (
        <div className="bar-chart-legend">
          <h4 className="bar-chart-title">{title}</h4>
        </div>
      )}

      {/* Chart Content */}
      <div className="bar-chart-wrapper">
        {/* Scale Numbers */}
        <div className="bar-chart-scale">
          {scaleMarkers.map(marker => (
            <div
              key={marker.value}
              className="bar-chart-scale-marker"
              style={{ bottom: `${marker.position}%` }}
            >
              {marker.value}
            </div>
          ))}
        </div>

        {/* Grid Lines */}
        {showGrid && (
          <div className="bar-chart-grid">
            {scaleMarkers.map(marker => (
              <div
                key={marker.value}
                className="bar-chart-grid-line"
                style={{ bottom: `${marker.position}%` }}
              />
            ))}
          </div>
        )}

        {/* Bars */}
        <div className="bar-chart-bars">
          {data.map(item => (
            <Bar
              key={item.value}
              data={item}
              scale={yScale}
              showValue={showValues}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### Critical CSS Rules
```css
/* Grid System */
.bar-chart-grid,
.bar-chart-bars,
.bar-chart-scale {
  position: absolute;
  top: var(--grid-top-space);
  bottom: 25px;
  left: 0;
  right: 0;
}

/* Scale Numbers */
.bar-chart-scale-marker {
  position: absolute;
  right: 100%;
  transform: translateY(50%);
  padding-right: 0.5rem;
  font-size: 0.75rem;
  color: #6B7280;
}

/* Grid Lines */
.bar-chart-grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #E5E7EB;
}

/* Individual Bars */
.bar-chart-bar {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 30px;
  min-height: 1px;
  background-color: #3a863e;
  transition: height 0.2s ease;
}
```

### Key Features

#### 1. Space Management
- Dynamic top spacing based on legend visibility
- Consistent alignment between scale, grid, and bars
- Automatic height adaptation for different data volumes

#### 2. Scale Generation
- Automatic tick calculation using d3-scale
- Nice number rounding for scale values
- Consistent spacing between ticks

#### 3. Grid System
- Aligned grid lines with scale numbers
- Responsive grid that maintains proportions
- Clear visual separation between elements

### Premium Features
1. Interactive Controls
   - Legend toggle
   - Grid toggle
   - Value display options
   - Color customization

2. Bar Customization
   - Color selection
   - Multiple bar selection
   - Custom tooltips

### Error Prevention

#### 1. Scale Crowding
```typescript
// Limit number of ticks based on available space
const calculateTickCount = (height: number) => {
  return Math.min(5, Math.floor(height / 50));
};

const ticks = yScale.ticks(calculateTickCount(containerHeight));
```

#### 2. Layout Shifts
```css
/* Prevent layout shifts during legend toggle */
.bar-chart-container {
  contain: layout;
  content-visibility: auto;
}
```

### Future Improvements
1. Add animation system for updates
2. Implement responsive breakpoints
3. Add touch interaction support
4. Enhance accessibility features
5. Add export capabilities

### Location
Save this documentation in `/docs/components/reporting/BarChart/implementation.md`