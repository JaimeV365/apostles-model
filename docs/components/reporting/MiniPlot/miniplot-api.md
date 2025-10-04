# MiniPlot API Documentation

## Overview

The MiniPlot component provides a compact, interactive scatter plot visualization for response combination data with **real-time color synchronization**, multi-tier display, average position indicators, and dynamic scale formats.

## Component Interface

### Props

```typescript
interface MiniPlotProps {
  /** Array of data combinations to display */
  combinations: Array<{
    satisfaction: number;
    loyalty: number;
    count: number;
    percentage: number;
    tier?: number;        // Optional tier assignment (1-3)
    opacity?: number;     // Optional opacity override
    size?: number;        // Optional size override (unused - controlled by CSS)
  }>;
  
  /** Satisfaction scale format (e.g., "1-5", "0-10") */
  satisfactionScale: string;
  
  /** Loyalty scale format (e.g., "1-5", "0-10") */
  loyaltyScale: string;
  
  /** Optional: Whether to use quadrant-based colors */
  useQuadrantColors?: boolean;
  
  /** Optional: Custom colors configuration */
  customColors?: Record<string, string>;
  
  /** Optional: Average position data for reference point */
  averagePoint?: {
    satisfaction: number;
    loyalty: number;
  };
  
  /** Optional: Whether to show the average position dot */
  showAverageDot?: boolean;
  
  /** 
   * CRITICAL: Color function from parent for real-time synchronization
   * This function connects to QuadrantAssignmentContext and handles
   * real point resolution for manual assignments
   */
  getPointColor?: (satisfaction: number, loyalty: number) => string;
}
```

## Usage Examples

### Basic Usage (Standalone)

```tsx
<MiniPlot
  combinations={report.mostCommonCombos}
  satisfactionScale="1-5"
  loyaltyScale="1-5"
/>
```

### With Color Synchronization (Recommended)

```tsx
// Parent component (ResponseConcentrationSection) provides color function
<MiniPlot
  combinations={enhancedCombinations}
  satisfactionScale="1-5"
  loyaltyScale="1-5"
  getPointColor={getPointColor}  // ← CRITICAL for real-time sync
  useQuadrantColors={settings.miniPlot.useQuadrantColors}
  averagePoint={averagePosition}
  showAverageDot={settings.miniPlot.showAverageDot}
/>
```

### With Average Position Reference

```tsx
<MiniPlot
  combinations={enhancedCombinations}
  satisfactionScale="0-10"
  loyaltyScale="0-10"
  averagePoint={{
    satisfaction: 6.2,
    loyalty: 7.1
  }}
  showAverageDot={true}
  getPointColor={contextConnectedColorFunction}
/>
```

### With Premium Customization

```tsx
<MiniPlot
  combinations={filteredCombinations}
  satisfactionScale="1-5"
  loyaltyScale="1-10"
  useQuadrantColors={false}
  customColors={{
    default: '#3a863e'
  }}
  averagePoint={averagePosition}
  showAverageDot={settings.miniPlot.showAverageDot}
  getPointColor={getPointColor}  // Still recommended for consistency
/>
```

### With Multi-Tier Data

```tsx
// Enhanced combinations with tier assignments
const tieredCombinations = [
  { satisfaction: 4, loyalty: 4, count: 5, percentage: 25, tier: 1, opacity: 1 },
  { satisfaction: 3, loyalty: 3, count: 3, percentage: 15, tier: 2, opacity: 0.7 },
  { satisfaction: 2, loyalty: 2, count: 2, percentage: 10, tier: 3, opacity: 0.5 }
];

<MiniPlot
  combinations={tieredCombinations}
  satisfactionScale="1-5"
  loyaltyScale="1-5"
  useQuadrantColors={true}
  getPointColor={getPointColor}
/>
```

## Color System Architecture

### Color Resolution Priority

The MiniPlot uses a sophisticated color resolution system:

