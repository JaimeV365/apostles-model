# KPI Highlighting System Documentation

## Overview
The KPI highlighting system allows premium users to highlight specific KPIs (Key Performance Indicators) in the data report for emphasis and customization.

## File Structure
```
components/
└── reporting/
    ├── components/
    │   ├── HighlightableKPI/
    │   │   ├── index.tsx           # Main component
    │   │   └── HighlightableKPI.css # Styles
    └── hooks/
        └── useReportCustomization.ts # State management hook

```

## Core Components

### 1. HighlightableKPI Component
Location: `/components/reporting/components/HighlightableKPI/index.tsx`

#### Purpose
Wraps KPI elements to make them highlightable for premium users.

#### Props Interface
```typescript
interface HighlightableKPIProps {
  id: string;              // Unique identifier for the KPI
  children: React.ReactNode; // Content to be wrapped
  isPremium?: boolean;     // Whether premium features are enabled
  className?: string;      // Additional CSS classes
}
```

#### Key Features
- Conditional highlighting based on premium status
- Hover effects for premium users
- Click handling for toggling highlights
- Persistence of highlight state

### 2. useReportCustomization Hook
Location: `/components/reporting/hooks/useReportCustomization.ts`

#### Purpose
Manages the state and persistence of report customizations, including KPI highlights.

#### Interface
```typescript
interface ReportCustomization {
  highlightedKPIs: Set<string>;
  chartColors: Record<string, Record<number, string>>;
}
```

#### Key Functions
- `toggleHighlight(kpiId: string)`: Toggles highlight state
- `isHighlighted(kpiId: string)`: Checks if KPI is highlighted
- `setChartColor(chart: string, value: number, color: string)`: Sets chart colors
- Local storage persistence for customizations

## State Flow

1. Initial State Load
```typescript
useEffect(() => {
  if (isPremium) {
    const saved = localStorage.getItem('report-customization');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCustomization(prev => ({
        ...prev,
        highlightedKPIs: new Set(parsed.highlightedKPIs || []),
        chartColors: parsed.chartColors || prev.chartColors
      }));
    }
  }
}, [isPremium]);
```

2. State Updates
```typescript
const toggleHighlight = useCallback((kpiId: string) => {
  if (!isPremium) return;
  
  setCustomization(prev => {
    const newHighlights = new Set(prev.highlightedKPIs);
    if (newHighlights.has(kpiId)) {
      newHighlights.delete(kpiId);
    } else {
      newHighlights.add(kpiId);
    }
    return {
      ...prev,
      highlightedKPIs: newHighlights
    };
  });
}, [isPremium]);
```

## Styling System

### Base Styles
```css
.highlightable-kpi {
  position: relative;
  transition: all 0.2s ease;
  border-radius: 0.375rem;
}
```

### Premium State
```css
.highlightable-kpi.premium-kpi {
  cursor: pointer;
}

.highlightable-kpi.premium-kpi:hover {
  background-color: rgba(76, 175, 80, 0.1);
}
```

### Highlighted State
```css
.highlightable-kpi.highlighted {
  background-color: rgba(76, 175, 80, 0.15);
  border: 2px solid #4CAF50;
  padding: 0.25rem;
}
```

## Usage Examples

### Basic KPI Implementation
```tsx
<HighlightableKPI id="satisfaction-average" isPremium={isPremium}>
  <div className="report-stat-item">
    <span className="report-stat-label">Average:</span>
    <span className="report-stat-value">
      {statistics.satisfaction.average.toFixed(2)}
    </span>
  </div>
</HighlightableKPI>
```

### Premium Features Integration
```tsx
const { isHighlighted, toggleHighlight } = useReportCustomization(isPremium);
const highlighted = isHighlighted(id);
```

## Data Persistence

### Storage Format
```json
{
  "highlightedKPIs": ["satisfaction-average", "loyalty-max"],
  "chartColors": {
    "satisfaction": {
      "1": "#3a863e",
      "2": "#dc2626"
    }
  }
}
```

### Storage Management
- Automatically saves on state changes
- Loads on component mount
- Clears when premium status is revoked

## Error Handling

### Premium Status Validation
```typescript
if (!isPremium) return;
```

### Storage Error Handling
```typescript
try {
  const parsed = JSON.parse(saved);
  // State update
} catch (e) {
  console.error('Error loading saved customizations:', e);
}
```

## Performance Considerations

1. Memoization
   - useCallback for handlers
   - useMemo for computed values
   - Selective re-renders

2. Storage Optimization
   - Batched updates
   - Minimal state structure
   - Efficient state updates

## Future Improvements

1. Planned Enhancements
   - Multiple highlight styles
   - Group highlighting
   - Highlight presets
   - Export/import configurations

2. Technical Debt
   - Storage format versioning
   - Better error recovery
   - Performance optimization

## Troubleshooting

Common Issues:
1. Highlights not persisting
   - Check premium status
   - Verify localStorage access
   - Check for parsing errors

2. Inconsistent highlighting
   - Verify ID uniqueness
   - Check state updates
   - Validate premium status