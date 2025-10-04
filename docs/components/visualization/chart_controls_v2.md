# ChartControls Component v2.0

## Overview
The ChartControls component provides a comprehensive interface for managing all visualization settings in the Apostles Model. It handles model terminology, detail levels, labeling, grid display, and data point frequency filtering through a collapsible panel interface.

## Features
- Model terminology switching (Classic/Modern)
- Areas display mode (No Areas, Main Areas, All Areas)
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
   - Areas display mode toggle (No Areas/Main Areas/All Areas)

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
  
  // Areas display mode
  areasDisplayMode: 1 | 2 | 3; // 1=No Areas, 2=Main Areas, 3=All Areas
  setAreasDisplayMode: (mode: 1 | 2 | 3) => void;
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

## Areas Display Mode System

### Mode Configuration
```typescript
type AreasDisplayMode = 1 | 2 | 3;

// Mode 1: No Areas - only standard quadrants
// Mode 2: Main Areas - quadrants + apostles/terrorists zones
// Mode 3: All Areas - everything including near-zones

const handleAreasDisplayModeChange = (position: AreasDisplayMode) => {
  setAreasDisplayMode(position);
  switch(position) {
    case 1: // No Areas
      setShowSpecialZones(false);
      setShowNearApostles(false);
      break;
    case 2: // Main Areas
      setShowSpecialZones(true);
      setShowNearApostles(false);
      break;
    case 3: // All Areas
      setShowSpecialZones(true);
      setShowNearApostles(true);
      break;
  }
};
```

### Intelligent Disabling Logic

#### **Fixed Logic (v2.0)**
```typescript
<ThreeStateToggle
  position={areasDisplayMode}
  onChange={handleAreasDisplayModeChange}
  labels={["No Areas", "Main Areas", "All Areas"]}
  disabled={false} // ✅ Always enabled - areas can work on any scale
  disabledPositions={!hasSpaceForNearApostles ? [3] : []} // ✅ Only "All Areas" disabled when no space
  disabledPositionReason="No space available for near areas"
/>
```

#### **Previous Incorrect Logic (v1.0)**
```typescript
// ❌ WRONG - This incorrectly disabled the entire toggle for 1-3 satisfaction scales
disabled={isUsing1To3Scale}
disabledReason={isUsing1To3Scale ? "Not available with 1-3 scale" : undefined}
```

**What Changed**: The system now correctly recognizes that:
- **1-3 satisfaction × 1-7 loyalty** = Plenty of space for apostles/terrorists zones ✅
- **1-3 satisfaction × 1-3 loyalty** = Limited space, but main areas still possible ✅
- Only **"All Areas"** gets disabled when there's insufficient space for near-apostles

### Space Detection Logic
```typescript
// Correct space detection for different scenarios
const hasSpaceForMainAreas = maxSat >= 3 && maxLoy >= 3; // Always true for valid scales
const hasSpaceForNearApostles = apostlesMinSat > 1 && apostlesMinLoy > 1;

// Examples:
// 3x7 scale, midpoint (2,6): Main areas ✅, Near areas ❌  
// 5x10 scale, midpoint (3,5.5): Main areas ✅, Near areas ✅
// 7x10 scale, midpoint (2,8): Main areas ✅, Near areas ✅
```

## Label Management Logic

### Mode Dependencies
```typescript
type LabelMode = 'all' | 'quadrants' | 'sub-sections' | 'none';

// Label visibility logic
const showQuadrantLabels = labelMode === 'all' || labelMode === 'quadrants';
const showSpecialLabels = labelMode === 'all' || labelMode === 'sub-sections';

// Sub-sections mode availability
const showSubSectionsButton = showNearApostles && hasSpaceForNearApostles;
```

### Auto-switching Logic
```typescript
// Auto-switch from sub-sections when near-apostles is disabled
useEffect(() => {
  if (!showNearApostles && labelMode === 'sub-sections') {
    setLabelMode('all');
    setShowQuadrantLabels(true);
    setSpecialZoneLabels(true);
  }
}, [showNearApostles, labelMode]);
```

## Terminology System

