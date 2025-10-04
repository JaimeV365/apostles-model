# Most Common Combinations Section Documentation

## Overview
The Most Common Combinations section displays a combination of a MiniPlot visualization and a corresponding list of data points, laid out in a grid structure within the Data Report component.

## File Structure
```
components/
└── reporting/
    ├── components/
    │   ├── DataReport/
    │   │   └── index.tsx        # Main component containing the section
    │   └── MiniPlot/
    │       ├── MiniPlot.tsx     # MiniPlot visualization component
    │       └── MiniPlot.css     # MiniPlot specific styles
    └── ReportingSection.css     # Global reporting styles
```

## Component Dependencies
```typescript
import React from 'react';
import type { DataReport as DataReportType } from '../../types';
import { MiniPlot } from '../MiniPlot';
```

## Layout Structure

### Grid Container
```tsx
<div className="report-combo-highlight" style={{ minHeight: '200px' }}>
  <div style={{ 
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    height: '100%'
  }}>
    {/* Grid items */}
  </div>
</div>
```

### MiniPlot Section
```tsx
{/* Left Column - MiniPlot */}
<div style={{ 
  padding: '1rem 2rem 1rem 1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>
  <MiniPlot 
    combinations={report.mostCommonCombos}
    satisfactionScale={report.satisfactionScale}
    loyaltyScale={report.loyaltyScale}
  />
</div>
```

### List Section
```tsx
{/* Middle Column - Combinations List */}
<div style={{ 
  padding: '1rem',
  alignSelf: 'start'
}}>
  <h4 style={{ 
    fontSize: '0.9rem', 
    fontWeight: '500',
    marginTop: 0,
    marginBottom: '0.75rem',
    color: '#374151'
  }}>
    Most Common Combinations
  </h4>
  <ul style={{ 
    listStyle: 'none',
    padding: 0,
    margin: 0
  }}>
    {/* List items */}
  </ul>
</div>
```

## MiniPlot Configuration

### CSS Configuration
```css
.mini-plot {
  position: relative;
  width: 280px;
  height: 220px;
  margin: 0;
  display: grid;
  grid-template-areas:
    "y-axis plot"
    "blank x-axis";
  grid-template-columns: 30px 1fr;
  grid-template-rows: 1fr 20px;
  gap: 2px;
}

.mini-plot-y-axis {
  width: 30px;
  grid-area: y-axis;
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.mini-plot-y-ticks {
  flex-direction: column-reverse;
  padding-right: 8px;
  margin-right: 4px;
}
```

### Props Interface
```typescript
interface MiniPlotProps {
  combinations: Array<{
    satisfaction: number;
    loyalty: number;
    count: number;
    percentage: number;
  }>;
  satisfactionScale: string;
  loyaltyScale: string;
}
```

## List Item Implementation

### Color Logic
```typescript
const getPointColor = (satisfaction: number, loyalty: number) => {
  const midpoint = 2.5;
  if (satisfaction >= midpoint && loyalty >= midpoint) return '#4CAF50';
  if (satisfaction >= midpoint && loyalty < midpoint) return '#f59e0b';
  if (satisfaction < midpoint && loyalty >= midpoint) return '#4682b4';
  return '#dc2626';
};
```

### List Item Structure
```tsx
<li style={{ 
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: '0.875rem',
  marginBottom: '0.5rem'
}}>
  <span style={{ 
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: getPointColor(combo.satisfaction, combo.loyalty),
    marginRight: '4px'
  }} />
  <span>
    {combo.satisfaction}, {combo.loyalty}
    <span style={{ 
      color: '#6B7280',
      fontSize: '0.75rem',
      marginLeft: '0.25rem'
    }}>
      ({combo.count} responses - {combo.percentage.toFixed(1)}%)
    </span>
  </span>
</li>
```

## Styling Notes

### Key Spacing Values
- Grid gap: 1rem
- List item bottom margin: 0.5rem
- Bullet point right margin: 4px
- MiniPlot padding: 1rem 2rem 1rem 1rem

### Typography
- Section title: 0.9rem, 500 weight
- List items: 0.875rem
- Percentage text: 0.75rem
- Colors: #374151 (title), #6B7280 (percentage)

### Grid Dimensions
- MiniPlot size: 280px × 220px
- Y-axis width: 30px
- X-axis height: 20px

## Important Considerations

### Layout
- Uses CSS Grid for main layout
- MiniPlot uses its own grid system for axes
- List items use inline-flex for tight bullet spacing

### Responsive Behavior
- Fixed width MiniPlot (280px)
- Fluid grid columns (1fr each)
- Minimum container height (200px)

### Accessibility
- Semantic HTML structure
- Color-coded points with consistent meaning
- Clear visual hierarchy

## Debug Notes

### Common Issues
1. Bullet point spacing
   - Must use inline-flex on list items
   - Minimal marginRight on bullet points
   - Remove default list styles

2. MiniPlot scale spacing
   - Increased grid-template-columns for y-axis
   - Added padding to tick marks
   - Maintained grid gap for alignment

Save this documentation in:
`/docs/components/reporting/most-common-combinations.md`