```typescript
const getPointColorFinal = (satisfaction: number, loyalty: number) => {
  // 1. HIGHEST PRIORITY: Parent-provided color function (context-connected)
  if (getPointColor) {
    return getPointColor(satisfaction, loyalty);
  }
  
  // 2. FALLBACK: Internal logic (standalone mode)
  if (!useQuadrantColors && customColors?.default) {
    return customColors.default;
  }
  
  // 3. LAST RESORT: Hardcoded quadrant colors (deprecated)
  const midpoint = 2.5;
  if (satisfaction >= midpoint && loyalty >= midpoint) return '#4CAF50';
  if (satisfaction >= midpoint && loyalty < midpoint) return '#f59e0b';
  if (satisfaction < midpoint && loyalty >= midpoint) return '#4682b4';
  return '#dc2626';
};
```

**Recommended Pattern**: Always provide `getPointColor` prop for real-time synchronization.

### Color Synchronization Benefits

When used with `getPointColor` prop:
- **Real-time updates** when midpoint changes
- **Manual assignment reflection** instantly
- **Perfect consistency** with main visualization
- **Automatic handling** of special zones and custom logic

## Component Structure

### Main Container

```tsx
<div className="mini-plot">
  {/* Y-Axis */}
  <div className="mini-plot-y-axis">
    <div className="mini-plot-y-label">Loyalty</div>
    <div className="mini-plot-y-ticks">
      {/* Dynamic tick generation based on scale */}
    </div>
  </div>

  {/* Plot Area */}
  <div className="mini-plot-area">
    {/* Grid Lines */}
    <div className="mini-plot-grid">
      {/* Dynamic grid based on scale range */}
    </div>
    
    {/* Average Point (conditional) */}
    {averagePoint && showAverageDot && (
      <div className="mini-plot-point mini-plot-point--average" />
    )}
    
    {/* Data Points */}
    {combinations.map((combo, index) => (
      <div
        key={index}
        className={`mini-plot-point ${combo.tier ? `mini-plot-point--tier${combo.tier}` : ''}`}
        style={{
          left: `${x}%`,
          bottom: `${y}%`,
          backgroundColor: getPointColorFinal(combo.satisfaction, combo.loyalty)
        }}
      />
    ))}
  </div>

  {/* X-Axis */}
  <div className="mini-plot-x-axis">
    <div className="mini-plot-x-ticks">
      {/* Dynamic tick generation based on scale */}
    </div>
    <div className="mini-plot-x-label">Satisfaction</div>
  </div>
</div>
```

## Scale Support

### Dynamic Scale Parsing

The component automatically handles any "min-max" scale format:

```typescript
// Supports: "1-5", "0-10", "1-7", "0-100", etc.
const [satisfactionMin, satisfactionMax] = satisfactionScale.split('-').map(Number);
const [loyaltyMin, loyaltyMax] = loyaltyScale.split('-').map(Number);

// Dynamic positioning calculation
const x = (combo.satisfaction - satisfactionMin) / (satisfactionMax - satisfactionMin) * 100;
const y = (combo.loyalty - loyaltyMin) / (loyaltyMax - loyaltyMin) * 100;
```

### Tick Generation

```typescript
// Y-axis ticks (loyalty)
{[...Array(loyaltyMax - loyaltyMin + 1)].map((_, i) => (
  <div key={i} className="mini-plot-tick">
    {loyaltyMin + i}
  </div>
))}

// X-axis ticks (satisfaction)  
{[...Array(satisfactionMax - satisfactionMin + 1)].map((_, i) => (
  <div key={i} className="mini-plot-tick">
    {satisfactionMin + i}
  </div>
))}
```

### Supported Scale Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| `"1-5"` | Traditional Likert scale | Standard surveys |
| `"0-10"` | NPS-style scale | Net Promoter Score |
| `"1-7"` | Extended Likert | Detailed assessments |
| `"0-100"` | Percentage scale | Satisfaction percentages |

## Styling System

### Base Point Styling

```css
.mini-plot-point {
  position: absolute;
  width: 12px;                    /* Fixed base size */
  height: 12px;                   /* Fixed base size */
  transform: translate(-50%, 50%);
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.mini-plot-point:hover {
  transform: translate(-50%, 50%) scale(1.2);
  z-index: 10;
}
```

### Tier-Based Styling