### Classic vs Modern
```typescript
interface TerminologyMapping {
  classic: {
    apostles: 'Apostles';
    terrorists: 'Terrorists';
    near_apostles: 'Near-Apostles';
    near_terrorists: 'Near-Terrorists';
  };
  modern: {
    apostles: 'Advocates';
    terrorists: 'Trolls';
    near_apostles: 'Near-Advocates';
    near_terrorists: 'Near-Trolls';
  };
}
```

### Terminology Control Logic
```typescript
<TwoStateToggle
  leftLabel="Classic"
  rightLabel="Modern"
  value={isClassicModel ? 'left' : 'right'}
  onChange={(value: 'left' | 'right') => setIsClassicModel(value === 'left')}
  disabled={areasDisplayMode === 1} // ✅ Only disabled when no areas shown
  disabledReason={areasDisplayMode === 1 ? "Not applicable when areas are hidden" : undefined}
/>
```

**Key Fix**: Removed incorrect `isUsing1To3Scale` restriction that was preventing terminology switching on valid scales.

## Usage Examples

### Basic Usage
```tsx
function VisualizationContainer() {
  const [isClassicModel, setIsClassicModel] = useState(false);
  const [areasDisplayMode, setAreasDisplayMode] = useState<1 | 2 | 3>(2);
  const [labelMode, setLabelMode] = useState<'all' | 'quadrants' | 'sub-sections' | 'none'>('all');

  return (
    <ChartControls
      isClassicModel={isClassicModel}
      setIsClassicModel={setIsClassicModel}
      areasDisplayMode={areasDisplayMode}
      setAreasDisplayMode={setAreasDisplayMode}
      hasSpaceForNearApostles={true}
      labelMode={labelMode}
      setLabelMode={setLabelMode}
      // ... other props
    />
  );
}
```

### Advanced Configuration
```tsx
function AdvancedVisualization() {
  // State management
  const [controls, setControls] = useState({
    isClassicModel: false,
    areasDisplayMode: 2 as const,
    labelMode: 'all' as const,
    showGrid: true,
    isAdjustableMidpoint: false
  });

  // Frequency filtering
  const [frequencyFilter, setFrequencyFilter] = useState({
    enabled: false,
    threshold: 1
  });

  const frequencyData = useMemo(() => ({
    maxFrequency: Math.max(...data.map(d => d.frequency || 1)),
    hasOverlaps: data.some(d => (d.frequency || 1) > 1)
  }), [data]);

  return (
    <ChartControls
      isClassicModel={controls.isClassicModel}
      setIsClassicModel={(value) => setControls(prev => ({ ...prev, isClassicModel: value }))}
      areasDisplayMode={controls.areasDisplayMode}
      setAreasDisplayMode={(mode) => setControls(prev => ({ ...prev, areasDisplayMode: mode }))}
      hasSpaceForNearApostles={hasSpaceForNearApostles}
      labelMode={controls.labelMode}
      setLabelMode={(mode) => setControls(prev => ({ ...prev, labelMode: mode }))}
      showGrid={controls.showGrid}
      setShowGrid={(show) => setControls(prev => ({ ...prev, showGrid: show }))}
      isAdjustableMidpoint={controls.isAdjustableMidpoint}
      setIsAdjustableMidpoint={(adjustable) => setControls(prev => ({ ...prev, isAdjustableMidpoint: adjustable }))}
      frequencyFilterEnabled={frequencyFilter.enabled}
      frequencyThreshold={frequencyFilter.threshold}
      setFrequencyFilterEnabled={(enabled) => setFrequencyFilter(prev => ({ ...prev, enabled }))}
      setFrequencyThreshold={(threshold) => setFrequencyFilter(prev => ({ ...prev, threshold }))}
      frequencyData={frequencyData}
    />
  );
}
```

## Auto-switching Behaviors

### Areas Display Mode
```typescript
// Auto-switch from "All Areas" to "Main Areas" when space runs out
useEffect(() => {
  if (areasDisplayMode === 3 && !hasSpaceForNearApostles) {
    console.log('🔄 Auto-switching from "All Areas" to "Main Areas" - no space available');
    setAreasDisplayMode(2);
    handleAreasDisplayModeChange(2);
  }
}, [hasSpaceForNearApostles, areasDisplayMode]);
```

