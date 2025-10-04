# SpecialZones Component

## Overview
The SpecialZones component manages the visualization of specialized zones in the Apostles Model, including the Apostles/Advocates zone, Terrorists/Trolls zone, and Near-apostles zones. It provides interactive resizing capabilities and dynamic zone management based on available space.

## Features
- Dynamic zone sizing
- Interactive resize handles
- Near-apostles zone management
- Zone labeling system
- Dynamic positioning
- Classic/Modern terminology
- Responsive layout
- Interactive controls

## Interface

### Props
```typescript
interface SpecialZonesProps {
  /** Grid dimensions for positioning */
  dimensions: GridDimensions;
  
  /** Current zone sizes */
  zoneSizes: ZoneSizes;
  
  /** Current midpoint position */
  position: Position;
  
  /** Maximum allowed sizes */
  maxSizes: {
    apostles: number;
    terrorists: number;
  };
  
  /** Near-apostles zone visibility */
  showNearApostles: boolean;
  
  /** Toggle between classic and modern terms */
  isClassicModel: boolean;
  
  /** Label visibility */
  showLabels: boolean;
  
  /** Resize handle visibility */
  showHandles: boolean;
  
  /** Resize event handlers */
  onResizeStart: (zone: 'apostles' | 'terrorists') => void;
  onResize: (newSizes: ZoneSizes) => void;
}

interface ZoneSizes {
  apostles: number;
  terrorists: number;
}
```

## Usage

### Basic Usage
```tsx
function VisualizationComponent() {
  return (
    <SpecialZones
      dimensions={dimensions}
      zoneSizes={{ apostles: 1, terrorists: 1 }}
      position={{ x: 50, y: 50 }}
      maxSizes={{ apostles: 2, terrorists: 2 }}
      showNearApostles={true}
      isClassicModel={true}
      showLabels={true}
      showHandles={true}
      onResizeStart={handleResizeStart}
      onResize={handleResize}
    />
  );
}
```

### With Modern Terms
```tsx
function ModernVisualization() {
  return (
    <SpecialZones
      dimensions={dimensions}
      zoneSizes={zoneSizes}
      position={position}
      maxSizes={maxSizes}
      showNearApostles={true}
      isClassicModel={false}
      showLabels={true}
      showHandles={true}
      onResizeStart={handleResizeStart}
      onResize={handleResize}
    />
  );
}
```

## Component Structure

### Main Elements
1. Apostles/Advocates Zone
2. Terrorists/Trolls Zone
3. Near-apostles Zones
4. Resize Handles
5. Zone Labels

### HTML Structure
```html
<div class="special-zones">
  <!-- Near-apostles layer -->
  <div class="near-apostles-layer">
    {nearApostlesZones}
  </div>

  <!-- Main zones layer -->
  <div class="special-zones-layer">
    <!-- Apostles zone -->
    <div class="special-zone apostles">
      <div class="zone-label">
        {isClassicModel ? 'Apostles' : 'Advocates'}
      </div>
      <div class="resize-handle apostles-handle" />
    </div>

    <!-- Terrorists zone -->
    <div class="special-zone terrorists">
      <div class="zone-label">
        {isClassicModel ? 'Terrorists' : 'Trolls'}
      </div>
      <div class="resize-handle terrorists-handle" />
    </div>
  </div>
</div>
```

## Zone Management

### Near-apostles Calculation
```typescript
const calculateNearApostlesPositions = (
  showNearApostles: boolean,
  apostlesSize: number,
  dimensions: GridDimensions
): ZonePosition[] => {
  if (!showNearApostles) return [];

  const positions = [];
  const { cellWidth, cellHeight, totalRows } = dimensions;

  if (apostlesSize === 1) {
    // Single cell Apostles positions
    positions.push(
      // C1 position
      {
        bottom: `${(totalRows - 2) * cellHeight}%`,
        right: `${cellWidth}%`,
        width: `${cellWidth}%`,
        height: `${cellHeight}%`
      },
      // Additional positions...
    );
  } else {
    // Multi-cell Apostles positions
    // Left column and bottom row calculations...
  }

  return positions;
};
```

### Zone Positioning
```typescript
const calculateZonePositions = (
  dimensions: GridDimensions,
  zoneSizes: ZoneSizes
): ZoneStyles => {
  const { cellWidth, cellHeight } = dimensions;
  
  return {
    apostles: {
      top: 0,
      right: 0,
      width: `${zoneSizes.apostles * cellWidth}%`,
      height: `${zoneSizes.apostles * cellHeight}%`
    },
    terrorists: {
      bottom: 0,
      left: 0,
      width: `${zoneSizes.terrorists * cellWidth}%`,
      height: `${zoneSizes.terrorists * cellHeight}%`
    }
  };
};
```

## Interaction Handling

### Resize Handling
```typescript
const handleResizeStart = (zone: 'apostles' | 'terrorists') => (
  e: React.MouseEvent
) => {
  e.preventDefault();
  e.stopPropagation();
  onResizeStart(zone);
};
```

### Style Generation
```typescript
const generateZoneStyles = (
  zone: 'apostles' | 'terrorists',
  size: number,
  dimensions: GridDimensions
): React.CSSProperties => {
  const { cellWidth, cellHeight } = dimensions;
  
  return zone === 'apostles' 
    ? {
        top: 0,
        right: 0,
        width: `${size * cellWidth}%`,
        height: `${size * cellHeight}%`
      }
    : {
        bottom: 0,
        left: 0,
        width: `${size * cellWidth}%`,
        height: `${size * cellHeight}%`
      };
};
```

## Styling

### Core Styles
```css
.special-zones {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;
}

.special-zone {
  position: absolute;
  pointer-events: all;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.apostles {
  background-color: rgba(76, 175, 80, 0.4);
  border: 2px solid rgba(76, 175, 80, 0.5);
}

.terrorists {
  background-color: rgba(244, 67, 54, 0.4);
  border: 2px solid rgba(244, 67, 54, 0.5);
}
```

## Performance

### Optimization Techniques
- Memoized calculations
- Efficient transitions
- Layer management
- Render optimization

## Edge Cases

### Space Management
- Maximum size limits
- Minimum size constraints
- Overlap prevention
- Boundary handling

### Visual States
- Hidden labels
- Disabled handles
- Scale transitions
- Mobile layout

## Related Components
- [QuadrantChart](./QuadrantChart.md)
- [GridSystem](./GridSystem.md)
- [ResizeHandles](./ResizeHandles.md)

## Changelog
| Version | Changes |
|---------|---------|
| 1.0.0   | Initial implementation |
| 1.1.0   | Added near-apostles zones |
| 1.2.0   | Added resize handles |
| 1.3.0   | Added modern terminology |

## Notes
- Consider touch interactions
- Maintain z-index hierarchy
- Document resize constraints
- Handle window resizing
- Consider accessibility improvements
- Monitor performance impact