```css
/* 
 * Tier sizing values should match tierSizes.ts:
 * tier1: 1, tier2: 0.9, tier3: 0.85 
 */
.mini-plot-point--tier1 {
  opacity: 1;
  transform: translate(-50%, 50%) scale(1);      /* 100% */
}

.mini-plot-point--tier2 {
  opacity: 0.7;
  transform: translate(-50%, 50%) scale(0.9);    /* 90% */
}

.mini-plot-point--tier3 {
  opacity: 0.5;
  transform: translate(-50%, 50%) scale(0.85);   /* 85% */
}

/* Hover states with proportional scaling */
.mini-plot-point--tier1:hover {
  transform: translate(-50%, 50%) scale(1.2);    /* 120% */
}

.mini-plot-point--tier2:hover {
  transform: translate(-50%, 50%) scale(1.1);    /* 110% */
}

.mini-plot-point--tier3:hover {
  transform: translate(-50%, 50%) scale(1.05);   /* 105% */
}
```

### Average Position Indicator

```css
.mini-plot-point--average {
  width: 8px;
  height: 8px;
  background-color: white;
  border: 2px solid #dc2626;
  filter: drop-shadow(0 0 3px rgba(220, 38, 38, 0.6));
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.2);
  z-index: 10;
}
```

### Grid System

```css
.mini-plot-grid-line {
  position: absolute;
  background-color: #f8fafc;
}

.mini-plot-grid-line.horizontal {
  left: 0;
  right: 0;
  height: 1px;
}

.mini-plot-grid-line.vertical {
  top: 0;
  bottom: 0;
  width: 1px;
}
```

## Integration Patterns

### With ResponseConcentrationSection

```typescript
// Parent component creates context-connected color function
const getPointColor = (satisfaction: number, loyalty: number): string => {
  // Real point resolution logic
  const candidatePoints = originalData.filter(p => 
    p.satisfaction === satisfaction && p.loyalty === loyalty && !p.excluded
  );
  
  const realPoint = candidatePoints.find(p => manualAssignments.has(p.id)) || candidatePoints[0];
  
  if (realPoint) {
    return getColorForQuadrant(getQuadrantForPoint(realPoint));
  }
  
  return fallbackColor;
};

// Pass to MiniPlot
<MiniPlot getPointColor={getPointColor} {...otherProps} />
```

### Standalone Usage

```typescript
// When used without context integration
<MiniPlot
  combinations={data}
  satisfactionScale="1-5"
  loyaltyScale="1-5"
  useQuadrantColors={true}
  // No getPointColor prop - uses internal fallback logic
/>
```

## Performance Considerations

### Rendering Optimization

- **CSS-based sizing**: No inline style calculations for point sizes
- **Transform-based positioning**: Hardware-accelerated rendering
- **Minimal re-renders**: Only updates when props actually change
- **Grid caching**: Grid lines generated once per scale change

### Memory Usage

- **No data duplication**: References original combination objects
- **Efficient DOM structure**: Minimal element nesting
- **CSS classes over inline styles**: Reduced memory footprint

### Scale Performance

| Dataset Size | Performance | Notes |
|--------------|-------------|-------|
| < 20 points | Excellent | No optimization needed |
| 20-50 points | Very Good | Standard performance |
| 50-100 points | Good | Consider debouncing updates |
| > 100 points | Monitor | May need virtualization |

## Accessibility Features

### ARIA Support

```tsx
<div 
  className="mini-plot-area"
  role="img"
  aria-label={`Scatter plot showing ${combinations.length} response combinations`}
>
  {/* Points with meaningful titles */}
  <div
    className="mini-plot-point"
    title={`Satisfaction: ${combo.satisfaction}, Loyalty: ${combo.loyalty} (${combo.count} responses)`}
    aria-label={`Data point at satisfaction ${combo.satisfaction}, loyalty ${combo.loyalty}`}
  />
</div>
```

### Keyboard Navigation

- **Focus management**: Points are focusable with keyboard navigation
- **Screen reader support**: Meaningful aria labels and titles
- **High contrast**: Sufficient contrast ratios for all color combinations

## Testing Strategies

### Unit Testing

