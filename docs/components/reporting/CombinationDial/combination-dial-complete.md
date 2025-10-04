# CombinationDial Component API Documentation

Save this file at: `/docs/components/reporting/CombinationDial/API.md`

## Overview
The CombinationDial component provides a gauge-style visualization for displaying response intensity metrics in the Response Concentration section. It shows the distribution of most common satisfaction and loyalty values using semi-circular dials with customizable colors and ranges.

## Location
```
/components/reporting/components/CombinationDial/
├── index.tsx
└── styles.css
```

## Props Interface
```typescript
interface CombinationDialProps {
  /** Statistics data for both metrics */
  statistics: {
    satisfaction: {
      distribution: Record<number, number>;
      average: number;
      mode: number;
    };
    loyalty: {
      distribution: Record<number, number>;
      average: number;
      mode: number;
    };
  };
  
  /** Total number of entries for percentage calculations */
  totalEntries: number;
  
  /** Optional: Premium mode flag */
  isPremium?: boolean;
  
  /** Optional: Minimum value for the dial scale */
  minValue?: number;
  
  /** Optional: Maximum value for the dial scale */
  maxValue?: number;
  
  /** Optional: Custom colors for the dials */
  customColors?: {
    satisfaction: string;
    loyalty: string;
  };
}
```

## Usage Examples

### Basic Usage
```tsx
<CombinationDial
  statistics={report.statistics}
  totalEntries={report.totalEntries}
/>
```

### With Premium Features
```tsx
<CombinationDial
  statistics={report.statistics}
  totalEntries={report.totalEntries}
  isPremium={true}
  minValue={0}
  maxValue={100}
  customColors={{
    satisfaction: '#3a863e',
    loyalty: '#4682b4'
  }}
/>
```

## Component Structure

### Main Layout
```tsx
<div className="combination-dial">
  {/* Dial Title */}
  <div className="dial-title">Response Intensity</div>
  
  {/* Dial Container */}
  <div className="dial-container">
    <PieChart width={200} height={120}>
      {/* Outer Dial (Satisfaction) */}
      <Pie
        data={satisfactionData}
        dataKey="value"
        cx={100}
        cy={100}
        startAngle={180}
        endAngle={0}
        innerRadius={60}
        outerRadius={80}
        cornerRadius={5}
      >
        <Cell fill={satisfactionColor} />
        <Cell fill="#e5e7eb" />
      </Pie>

      {/* Inner Dial (Loyalty) */}
      <Pie
        data={loyaltyData}
        dataKey="value"
        cx={100}
        cy={100}
        startAngle={180}
        endAngle={0}
        innerRadius={35}
        outerRadius={55}
        cornerRadius={5}
      >
        <Cell fill={loyaltyColor} />
        <Cell fill="#e5e7eb" />
      </Pie>
    </PieChart>
  </div>
  
  {/* Scale and Labels */}
  <div className="dial-scale">
    <div className="scale-mark">0%</div>
    <div className="scale-mark">50%</div>
    <div className="scale-mark">100%</div>
  </div>
  
  {/* Values Display */}
  <div className="dial-scores">
    <div className="dial-legend">
      <span className="legend-dot satisfaction" />
      <div className="dial-score">
        <div className="dial-label">Most Common Satisfaction: {value}</div>
        <div className="dial-percentage">{percentage}%</div>
      </div>
    </div>
  </div>
</div>
```

## Styling

### Core Component Styles
```css
.combination-dial {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 1rem;
}

.dial-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dial-scores {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
  margin-top: 1.5rem;
  width: 100%;
  max-width: 280px;
}

.dial-legend {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dial-scale {
  display: flex;
  justify-content: space-between;
  width: 160px;
  margin-top: -5px;
  position: relative;
}
```

## Calculations

### Value Calculations
```typescript
const calculateMaxValues = () => {
  // Find highest frequency for satisfaction
  const satEntries = Object.entries(statistics.satisfaction.distribution);
  const maxSat = satEntries.reduce((max, [value, count]) => 
    count > max.count ? { value: Number(value), count } : max
  , { value: 0, count: 0 });

  // Find highest frequency for loyalty
  const loyEntries = Object.entries(statistics.loyalty.distribution);
  const maxLoy = loyEntries.reduce((max, [value, count]) => 
    count > max.count ? { value: Number(value), count } : max
  , { value: 0, count: 0 });

  return {
    satisfaction: {
      value: maxSat.value,
      percentage: totalEntries > 0 ? maxSat.count / totalEntries : 0
    },
    loyalty: {
      value: maxLoy.value,
      percentage: totalEntries > 0 ? maxLoy.count / totalEntries : 0
    }
  };
};

const calculateAdjustedPercentage = (rawPercentage: number) => {
  const range = maxValue - minValue;
  const adjusted = ((rawPercentage * 100) - minValue) / range;
  return Math.max(0, Math.min(1, adjusted));
};

const createDialData = (percentage: number) => [
  { value: percentage },           // Filled part
  { value: 1 - percentage }        // Empty part
];
```

