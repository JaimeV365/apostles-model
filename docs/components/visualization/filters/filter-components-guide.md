# Apostles Model Filter Component Reference

## Component Breakdown

### 1. FilteredChart Component

**Purpose**: Main container that integrates filtering with the chart visualization.

**File Location**: `src/components/visualization/components/FilteredChart.tsx`

**Key Properties**:
- `data`: Full set of data points
- `satisfactionScale`, `loyaltyScale`: Scale settings
- `activeEffects`: Set of active premium features

**Key States**:
- `isFilterPanelOpen`: Controls filter panel visibility
- `filteredData`: Subset of data after applying filters
- `activeFilterCount`: Number of active filters
- `showPointCount`: Toggle for point counter visibility

**Main Logic**:
```typescript
// Detect filterable data
const hasFilterableData = useMemo(() => {
  const hasDate = data.some(item => item.date);
  const hasCustomFields = data.some(item => {
    const standardFields = ['id', 'name', 'satisfaction', 'loyalty', 'excluded', 'date', 'dateFormat', 'group', 'email'];
    return Object.keys(item).some(key => !standardFields.includes(key));
  });
  const uniqueGroups = new Set(data.map(item => item.group));
  const hasMultipleGroups = uniqueGroups.size > 1;
  const hasSatisfactionDistribution = new Set(data.map(item => item.satisfaction)).size > 1;
  const hasLoyaltyDistribution = new Set(data.map(item => item.loyalty)).size > 1;
  
  return hasDate || hasCustomFields || hasMultipleGroups || hasSatisfactionDistribution || hasLoyaltyDistribution;
}, [data]);

// Handle filter changes
const handleFilterChange = (newFilteredData: DataPoint[]) => {
  setFilteredData(newFilteredData);
  
  // Calculate active filter count
  const nonExcludedDataCount = data.filter(p => !p.excluded).length;
  const diff = nonExcludedDataCount - newFilteredData.length;
  setActiveFilterCount(diff > 0 ? diff : 0);
};
```

**Dependencies**:
- FilterPanel
- FilterToggle
- QuadrantChart

### 2. FilterPanel Component

**Purpose**: Panel with filter controls that slides in from the right side.

**File Location**: `src/components/visualization/filters/FilterPanel.tsx`

**Key Properties**:
- `data`: Dataset to filter
- `onFilterChange`: Callback when filters change
- `onClose`: Handler to close the panel
- `isOpen`: Panel visibility state
- `showPointCount`: Point counter visibility state
- `onTogglePointCount`: Handler for point counter toggle

**Key States**:
```typescript
interface FilterState {
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
    preset?: string;
  };
  attributes: Array<{
    field: string;
    values: Set<string | number>;
    availableValues: Array<{value: string | number, count: number}>;
    expanded?: boolean;
  }>;
  isActive: boolean;
}
```

**Filter Application Logic**:
```typescript
const applyFilters = () => {
  const { dateRange, attributes } = filterState;
  
  const filteredData = data.filter(item => {
    // Don't include excluded items
    if (item.excluded) return false;
    
    // Check date range if applicable
    if (dateRange.startDate || dateRange.endDate) {
      if (!isDateInRange(item.date, dateRange)) return false;
    }
    
    // Check attribute filters
    for (const attr of attributes) {
      // Skip if no values selected (include all)
      if (attr.values.size === 0) continue;
      
      // Check if this item matches any selected value for this attribute
      const itemValue = (item as any)[attr.field];
      if (!attr.values.has(itemValue)) return false;
    }
    
    return true;
  });
  
  // Check if filters are active
  const isActive = (
    (dateRange.startDate !== null || dateRange.endDate !== null) ||
    attributes.some(attr => attr.values.size > 0)
  );
  
  // Update state and notify parent
  setFilterState(prev => ({ ...prev, isActive }));
  onFilterChange(filteredData);
};
```

**Field Name Formatting**:
```typescript
const getFieldDisplayName = (field: string): string => {
  // Special cases for field names that need specific formatting
  const specialFieldMap: Record<string, string> = {
    'id': 'ID',
    'satisfaction': 'Satisfaction',
    'loyalty': 'Loyalty',
    'ces': 'CES',
    'nps': 'NPS',
    'csat': 'CSAT',
    'email': 'Email',
    'date': 'Date',
    'name': 'Name',
    'group': 'Group',
    'country': 'Country'
  };
  
  // Case-insensitive match for special fields
  for (const [fieldKey, display] of Object.entries(specialFieldMap)) {
    if (field.toLowerCase() === fieldKey.toLowerCase()) {
      return display;
    }
  }
  
  // For other fields, just capitalize first letter
  return field.charAt(0).toUpperCase() + field.slice(1);
};
```

### 3. FilterToggle Component

**Purpose**: Button to open and close the filter panel.

**File Location**: `src/components/visualization/filters/FilterToggle.tsx`

**Key Properties**:
- `onClick`: Handler when button is clicked
- `activeFilterCount`: Number of active filters to display
- `isOpen`: Whether the filter panel is open

**Component Structure**:
```tsx
<button 
  className={`filter-toggle ${isOpen ? 'active' : ''} ${activeFilterCount > 0 ? 'has-filters' : ''}`}
  onClick={onClick}
  title="Filter data"
>
  <Filter size={18} />
  {activeFilterCount > 0 && (
    <span className="filter-count">{activeFilterCount}</span>
  )}
</button>
```

## Point Counter Implementation

**Purpose**: Displays the count of visible data points vs. total points.

**Location**: Embedded in FilteredChart component

**Visibility Logic**:
```tsx
{/* Point Count Display - only show if filter panel is available and checkbox is ON */}
{hasFilterableData && showPointCount && (
  <div className="point-counter-display">
    {filteredData.length} out of {data.filter(p => !p.excluded).length} {data.filter(p => !p.excluded).length === 1 ? 'data point' : 'data points'}
  </div>
)}
```

**Styling**:
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

## Data Integration Flow

1. **Data Entry**:
   - User enters data via DataEntryModule or imports CSV
   - Data is stored in App state

2. **Data Transmission**:
   - App passes data to FilteredChart via props

3. **Filter Detection**:
   - FilteredChart analyzes data to detect filterable attributes
   - If found, filter toggle is displayed

4. **Filter Application**:
   - User opens filter panel and applies filters
   - FilterPanel processes data and returns filtered subset
   - FilteredChart updates internal filteredData state
   - FilteredChart passes filtered data to QuadrantChart

5. **Point Counter**:
   - User toggles point counter checkbox
   - FilteredChart displays count if checkbox is on
   - Count updates with filter changes

## CSS Dependencies

All filter components use their dedicated CSS files:
- FilteredChart.css
- FilterPanel.css 
- FilterToggle.css

## Key Relationships

- **FilteredChart → FilterPanel**: Parent-child relationship, FilteredChart controls panel visibility
- **FilteredChart → FilterToggle**: Parent-child relationship, provides click handler and active count
- **FilteredChart → Point Counter**: Owns and renders point counter, controls visibility
- **FilterPanel → FilteredChart**: Callback relationship, sends filtered data back to parent
- **App → FilteredChart**: Props relationship, provides source data