```typescript
describe('MiniPlot', () => {
  it('renders all combinations as points', () => {
    const combinations = [
      { satisfaction: 4, loyalty: 4, count: 5, percentage: 25 }
    ];
    
    render(<MiniPlot combinations={combinations} satisfactionScale="1-5" loyaltyScale="1-5" />);
    
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });
  
  it('uses getPointColor prop when provided', () => {
    const mockGetPointColor = jest.fn().mockReturnValue('#ff0000');
    
    render(
      <MiniPlot 
        combinations={mockCombinations}
        satisfactionScale="1-5"
        loyaltyScale="1-5"
        getPointColor={mockGetPointColor}
      />
    );
    
    expect(mockGetPointColor).toHaveBeenCalledWith(4, 4);
  });
  
  it('handles different scale formats correctly', () => {
    render(
      <MiniPlot 
        combinations={mockCombinations}
        satisfactionScale="0-10"
        loyaltyScale="0-10"
      />
    );
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
```

### Integration Testing

```typescript
describe('MiniPlot Color Synchronization', () => {
  it('updates colors when getPointColor prop changes', () => {
    const { rerender } = render(<MiniPlot getPointColor={() => '#ff0000'} {...props} />);
    
    rerender(<MiniPlot getPointColor={() => '#00ff00'} {...props} />);
    
    // Verify color change reflected in DOM
  });
});
```

## Troubleshooting

### Common Issues

**1. Colors Not Updating**
- **Symptom**: MiniPlot shows static colors despite context changes
- **Cause**: Missing `getPointColor` prop
- **Solution**: Ensure parent provides color function prop

**2. Scale Display Issues**
- **Symptom**: Incorrect tick marks or positioning
- **Cause**: Invalid scale format or calculation error
- **Solution**: Verify scale prop format ("min-max") and check calculations

**3. Average Position Not Visible**
- **Symptom**: Red average dot doesn't appear
- **Cause**: Setting disabled or premium access issue
- **Solution**: Check `showAverageDot` prop and premium status

**4. Performance Issues**
- **Symptom**: Slow rendering or lag
- **Cause**: Large dataset without optimization
- **Solution**: Consider debouncing parent updates or reducing combination count

### Debug Information

```typescript
// Add debug logging for troubleshooting
console.log('MiniPlot props:', {
  combinationsCount: combinations.length,
  satisfactionScale,
  loyaltyScale,
  hasGetPointColor: !!getPointColor,
  useQuadrantColors,
  showAverageDot
});
```

## Browser Compatibility

- **Chrome 80+**: Full support
- **Firefox 76+**: Full support  
- **Safari 13.1+**: Full support
- **Edge 80+**: Full support
- **Mobile**: Responsive design works on all modern mobile browsers

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2023-09-01 | Initial implementation |
| 1.1.0 | 2023-10-15 | Added tier support and CSS optimization |
| 1.2.0 | 2024-01-20 | Enhanced scale support and average position |
| 1.3.0 | 2024-03-10 | Performance improvements and accessibility |
| **2.0.0** | **2025-01-14** | Multi-tier visualization, enhanced styling |
| **2.1.0** | **2025-01-22** | **CRITICAL**: Real-time color synchronization via `getPointColor` prop |

## Future Enhancements

### Planned Features
- **Enhanced tooltips**: Rich information display on hover
- **Animation support**: Smooth transitions for data updates
- **Export capabilities**: SVG/PNG export functionality
- **Mobile optimization**: Enhanced touch interactions

### Advanced Customization
- **Custom point shapes**: Beyond circular points
- **Advanced theming**: Dark mode support
- **Interactive features**: Click handlers and selection state
- **Zoom and pan**: For large datasets

## Best Practices

### Implementation Guidelines

**DO:**
- Always provide `getPointColor` prop for color synchronization
- Use semantic scale formats ("min-max")
- Implement proper accessibility attributes
- Test with different scale ranges
- Monitor performance with large datasets

**DON'T:**
- Rely on hardcoded color logic when context is available
- Use invalid scale formats
- Skip accessibility considerations
- Ignore performance implications
- Mix different color systems

### Integration Recommendations

1. **Always connect to context** when used in ResponseConcentrationSection
2. **Provide meaningful props** for standalone usage
3. **Test color synchronization** thoroughly
4. **Consider performance** for your specific dataset size
5. **Implement proper error boundaries** for resilient operation

## Conclusion

The MiniPlot component serves as a versatile, high-performance visualization tool with sophisticated color synchronization capabilities. When properly integrated with the color context system, it provides seamless real-time updates and perfect consistency with other visualization components.

The component's architecture balances flexibility for standalone usage with powerful integration capabilities, making it suitable for both simple displays and complex, context-aware visualizations.
  