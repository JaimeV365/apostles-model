# QuadrantChart Component

[Previous sections remain the same until Container Layout...]

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
- Grid maintains fixed size for stability
- Only container padding adjusts for UI elements
- Consistent right-side spacing (40px)
- Automatic padding management for scale/legend visibility
- Non-overlapping element placement

### Element Positioning
- Grid lines align with cell boundaries
- Data points position exactly on intersections
- Quadrant backgrounds match grid cells
- Scale numbers and legends have dedicated spaces

[Rest of the document remains the same...]