# BarChart Component Documentation

## Overview
The BarChart component is a core visualization element in the Apostles Model application that displays data in a vertical bar format. It supports both standard and premium features, allowing for data visualization and interaction.

## Component Location
```
src/components/visualization/components/BarChart/
├── index.tsx           # Main component implementation
└── styles.css         # Component-specific styles
```

## Dependencies
- **Parent Component**: Used in DataReport for satisfaction and loyalty visualization
- **Required Props**: data, showGrid, showLabels, interactive, customColors
- **Optional Props**: onColorChange, onGridChange, className, chartId, title, showLegend, chartType

## Features

### Standard Features
- Vertical bar visualization
- Value display inside bars
- Grid line display
- Basic legends
- Scale markers
- Responsive design

### Premium Features
- Bar color customization
  - Predefined color palette
  - Custom hex color input
- Bar selection
  - Single selection
  - Multi-selection (using Ctrl key)
  - "Apply to all" functionality
- Interactive UI elements
  - Settings cogwheel
  - Show/hide values toggle
  - Show/hide grid toggle
  - Show/hide legend toggle

## State Management
The component manages several internal states:
```typescript
const [hoveredBar, setHoveredBar] = useState<number | null>(null);
const [selectedBar, setSelectedBar] = useState<number | null>(null);
const [showSettings, setShowSettings] = useState(false);
const [showValues, setShowValues] = useState(true);
const [internalShowGrid, setInternalShowGrid] = useState(showGrid);
const [customHexInput, setCustomHexInput] = useState('');
const [selectedBars, setSelectedBars] = useState<Set<number>>(new Set());
```

## Usage Example
```tsx
<BarChart 
  data={transformData(
    report.statistics.satisfaction.distribution,
    Number(report.satisfactionScale.split('-')[1])
  )}
  showGrid={true}
  showLabels={true}
  interactive={isPremium}
  customColors={satisfactionColors}
  onColorChange={(value, color) => {
    setSatisfactionColors(prev => ({
      ...prev,
      [value]: color
    }));
  }}
  title={`Satisfaction (${report.satisfactionScale})`}
  showLegend={true}
  chartId="satisfaction"
/>
```

## Maintenance Guidelines

### Adding New Features
1. Standard features:
   - Add to core rendering logic
   - Maintain responsive design
   - Update documentation

2. Premium features:
   - Implement behind interactive flag
   - Add to settings panel if configurable
   - Update premium feature tests

### Style Updates
1. Use constants from styles/constants.ts
2. Follow BEM naming convention
3. Keep premium styles separate
4. Test responsive behavior

### Performance Considerations
- Batch state updates
- Memoize calculations
- Clean up event listeners
- Optimize re-renders

## Known Issues and Future Improvements
1. Current Limitations:
   - Settings panels can't be open simultaneously
   - Color customization only available in premium mode
   - No animation on bar value changes

2. Planned Improvements:
   - Add bar value animations
   - Enhance color palette options
   - Add bar clicking sound effects
   - Custom tooltips

## Testing
All changes should be tested for:
1. Basic functionality
2. Premium feature access
3. Responsive design
4. Cross-browser compatibility

## Associated Documentation
- [API Documentation](./API.md)
- [Styles Documentation](./Styles.md)