### Label Mode
```typescript
// Auto-switch from sub-sections when near-apostles becomes unavailable
useEffect(() => {
  if (!showNearApostles && labelMode === 'sub-sections') {
    setLabelMode('all');
    setShowQuadrantLabels(true);
    setSpecialZoneLabels(true);
  }
}, [showNearApostles, labelMode]);
```

## Component State Management

### Control Groups Visibility
```typescript
const renderControlGroups = () => {
  return (
    <>
      {/* Display Group - Always visible */}
      <DisplayGroup />
      
      {/* Labels Group - Always visible */}
      <LabelsGroup />
      
      {/* Frequency Group - Only when overlaps exist */}
      {frequencyData.hasOverlaps && <FrequencyGroup />}
      
      {/* Terminology Group - Always visible */}
      <TerminologyGroup />
    </>
  );
};
```

### Collapsible Interface
```typescript
const [isCollapsed, setIsCollapsed] = useState(false);

const toggleCollapse = () => {
  setIsCollapsed(!isCollapsed);
};
```

## Styling System

### CSS Structure
```css
.chart-controls-wrapper {
  /* Main container */
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.chart-controls-header {
  /* Collapsible header */
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
}

.chart-controls {
  /* Controls container */
  padding: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.control-group {
  /* Individual control sections */
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}

.control-section-title {
  /* Group headers */
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #333;
}

.control-group-content {
  /* Control content area */
  display: flex;
  flex-direction: column;
  gap: 12px;
}
```

### Responsive Design
```css
@media (max-width: 768px) {
  .chart-controls-wrapper {
    width: 100%;
    max-width: none;
  }
  
  .control-group-content {
    gap: 8px;
  }
  
  .labels-buttons {
    flex-wrap: wrap;
  }
}
```

## Testing Strategies

### Unit Tests
```typescript
describe('ChartControls', () => {
  test('areas display mode disabling works correctly', () => {
    const { getByTestId } = render(
      <ChartControls 
        hasSpaceForNearApostles={false}
        areasDisplayMode={2}
        // ... other props
      />
    );
    
    const allAreasButton = getByTestId('areas-toggle-3');
    expect(allAreasButton).toBeDisabled();
    
    const mainAreasButton = getByTestId('areas-toggle-2');
    expect(mainAreasButton).toBeEnabled();
  });
  
  test('terminology switch disabled when no areas shown', () => {
    const { getByTestId } = render(
      <ChartControls 
        areasDisplayMode={1}
        // ... other props
      />
    );
    
    const terminologyToggle = getByTestId('terminology-toggle');
    expect(terminologyToggle).toBeDisabled();
  });
  
  test('auto-switching from all areas when space unavailable', () => {
    const mockSetAreasDisplayMode = jest.fn();
    
    const { rerender } = render(
      <ChartControls 
        hasSpaceForNearApostles={true}
        areasDisplayMode={3}
        setAreasDisplayMode={mockSetAreasDisplayMode}
        // ... other props
      />
    );
    
    // Simulate space becoming unavailable
    rerender(
      <ChartControls 
        hasSpaceForNearApostles={false}
        areasDisplayMode={3}
        setAreasDisplayMode={mockSetAreasDisplayMode}
        // ... other props
      />
    );
    
    expect(mockSetAreasDisplayMode).toHaveBeenCalledWith(2);
  });
});
```

### Integration Tests
```typescript
describe('ChartControls Integration', () => {
  test('changing areas mode updates visualization correctly', () => {
    const { getByTestId } = render(<FullVisualizationWithControls />);
    
    // Click "No Areas" mode
    fireEvent.click(getByTestId('areas-toggle-1'));
    
    // Verify special zones are hidden
    expect(queryByTestId('apostles-zone')).not.toBeInTheDocument();
    expect(queryByTestId('terrorists-zone')).not.toBeInTheDocument();
  });
  
  test('label mode changes affect visibility correctly', () => {
    const { getByTestId } = render(<FullVisualizationWithControls />);
    
    // Click "Quadrants" label mode
    fireEvent.click(getByTestId('label-mode-quadrants'));
    
    // Verify only quadrant labels are visible
    expect(getByTestId('loyalists-label')).toBeVisible();
    expect(queryByTestId('apostles-label')).not.toBeInTheDocument();
  });
});
```

