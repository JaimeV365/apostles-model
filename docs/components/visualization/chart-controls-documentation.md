# ChartControls Component

## Overview
The ChartControls component provides a comprehensive interface for managing all visualization settings in the Apostles Model. It handles model terminology, detail levels, labeling, grid display, and data point frequency filtering through a collapsible panel interface.

## Features
- Model terminology switching (Classic/Modern)
- Near-apostles zone toggling
- Label management system
- Grid display controls
- Midpoint adjustment controls
- Frequency filtering
- Scale number display
- Legend management
- Collapsible interface

## Component Structure

### Main Container
```tsx
<div className="chart-controls-wrapper">
  <Header/>
  <ControlGroups/>
</div>
```

### Control Groups
1. **Terminology Group**
   - Classic/Modern terminology switch
   - Near-apostles toggle (dependent on available space)

2. **Labels Group**
   - All labels
   - Quadrants only
   - Sub-sections (available when near-apostles is active)
   - No labels

3. **Display Group**
   - Grid toggle
   - Scale numbers toggle
   - Legends toggle
   - Fixed/Adjustable mode switch

4. **Frequency Group** (shown when overlapping points exist)
   - Frequency filter toggle
   - Threshold slider

## Interface

### Props
```typescript
interface ChartControlsProps {
  // Model controls
  isClassicModel: boolean;
  setIsClassicModel: (value: boolean) => void;
  
  // Detail controls
  showNearApostles: boolean;
  setShowNearApostles: (value: boolean) => void;
  hasSpaceForNearApostles: boolean;

  // Label controls
  labelMode: 'all' | 'quadrants' | 'sub-sections' | 'none';
  setLabelMode: (mode: 'all' | 'quadrants' | 'sub-sections' | 'none') => void;
  showSpecialZoneLabels: boolean;
  setSpecialZoneLabels: (show: boolean) => void;
  
  // Grid controls
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  
  // Center adjustment
  isAdjustableMidpoint: boolean;
  setIsAdjustableMidpoint: (adjustable: boolean) => void;
  
  // Frequency filtering
  frequencyFilterEnabled: boolean;
  frequencyThreshold: number;
  setFrequencyFilterEnabled: (enabled: boolean) => void;
  setFrequencyThreshold: (threshold: number) => void;
  frequencyData: {
    maxFrequency: number;
    hasOverlaps: boolean;
  };
  
  // Scale and Legend controls
  showScaleNumbers: boolean;
  setShowScaleNumbers: (show: boolean) => void;
  showLegends: boolean;
  setShowLegends: (show: boolean) => void;
}
```

## Label Management Logic

### Label Mode System
```typescript
type LabelMode = 'all' | 'quadrants' | 'sub-sections' | 'none';

// Label visibility logic
const showQuadrantLabels = labelMode === 'all' || labelMode === 'quadrants';
const showSpecialLabels = labelMode === 'all' || labelMode === 'sub-sections';
```

### Mode Dependencies
- Sub-sections mode requires near-apostles to be active
- Label modes affect both quadrant and special zone labels
- Special considerations for overlapping labels

## Frequency Control System

### Visibility Logic
```typescript
const showFrequencyControls = frequencyData.hasOverlaps;
const showFrequencySlider = frequencyFilterEnabled && showFrequencyControls;
```

### Threshold Management
- Minimum: 1
- Maximum: Based on data analysis
- Dynamic updates based on data changes

## Styling

### CSS Structure
The component uses a modular CSS structure:
```css
.chart-controls-wrapper  /* Main container */
.chart-controls-header  /* Collapsible header */
.chart-controls        /* Controls container */
.control-group         /* Individual control sections */
.control-section-title /* Group headers */
```

### Visual States
- Active/inactive states for toggles
- Disabled states for unavailable options
- Hover and focus states
- Transition animations

## Dependencies
- React
- lucide-react (for icons)
- Switch component
- TwoStateToggle component
- FrequencySlider component

## Edge Cases and Error Handling

### Space Management
- Handles near-apostles availability
- Manages control visibility based on available space
- Responsive layout adjustments

### State Conflicts
- Prevents invalid state combinations
- Handles dependent control states
- Manages control group visibility

### Error Prevention
- Type checking for all props
- Validation for numeric inputs
- Fallback values for undefined states

## Performance Considerations

### Render Optimization
```typescript
// Memoization example
const handleLabelModeChange = useCallback((mode: LabelMode) => {
  setLabelMode(mode);
  if (mode === 'none') {
    setSpecialZoneLabels(false);
  }
}, [setLabelMode, setSpecialZoneLabels]);
```

### State Updates
- Batched state updates
- Memoized callbacks
- Efficient re-renders

## Accessibility Features

### Keyboard Navigation
- Tab order follows visual layout
- Keyboard shortcuts for common actions
- Focus management system

### ARIA Support
```typescript
// Example implementation
<div 
  role="region"
  aria-label="Chart controls"
  aria-expanded={!isCollapsed}
>
  {/* Control content */}
</div>
```

### Screen Reader Support
- Meaningful labels and descriptions
- State announcements
- Clear hierarchy

## Testing Considerations

### Key Test Cases
1. Label mode transitions
2. Frequency filter interactions
3. Near-apostles space checks
4. Collapse/expand behavior
5. State persistence

### Test Examples
```typescript
describe('ChartControls', () => {
  it('should handle label mode changes correctly', () => {
    expect(labelMode).toBe('all');
    handleLabelClick('quadrants');
    expect(labelMode).toBe('quadrants');
  });
  
  it('should disable sub-sections when near-apostles unavailable', () => {
    setHasSpaceForNearApostles(false);
    expect(subsectionsButton).toBeDisabled();
  });
});
```

## Related Components
- QuadrantChart
- FrequencySlider
- GridSystem
- SpecialZones

## Maintenance Notes

### State Management
- Control states are managed at QuadrantChart level
- Local states only for UI interactions
- Props for all visualization settings

### Update Process
1. Verify control dependencies
2. Update affected components
3. Test all interactions
4. Update documentation

## Version History

### Current Version: 1.3.0
- Added collapsible interface
- Improved frequency controls
- Enhanced label management
- Added modern terminology support

### Planned Improvements
1. Enhanced mobile support
2. Additional control customization
3. Improved performance optimizations
4. Extended accessibility features