# BarChart API Documentation

## Props Interface

```typescript
interface BarChartProps {
  /** Array of data points to display */
  data: BarChartData[];
  
  /** Toggle grid lines visibility */
  showGrid?: boolean;
  
  /** Toggle value labels under bars */
  showLabels?: boolean;
  
  /** Enable premium interactive features */
  interactive?: boolean;
  
  /** Custom colors for specific bars */
  customColors?: Record<number, string>;
  
  /** Handler for color changes */
  onColorChange?: (value: number, color: string) => void;
  
  /** Handler for grid visibility changes */
  onGridChange?: (showGrid: boolean) => void;
  
  /** Additional CSS class names */
  className?: string;
  
  /** Chart type - affects sizing and interactions */
  chartType?: 'bar' | 'mini';
  
  /** Unique identifier for the chart instance */
  chartId?: string;
  
  /** Chart title shown in legend */
  title?: string;
  
  /** Toggle legend visibility */
  showLegend?: boolean;
}

interface BarChartData {
  /** Bar value (used for labeling) */
  value: number;
  
  /** Bar height (determines visual representation) */
  count: number;
}
```

## State Management

### Display States
```typescript
// Visibility toggles
const [showValues, setShowValues] = useState(true);
const [internalShowGrid, setInternalShowGrid] = useState(showGrid);
const [showChartLegend, setShowChartLegend] = useState(showLegend);
const [showSettings, setShowSettings] = useState(false);

// UI interaction states
const [hoveredBar, setHoveredBar] = useState<number | null>(null);
const [selectedBar, setSelectedBar] = useState<number | null>(null);
const [selectedBars, setSelectedBars] = useState<Set<number>>(new Set());

// Color customization
const [colorInput, setColorInput] = useState<string>('');
const [customHexInput, setCustomHexInput] = useState('');
const [applyToAll, setApplyToAll] = useState(false);
```

## Core Methods

### Event Handlers

#### handleBarClick
```typescript
const handleBarClick = (value: number, event: React.MouseEvent) => {
  if (!interactive) return;
  
  if (event.ctrlKey) {
    // Multi-selection logic
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
    // Single selection logic
    setSelectedBars(prev => {
      if (prev.has(value) && prev.size === 1) {
        return new Set();
      }
      return new Set([value]);
    });
  }
};
```

#### handleClickOutside
```typescript
const handleClickOutside = useCallback((event: MouseEvent) => {
  const targetElement = event.target as HTMLElement;
  const isBarClick = targetElement.closest('.bar-chart-bar');
  const isSettingsClick = settingsPanelRef.current?.contains(targetElement);
  
  if (!isBarClick && !isSettingsClick) {
    setSelectedBars(new Set());
    setApplyToAll(false);
  }

  if (!isSettingsClick) {
    setShowSettings(false);
  }
}, []);
```

## Component Lifecycle

### Initialization
1. Component mount
   - Initialize states
   - Set up event listeners
   - Apply default settings

### Cleanup
1. Component unmount
   - Remove event listeners
   - Clear selections
   - Reset states

### Updates
1. Props changes
   - Update internal grid state
   - Recalculate dimensions
   - Update color mappings

## Premium Feature Integration

### Feature Gates
- Color customization only available when `interactive={true}`
- Multi-select only enabled for premium users
- Settings panel requires premium access

### Premium UI Elements
- Color palette
- Custom hex input
- Apply to all toggle
- Settings cogwheel

## Error Handling

### Data Validation
```typescript
// Validate incoming data
if (!Array.isArray(data) || data.length === 0) {
  console.warn('BarChart: Invalid or empty data provided');
  return null;
}

// Validate color input
const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(color);
if (!isValidHex) {
  console.warn('BarChart: Invalid hex color provided');
  return;
}
```

### Recovery Strategies
1. Invalid data: Render empty state
2. Invalid colors: Fall back to defaults
3. Premium feature access: Graceful degradation

## Event Flow
1. User interaction
2. Event handler triggered
3. State update
4. Re-render with new state
5. Side effects (if any)
6. Parent notification (via callbacks)

## Usage Notes

### Best Practices
1. Always provide unique chartId for multiple instances
2. Use memo for expensive transformations
3. Handle premium feature access at parent level
4. Maintain consistent color schemes

### Common Pitfalls
1. Missing error handling for invalid data
2. Not cleaning up event listeners
3. Inconsistent premium feature checks
4. Color scheme inconsistencies

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile and desktop
- Touch event support for mobile interaction