## Accessibility Features

### ARIA Support
```typescript
<div 
  role="region"
  aria-label="Chart controls"
  aria-expanded={!isCollapsed}
>
  <button
    aria-controls="chart-controls-content"
    aria-expanded={!isCollapsed}
    onClick={toggleCollapse}
  >
    Controls
  </button>
  
  <div 
    id="chart-controls-content"
    aria-hidden={isCollapsed}
  >
    {/* Control groups */}
  </div>
</div>
```

### Keyboard Navigation
```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Escape':
      if (!isCollapsed) {
        setIsCollapsed(true);
      }
      break;
    case 'Enter':
    case ' ':
      if (e.target === headerRef.current) {
        toggleCollapse();
        e.preventDefault();
      }
      break;
  }
};
```

## Performance Optimizations

### Memoized Callbacks
```typescript
const handleAreasDisplayModeChange = useCallback((position: AreasDisplayMode) => {
  setAreasDisplayMode(position);
  switch(position) {
    case 1:
      setShowSpecialZones(false);
      setShowNearApostles(false);
      break;
    case 2:
      setShowSpecialZones(true);
      setShowNearApostles(false);
      break;
    case 3:
      setShowSpecialZones(true);
      setShowNearApostles(true);
      break;
  }
}, [setAreasDisplayMode, setShowSpecialZones, setShowNearApostles]);
```

### Efficient Re-renders
```typescript
const MemoizedControlGroup = React.memo(({ title, children, icon }) => (
  <div className="control-group">
    <div className="control-section-title">
      {icon}
      <span>{title}</span>
    </div>
    <div className="control-group-content">
      {children}
    </div>
  </div>
));
```

## Error Handling

### Validation
```typescript
const validateAreasDisplayMode = (mode: number): mode is AreasDisplayMode => {
  return [1, 2, 3].includes(mode);
};

const safeSetAreasDisplayMode = (mode: number) => {
  if (validateAreasDisplayMode(mode)) {
    setAreasDisplayMode(mode);
  } else {
    console.warn(`Invalid areas display mode: ${mode}`);
    setAreasDisplayMode(2); // Fallback to Main Areas
  }
};
```

### Edge Case Handling
```typescript
// Handle case where hasSpaceForNearApostles changes unexpectedly
useEffect(() => {
  if (areasDisplayMode === 3 && !hasSpaceForNearApostles) {
    console.log('🔄 Auto-switching from "All Areas" to "Main Areas" - no space available');
    setAreasDisplayMode(2);
  }
}, [hasSpaceForNearApostles, areasDisplayMode]);
```

## Dependencies
- React
- lucide-react (for icons)
- Switch component
- TwoStateToggle component  
- ThreeStateToggle component
- FrequencySlider component

## Related Components
- [Switch](../ui/Switch.md)
- [TwoStateToggle](../ui/TwoStateToggle.md)
- [ThreeStateToggle](../ui/ThreeStateToggle.md)
- [FrequencySlider](./FrequencySlider.md)
- [QuadrantChart](./QuadrantChart.md)

## Changelog
| Version | Changes |
|---------|---------|
| 1.0.0   | Initial implementation |
| 1.1.0   | Added frequency filtering |
| 1.2.0   | Added collapsible interface |
| 1.3.0   | Added label mode control |
| **2.0.0** | **Fixed scale restriction logic - removed incorrect 1-3 scale disabling** |

## Notes
- **v2.0 Fix**: Controls are now properly enabled for all valid scale combinations
- Areas display mode intelligently disables only unavailable options
- Terminology controls work correctly regardless of satisfaction scale range
- Auto-switching prevents invalid states
- Consider mobile-first approach for responsive design
- Document control interdependencies for future maintenance

---

*Document Version: 2.0*  
*Last Updated: January 2025*  
*Status: Production Ready ✅*  
*Critical Fix: Removed incorrect scale restrictions ✅*