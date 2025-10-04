# Highlighting System Documentation

## Overview
The highlighting system allows users to emphasize specific KPIs in the reporting section, with enhanced capabilities in premium mode. The system uses the HighlightableKPI component and integrates with the statistics and reporting modules.

## Implementation Details

### Component Structure
```
ReportingSection/
├── components/
│   ├── HighlightableKPI/
│   │   ├── index.tsx
│   │   └── HighlightableKPI.css
│   └── StatisticsSection/
└── hooks/
    └── useReportCustomization.ts
```

### Core Components

#### HighlightableKPI Component
```typescript
interface HighlightableKPIProps {
  id: string;              // Unique identifier for the KPI
  children: React.ReactNode; // Content to be wrapped
  isPremium?: boolean;     // Premium mode flag
  className?: string;      // Additional CSS classes
}
```

#### Premium Feature Behavior
- Standard Mode: Single yellow highlight available
- Premium Mode: Three highlight options
  - Green: Positive indicators
  - Yellow: Neutral values
  - Red: Areas of concern

### State Management

#### useReportCustomization Hook
```typescript
interface ReportCustomization {
  highlightedKPIs: Map<string, {
    isHighlighted: boolean;
    color: 'green' | 'yellow' | 'red';
  }>;
}

const useReportCustomization = (isPremium: boolean) => {
  // State initialization
  const [customization, setCustomization] = useState<ReportCustomization>({
    highlightedKPIs: new Map()
  });

  // Toggle highlight with color
  const toggleHighlight = (id: string, color: 'green' | 'yellow' | 'red') => {
    if (!isPremium && color !== 'yellow') return;
    
    setCustomization(prev => {
      const newMap = new Map(prev.highlightedKPIs);
      const current = newMap.get(id);
      
      if (current?.isHighlighted) {
        newMap.delete(id);
      } else {
        newMap.set(id, { isHighlighted: true, color });
      }
      
      return { ...prev, highlightedKPIs: newMap };
    });
  };

  return { customization, toggleHighlight };
};
```

### CSS Implementation
```css
.highlightable-kpi {
  position: relative;
  transition: all 0.2s ease;
  border-radius: 0.375rem;
}

/* Premium Mode Colors */
.highlightable-kpi.highlight-green {
  background-color: rgba(76, 175, 80, 0.15);
  border: 2px solid #4CAF50;
}

.highlightable-kpi.highlight-yellow {
  background-color: rgba(255, 235, 59, 0.15);
  border: 2px solid #FDD835;
}

.highlightable-kpi.highlight-red {
  background-color: rgba(244, 67, 54, 0.15);
  border: 2px solid #E53935;
}

/* Hover States */
.highlightable-kpi.premium-kpi:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Color Selection UI */
.highlight-color-options {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.color-option {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
```

### Usage Examples

#### Basic Implementation
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

#### Premium Mode
```tsx
const { toggleHighlight, customization } = useReportCustomization(isPremium);
const highlightInfo = customization.highlightedKPIs.get(id);

<div 
  className={`highlightable-kpi ${
    highlightInfo?.isHighlighted ? `highlight-${highlightInfo.color}` : ''
  }`}
  onClick={() => isPremium && setShowColorPicker(true)}
>
  {children}
  {showColorPicker && isPremium && (
    <div className="highlight-color-options">
      <button
        className="color-option"
        style={{ backgroundColor: '#4CAF50' }}
        onClick={() => toggleHighlight(id, 'green')}
      />
      <button
        className="color-option"
        style={{ backgroundColor: '#FDD835' }}
        onClick={() => toggleHighlight(id, 'yellow')}
      />
      <button
        className="color-option"
        style={{ backgroundColor: '#E53935' }}
        onClick={() => toggleHighlight(id, 'red')}
      />
    </div>
  )}
</div>
```

### Persistence
The system uses localStorage to maintain highlight states between sessions:

```typescript
// Save state
useEffect(() => {
  if (isPremium) {
    localStorage.setItem('report-highlights', JSON.stringify({
      highlights: Array.from(customization.highlightedKPIs.entries())
    }));
  }
}, [customization, isPremium]);

// Load state
useEffect(() => {
  if (isPremium) {
    const saved = localStorage.getItem('report-highlights');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomization(prev => ({
          ...prev,
          highlightedKPIs: new Map(parsed.highlights)
        }));
      } catch (e) {
        console.error('Error loading saved highlights:', e);
      }
    }
  }
}, [isPremium]);
```

### Error Handling

#### Premium Status Validation
```typescript
const toggleHighlight = useCallback((id: string, color: 'green' | 'yellow' | 'red') => {
  if (!isPremium && color !== 'yellow') {
    console.warn('Attempted to use premium highlight in standard mode');
    return;
  }
  // ... rest of implementation
}, [isPremium]);
```

### Future Improvements
1. Add support for highlight presets
2. Implement highlight groups
3. Add export/import of highlight configurations
4. Add highlight animations
5. Improve mobile color picker UI

### Location
Save this documentation in `/docs/components/reporting/highlighting.md`