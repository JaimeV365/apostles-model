# Apostles Model Filter Implementation Guide

This document explains the technical implementation details of the filtering system in the Apostles Model application.

## File Structure

```
src/components/visualization/
│
├── components/
│   └── FilteredChart.tsx   # Main chart with filtering integration
│
├── filters/
│   ├── FilterPanel.tsx     # Filter panel with controls
│   ├── FilterPanel.css     # Filter panel styling
│   ├── FilterToggle.tsx    # Filter toggle button
│   ├── FilterToggle.css    # Filter toggle styling
│   └── index.ts            # Filter exports
│
└── types.ts                # Shared type definitions
```

## Key Interfaces

### Filter State

```typescript
interface FilterState {
  dateRange: DateRange;
  attributes: AttributeFilter[];
  isActive: boolean;
}

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
  preset?: string;
}

interface AttributeFilter {
  field: string;
  values: Set<string | number>;
  availableValues: Array<{value: string | number, count: number}>;
  expanded?: boolean;
}
```

### Props

```typescript
interface FilterPanelProps {
  data: DataPoint[];
  onFilterChange: (filteredData: DataPoint[]) => void;
  onClose: () => void;
  isOpen: boolean;
  showPointCount?: boolean;
  onTogglePointCount?: (show: boolean) => void;
}

interface FilterToggleProps {
  onClick: () => void;
  activeFilterCount: number;
  isOpen: boolean;
}
```

## Implementation Details

### Initializing Filter Attributes

When the FilterPanel receives data, it analyzes it to extract filterable attributes:

```typescript
// Extract all available fields and their unique values
const availableFields = useMemo(() => {
  const fields = new Map<string, Set<string | number>>();
  
  // Add standard fields
  fields.set('group', new Set());
  fields.set('satisfaction', new Set());
  fields.set('loyalty', new Set());
  
  // Check for dates
  const hasDate = data.some(item => item.date);
  
  data.forEach(item => {
    // Add values to standard fields
    if (item.group) fields.get('group')?.add(item.group);
    if (item.satisfaction) fields.get('satisfaction')?.add(item.satisfaction);
    if (item.loyalty) fields.get('loyalty')?.add(item.loyalty);
    
    // Collect values for each custom field
    Object.entries(item).forEach(([key, value]) => {
      if (!['id', 'name', 'satisfaction', 'loyalty', 'excluded', 'date', 'dateFormat'].includes(key)) {
        if (!fields.has(key)) fields.set(key, new Set());
        fields.get(key)?.add(value);
      }
    });
  });
  
  // Convert to array format with counts
  return Array.from(fields.entries())
    .filter(([_, values]) => values.size > 1) // Only include fields with multiple values
    .map(([field, values]) => {
      const valueArray = Array.from(values);
      return {
        field,
        values: valueArray,
        counts: valueArray.map(value => ({
          value,
          count: data.filter(item => (item as any)[field] === value).length
        }))
      };
    })
    .sort((a, b) => {
      // Custom sort order: satisfaction, loyalty, group, then others alphabetically
      const priorityFields = ['satisfaction', 'loyalty', 'group', 'name', 'email'];
      
      const aIndex = priorityFields.indexOf(a.field);
      const bIndex = priorityFields.indexOf(b.field);
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      return a.field.localeCompare(b.field);
    });
}, [data]);
```

### Detecting Filterable Data

The FilteredChart component determines whether filtering is available:

```typescript
const hasFilterableData = useMemo(() => {
  // Check for dates
  const hasDate = data.some(item => item.date);
  
  // Check for custom fields
  const hasCustomFields = data.some(item => {
    const standardFields = ['id', 'name', 'satisfaction', 'loyalty', 'excluded', 'date', 'dateFormat', 'group', 'email'];
    return Object.keys(item).some(key => !standardFields.includes(key));
  });
  
  // Check for multiple groups
  const uniqueGroups = new Set(data.map(item => item.group));
  const hasMultipleGroups = uniqueGroups.size > 1;
  
  // Check for satisfaction/loyalty distributions
  const hasSatisfactionDistribution = new Set(data.map(item => item.satisfaction)).size > 1;
  const hasLoyaltyDistribution = new Set(data.map(item => item.loyalty)).size > 1;
  
  return hasDate || hasCustomFields || hasMultipleGroups || hasSatisfactionDistribution || hasLoyaltyDistribution;
}, [data]);
```

### Filter Panel Open/Close Logic

The FilterPanel opens on toggle button click and closes when:
- The close button is clicked
- The user clicks outside the panel
- The Escape key is pressed

```typescript
// Handle click outside to close filter panel
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      isFilterPanelOpen &&
      filterPanelRef.current &&
      !filterPanelRef.current.contains(event.target as Node) &&
      !(event.target as Element).closest('.filter-toggle')
    ) {
      setIsFilterPanelOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isFilterPanelOpen]);

// Handle escape key to close filter panel
useEffect(() => {
  const handleEscKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isFilterPanelOpen) {
      setIsFilterPanelOpen(false);
    }
  };

  document.addEventListener('keydown', handleEscKey);
  return () => {
    document.removeEventListener('keydown', handleEscKey);
  };
}, [isFilterPanelOpen]);
```

