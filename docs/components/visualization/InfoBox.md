# InfoBox Component

## Overview
The InfoBox component displays detailed information about selected data points in the Apostles Model visualization. It provides a floating information panel with point details, group assignment options, and multi-point information when points overlap.

## Features
- Detailed data point information
- Group reassignment interface
- Multiple point information display
- Dynamic positioning
- Boundary point handling
- Interactive controls
- Smooth transitions
- Click-away handling

## Interface

### Props
```typescript
interface InfoBoxProps {
  /** The data point to display information for */
  point: DataPoint;
  
  /** Normalized position coordinates */
  normalized: {
    x: number;
    y: number;
  };
  
  /** Current quadrant information */
  quadrantInfo: QuadrantOption;
  
  /** Number of points at this position */
  count: number;
  
  /** Array of points at same position */
  samePoints: DataPoint[];
  
  /** Available quadrant options for boundary points */
  availableOptions?: QuadrantOption[];
  
  /** Callback for group changes */
  onGroupChange?: (group: QuadrantOption) => void;
}

interface QuadrantOption {
  /** Group identifier */
  group: string;
  
  /** Color for visual representation */
  color: string;
}
```

## Usage

### Basic Usage
```tsx
function DataPointVisualization() {
  return (
    <InfoBox
      point={selectedPoint}
      normalized={{ x: 50, y: 75 }}
      quadrantInfo={{
        group: 'Loyalists',
        color: '#4CAF50'
      }}
      count={1}
      samePoints={[selectedPoint]}
    />
  );
}
```

### With Group Reassignment
```tsx
function BoundaryPointInfo() {
  const options = [
    { group: 'Loyalists', color: '#4CAF50' },
    { group: 'Mercenaries', color: '#F7B731' }
  ];

  return (
    <InfoBox
      point={boundaryPoint}
      normalized={{ x: 50, y: 50 }}
      quadrantInfo={options[0]}
      count={1}
      samePoints={[boundaryPoint]}
      availableOptions={options}
      onGroupChange={handleGroupChange}
    />
  );
}
```

## Component Structure

### Main Sections
1. Header Section
   - Point name
   - Point ID
2. Main Info Section
   - Group assignment
   - Satisfaction score
   - Loyalty score
3. Group Reassignment (when applicable)
   - Available options
   - Selection controls
4. Multiple Points Section (when applicable)
   - Point list
   - Count information

### HTML Structure
```html
<div class="data-point-info">
  <div class="data-point-info__header">
    <div class="data-point-info__title">{point.name}</div>
    <div class="data-point-info__id">ID: {point.id}</div>
  </div>
  
  <div class="data-point-info__content">
    <div class="data-point-info__grid">
      <!-- Main information grid -->
    </div>
    
    {availableOptions && (
      <div class="data-point-info__boundary">
        <!-- Group reassignment options -->
      </div>
    )}
    
    {count > 1 && (
      <div class="data-point-info__multiple">
        <!-- Multiple points information -->
      </div>
    )}
  </div>
</div>
```

## Positioning Logic

### Position Calculation
```typescript
const calculatePosition = (
  normalized: { x: number; y: number }
): React.CSSProperties => ({
  left: `${normalized.x}%`,
  bottom: `${normalized.y + 5}%`,
  transform: 'translate(-50%, 0)'
});
```

### Boundary Detection
```typescript
const adjustForBoundaries = (
  position: React.CSSProperties,
  containerRect: DOMRect
): React.CSSProperties => {
  // Adjust position to keep InfoBox within viewport
  return adjustedPosition;
};
```

## Interaction Handling

### Click Away
```typescript
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (!boxRef.current?.contains(e.target as Node)) {
      onClose?.();
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

### Group Change
```typescript
const handleGroupChange = (option: QuadrantOption) => {
  onGroupChange?.(option);
};
```

## Styling

### Core Styles
```css
.data-point-info {
  position: absolute;
  background-color: white;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 3000;
  min-width: 240px;
}

.data-point-info__header {
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.data-point-info__grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
}
```

## Animation

### Transition Styles
```css
.data-point-info {
  opacity: 0;
  transform: translate(-50%, 10px);
  animation: slideIn 0.2s ease forwards;
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
```

## Accessibility

### ARIA Attributes
```tsx
<div
  role="dialog"
  aria-labelledby="info-title"
  aria-describedby="info-content"
  className="data-point-info"
>
  <h3 id="info-title">{point.name}</h3>
  <div id="info-content">
    {/* Content */}
  </div>
</div>
```

### Keyboard Navigation
- Escape to close
- Tab through options
- Enter to select
- Arrow keys for navigation

## Edge Cases

### Position Handling
- Screen edge detection
- Scroll position adjustment
- Window resize handling
- Mobile viewport adaptation

### Content Management
- Long text handling
- Multiple points display
- Empty values
- Error states

## Performance

### Optimization Techniques
- Memoized calculations
- Efficient re-renders
- Animation performance
- DOM updates

## Related Components
- [DataPointRenderer](./DataPointRenderer.md)
- [QuadrantChart](./QuadrantChart.md)

## Changelog
| Version | Changes |
|---------|---------|
| 1.0.0   | Initial implementation |
| 1.1.0   | Added group reassignment |
| 1.2.0   | Added multiple points display |
| 1.3.0   | Improved positioning logic |

## Notes
- Consider z-index management
- Handle transition states
- Monitor performance impact
- Document style customization
- Consider mobile interactions