## Premium Features

### Color Customization
- Custom colors for satisfaction and loyalty indicators
- Color validation and fallback to defaults
- Consistent color application across components

### Value Range Control
- Configurable minimum and maximum values
- Value clamping within specified range
- Visual feedback for out-of-range values

### Enhanced Visuals
- Smooth transitions between states
- Improved tooltips
- Additional visual indicators

## Accessibility

### ARIA Attributes
```tsx
<div 
  role="img" 
  aria-label={`Response intensity gauge showing satisfaction at ${satPercentage}% and loyalty at ${loyPercentage}%`}
>
  {/* Component content */}
</div>
```

### Keyboard Navigation
- Tab focus support
- Arrow key controls when applicable
- Clear focus indicators

### Color Contrast
- WCAG 2.1 AA compliant color combinations
- Visible state changes
- Clear text against backgrounds

## Performance

### Optimization Techniques
1. Memoization of calculations
```typescript
const dialData = useMemo(() => ({
  satisfaction: createDialData(satisfactionPercentage),
  loyalty: createDialData(loyaltyPercentage)
}), [satisfactionPercentage, loyaltyPercentage]);
```

2. Efficient rendering
```typescript
const shouldComponentUpdate = (prevProps: CombinationDialProps) => {
  return (
    prevProps.totalEntries !== props.totalEntries ||
    JSON.stringify(prevProps.statistics) !== JSON.stringify(props.statistics)
  );
};
```

3. Animation performance
- CSS transitions for smooth updates
- RAF for complex animations
- Debounced event handlers

## Testing

### Unit Tests
```typescript
describe('CombinationDial', () => {
  it('renders correct percentages', () => {
    render(<CombinationDial {...props} />);
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('18%')).toBeInTheDocument();
  });

  it('handles value range constraints', () => {
    render(<CombinationDial {...props} minValue={20} maxValue={80} />);
    const percentage = screen.getByText('30%');
    expect(percentage).toBeInTheDocument();
  });

  it('applies custom colors when premium', () => {
    const colors = {
      satisfaction: '#ff0000',
      loyalty: '#00ff00'
    };
    render(<CombinationDial {...props} isPremium customColors={colors} />);
    const satisfactionDial = screen.getByTestId('satisfaction-dial');
    expect(satisfactionDial).toHaveStyle({ fill: colors.satisfaction });
  });
});
```

### Visual Testing
1. Appearance verification
   - Different value combinations
   - Various screen sizes
   - Color applications

2. Animation testing
   - Smooth transitions
   - Proper timing
   - No visual glitches

3. Responsive behavior
   - Layout consistency
   - Touch interactions
   - Scale adaptations

## Known Issues

### Current Limitations
1. Scale Precision
   - Small values may not be clearly visible
   - Limited granularity in percentage display
   - Scale marks may overlap with very small ranges

2. Animation Timing
   - Multiple updates can cause animation conflicts
   - Transition delays with rapid updates
   - Performance impact with many simultaneous changes

### Workarounds
1. Scale Issues
   - Use minimum range values
   - Enable tooltips for precise values
   - Implement scale compression for small ranges

2. Animation
   - Debounce rapid updates
   - Disable animations for performance
   - Use simplified transitions

## Future Enhancements

### Planned Features
1. Technical Improvements
   - Enhanced animation system
   - Better scale compression
   - Improved performance optimizations

2. Visual Enhancements
   - Additional dial types
   - More customization options
   - Advanced tooltips

3. Accessibility
   - Screen reader improvements
   - Better keyboard controls
   - Enhanced aria descriptions

## Support

### Error Handling
```typescript
const handleError = (error: Error) => {
  console.error('CombinationDial Error:', error);
  // Fallback to safe defaults
  return {
    satisfaction: createDialData(0),
    loyalty: createDialData(0)
  };
};
```

### Debugging
1. Common issues
   - Check data structure
   - Verify premium status
   - Validate color formats

2. Performance issues
   - Monitor update frequency
   - Check animation impact
   - Profile render times

## Version History

### Current Version (1.1.0)
- Premium features implemented
- Color customization added
- Performance improvements

### Previous Version (1.0.0)
- Initial implementation
- Basic dial functionality
- Standard styling

## Dependencies
- React (^18.0.0)
- Recharts
- Lodash (optional)