### Date Parsing and Filtering

Date filtering handles various formats:

```typescript
const isDateInRange = (dateStr: string | undefined, range: DateRange): boolean => {
  if (!dateStr || !range.startDate) return true;
  
  // Parse the date string based on format
  let dateValue: Date;
  try {
    dateValue = new Date(dateStr);
    if (isNaN(dateValue.getTime())) {
      // Try parsing in different formats if standard parsing fails
      const parts = dateStr.split(/\/|-/);
      if (parts.length === 3) {
        // Try to detect format
        if (parts[0].length === 4) {
          // yyyy-mm-dd
          dateValue = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
        } else if (parts[2].length === 4) {
          // dd/mm/yyyy or mm/dd/yyyy
          dateValue = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }
    }
  } catch (e) {
    console.error('Error parsing date:', dateStr, e);
    return false;
  }
  
  // Check range
  if (range.startDate && dateValue < range.startDate) return false;
  if (range.endDate && dateValue > range.endDate) return false;
  
  return true;
};
```

### Date Range Presets

Predefined date ranges are available for common filtering needs:

```typescript
const applyDatePreset = (preset: string) => {
  const now = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  
  switch (preset) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'yesterday':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
      break;
    case 'last7days':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    // Other cases...
  }
  
  setFilterState(prev => ({
    ...prev,
    dateRange: {
      ...prev.dateRange,
      startDate,
      endDate,
      preset
    }
  }));
}
```

### Point Counter Implementation

The point counter is a conditional element in the FilteredChart component:

```tsx
{/* Point Count Display - only show if filter panel is available and checkbox is ON */}
{hasFilterableData && showPointCount && (
  <div className="point-counter-display">
    {filteredData.length} out of {data.filter(p => !p.excluded).length} {data.filter(p => !p.excluded).length === 1 ? 'data point' : 'data points'}
  </div>
)}
```

Its visibility is controlled by:
1. The presence of filterable data
2. The user's preference (checkbox in filter panel)

```tsx
// In FilterPanel.tsx
{onTogglePointCount && (
  <div className="filter-panel-options">
    <label className="filter-option">
      <input 
        type="checkbox" 
        checked={showPointCount} 
        onChange={(e) => onTogglePointCount(e.target.checked)}
      />
      <span>Show point count</span>
    </label>
  </div>
)}
```

## CSS Implementation

### FilterPanel Animation

The filter panel slides in from the right with a smooth transition:

```css
.filter-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 350px;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.filter-panel.open {
  transform: translateX(0);
}
```

### Filter Toggle Button States

The toggle button has multiple visual states:

```css
.filter-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  background-color: white;
  border: 2px solid #3a863e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 20;
  transition: all 0.2s ease;
  color: #3a863e;
}

.filter-toggle:hover {
  background-color: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.filter-toggle.active {
  background-color: #3a863e;
  color: white;
  border-color: #3a863e;
}

.filter-toggle.has-filters {
  background-color: #3a863e;
  color: white;
  border-color: #3a863e;
}
```

### Point Counter Display

The point counter appears near the filter button:

```css
.point-counter-display {
  position: absolute;
  top: 12px;
  right: 60px;
  background-color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  color: #374151;
  border: 1px solid #e5e7eb;
  z-index: 15;
  font-family: 'Lato', sans-serif;
}
```

## Filter Value Selection

Attribute values are selected with checkboxes:

```tsx
<div 
  className={`attribute-value-item ${attr.values.has(value) ? 'selected' : ''}`}
  onClick={() => toggleAttributeValue(attr.field, value)}
>
  <div className="checkbox">
    {attr.values.has(value) && <Check size={14} />}
  </div>
  <div className="attribute-label">{value.toString()}</div>
  <div className="attribute-count">{count}</div>
</div>
```

The toggle function updates a Set of selected values:

```typescript
const toggleAttributeValue = (field: string, value: string | number) => {
  setFilterState(prev => ({
    ...prev,
    attributes: prev.attributes.map(attr => {
      if (attr.field === field) {
        const newValues = new Set(attr.values);
        if (newValues.has(value)) {
          newValues.delete(value);
        } else {
          newValues.add(value);
        }
        return { ...attr, values: newValues };
      }
      return attr;
    })
  }));
};
```

## Important Considerations

1. **Performance**: The filter system is designed to handle large datasets efficiently by:
   - Using memoization for expensive computations
   - Only updating when filters actually change
   - Using Sets for faster value lookups

2. **User Experience**: The filter panel follows UX best practices with:
   - Clear section organization
   - Visual feedback for active filters
   - Smooth animations
   - Contextual grouping of related filters

3. **Maintainability**: The code is structured for easy expansion with:
   - Clear separation of concerns
   - Well-defined interfaces
   - Consistent naming conventions
   - Modular CSS

4. **Field Name Display**: Special care is taken to display field names consistently with the rest of the application.
