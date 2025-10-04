# ChartControls Component

## Overview
The ChartControls component provides the user interface for managing all visualization settings in the Apostles Model. It handles model terminology, detail levels, labeling, grid display, and data point frequency filtering.

## Features
- Model terminology switching (Classic/Modern)
- Near-apostles zone toggling
- Label management
- Grid display controls
- Midpoint adjustment controls
- Frequency filtering
- Scale number display
- Legend management
- Collapsible interface

## Interface

### Props
```typescript
interface ChartControlsProps {
  /** Toggle between classic and modern terminology */
  isClassicModel: boolean;
  setIsClassicModel: (value: boolean) => void;
  
  /** Near-apostles zone visibility */
  showNearApostles: boolean;
  setShowNearApostles: (value: boolean) => void;
  hasSpaceForNearApostles: boolean;

  /** Label display mode */
  labelMode: 'all' | 'quadrants' | 'sub-sections' | 'none';
  setLabelMode: (mode: 'all' | 'quadrants' | 'sub-sections' | 'none') => void;
  
  /** Grid visibility */
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  
  /** Midpoint adjustment */
  isAdjustableMidpoint: boolean;
  setIsAdjustableMidpoint: (adjustable: boolean) => void;
  
  /** Frequency filtering */
  frequencyFilterEnabled: boolean;
  frequencyThreshold: number;
  setFrequencyFilterEnabled: (enabled: boolean) => void;
  setFrequencyThreshold: (threshold: number) => void;
  frequencyData: {
    maxFrequency: number;
    hasOverlaps: boolean;
  };
  
  /** Scale and legend display */
  showScaleNumbers: boolean;
  setShowScaleNumbers: (show: boolean) => void;
  showLegends: boolean;
  setShowLegends: (show: boolean) => void;
}
```

## Usage

### Basic Usage
```tsx
function VisualizationContainer() {
  const [isClassicModel, setIsClassicModel] = useState(false);
  const [showNearApostles, setShowNearApostles] = useState(true);
  const [labelMode, setLabelMode] = useState<'all' | 'quadrants' | 'sub-sections' | 'none'>('all');
  const [showGrid, setShowGrid] = useState(true);

  return (
    <ChartControls
      isClassicModel={isClassicModel}
      setIsClassicModel={setIsClassicModel}
      showNearApostles={showNearApostles}
      setShowNearApostles={setShowNearApostles}
      hasSpaceForNearApostles={true}
      labelMode={labelMode}
      setLabelMode={setLabelMode}
      showGrid={showGrid}
      setShowGrid={setShowGrid}
      // ... other props
    />
  );
}
```

### With Frequency Filtering
```tsx
function AdvancedVisualization() {
  // ... other state
  const [frequencyFilter, setFrequencyFilter] = useState({
    enabled: false,
    threshold: 1
  });

  const frequencyData = {
    maxFrequency: 5,
    hasOverlaps: true
  };

  return (
    <ChartControls
      // ... other props
      frequencyFilterEnabled={frequencyFilter.enabled}
      frequencyThreshold={frequencyFilter.threshold}
      setFrequencyFilterEnabled={(enabled) => 
        setFrequencyFilter(prev => ({ ...prev, enabled }))}
      setFrequencyThreshold={(threshold) => 
        setFrequencyFilter(prev => ({ ...prev, threshold }))}
      frequencyData={frequencyData}
    />
  );
}
```

## Component Structure

### Control Groups
1. Terminology Group
   - Classic/Modern switch
   - Near-apostles toggle

2. Labels Group
   - All labels
   - Quadrants only
   - Sub-sections
   - No labels

3. Display Group
   - Grid toggle
   - Scale numbers toggle
   - Legends toggle

4. Adjustments Group
   - Midpoint adjustment
   - Frequency filtering (when available)

## Dependencies
- React
- lucide-react (for icons)
- Switch component
- FrequencySlider component

## State Management
- Collapsible state
- Control states
- Frequency filtering state
- Label mode state

## Styling
The component uses CSS modules with specific class naming:
```css
.chart-controls-wrapper
.chart-controls-header
.chart-controls
.control-group
.control-section-title
.labels-buttons
.frequency-control
```

## Events and Callbacks

### Label Mode Changes
```typescript
const handleLabelClick = (mode: 'all' | 'quadrants' | 'sub-sections' | 'none') => {
  setLabelMode(mode);
  if (mode === 'none') {
    setShowSpecialZoneLabels(false);
  }
};
```

### Frequency Control
```typescript
const handleFrequencyChange = (threshold: number) => {
  setFrequencyThreshold(threshold);
};
```

## Edge Cases
- Space availability for near-apostles
- Frequency filtering availability
- Label overlaps
- Control state conflicts
- Mobile responsiveness

## Accessibility
- ARIA labels for controls
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance

## Performance Considerations
- Memoized callbacks
- Optimized re-renders
- Efficient state updates
- Responsive layout handling

## Related Components
- [Switch](../ui/Switch.md)
- [FrequencySlider](./FrequencySlider.md)
- [QuadrantChart](./QuadrantChart.md)

## Changelog
| Version | Changes |
|---------|---------|
| 1.0.0   | Initial implementation |
| 1.1.0   | Added frequency filtering |
| 1.2.0   | Added collapsible interface |
| 1.3.0   | Added label mode control |

## Notes
- Controls should be disabled when not applicable
- Maintain state consistency across control changes
- Consider mobile-first approach for responsive design
- Document control interdependencies
