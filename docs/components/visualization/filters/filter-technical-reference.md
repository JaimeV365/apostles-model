# Apostles Model Filter Technical Reference

## Core Filter Functions

### Attribute Extraction

```typescript
// In FilterPanel.tsx

// Initialize attributes on first render
useEffect(() => {
  if (availableFields.length > 0 && filterState.attributes.length === 0) {
    setFilterState(prev => ({
      ...prev,
      attributes: availableFields.map(field => ({
        field: field.field,
        values: new Set(),
        availableValues: field.counts,
        expanded: false
      }))
    }));
  }
}, [availableFields, filterState.attributes.length]);
```

### Filter Application Algorithm

```typescript
// In FilterPanel.tsx

// Apply filters when filterState changes
useEffect(() => {
  applyFilters();
}, [filterState.dateRange.startDate, filterState.dateRange.endDate, filterState.dateRange.preset, 
    // Use a stringified version of attributes values to avoid infinite loops
    JSON.stringify(filterState.attributes.map(a => ({
      field: a.field,
      values: Array.from(a.values)
    })))
]);

// Apply current filters to data
const applyFilters = () => {
  const { dateRange, attributes } = filterState;
  
  const filteredData = data.filter(item => {
    // Step 1: Exclude already excluded items
    if (item.excluded) return false;
    
    // Step 2: Apply date filter if active
    if (dateRange.startDate || dateRange.endDate) {
      if (!isDateInRange(item.date, dateRange)) return false;
    }
    
    // Step 3: Apply attribute filters
    for (const attr of attributes) {
      // Skip if no values selected (include all)
      if (attr.values.size === 0) continue;
      
      // Check if item matches any selected value for this attribute
      const itemValue = (item as any)[attr.field];
      if (!attr.values.has(itemValue)) return false;
    }
    
    // Item passed all filters
    return true;
  });
  
  // Determine if any filters are active
  const isActive = (
    (dateRange.startDate !== null || dateRange.endDate !== null) ||
    attributes.some(attr => attr.values.size > 0)
  );
  
  // Update state and notify parent
  setFilterState(prev => ({ ...prev, isActive }));
  onFilterChange(filteredData);
};
```

### Active Filter Count Calculation

```typescript
// In FilteredChart.tsx

const handleFilterChange = (newFilteredData: DataPoint[]) => {
  setFilteredData(newFilteredData);
  
  // Calculate active filter count - difference between eligible and filtered data
  const nonExcludedDataCount = data.filter(p => !p.excluded).length;
  const diff = nonExcludedDataCount - newFilteredData.length;
  setActiveFilterCount(diff > 0 ? diff : 0);
};
```

## Event Handling

### Filter Toggle Click

```typescript
// In FilteredChart.tsx

const toggleFilterPanel = () => {
  setIsFilterPanelOpen(!isFilterPanelOpen);
};

// In JSX
<FilterToggle
  onClick={toggleFilterPanel}
  activeFilterCount={activeFilterCount}
  isOpen={isFilterPanelOpen}
/>
```

### Filter Value Selection

```typescript
// In FilterPanel.tsx

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

// In JSX
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

### Date Range Selection

```typescript
// In FilterPanel.tsx

const applyDatePreset = (preset: string) => {
  const now = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  
  switch (preset) {
    // Date calculations for various presets
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'yesterday':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
      break;
    // ...other cases
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
};
```

### Point Counter Toggle

```typescript
// In FilterPanel.tsx

{onTogglePointCount && (
  <div className="filter-panel-options" style={{ marginBottom: '16px' }}>
    <label className="filter-option" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      cursor: 'pointer',
      userSelect: 'none'
    }}>
      <input 
        type="checkbox" 
        checked={showPointCount} 
        onChange={(e) => onTogglePointCount(e.target.checked)}
        style={{
          width: '16px',
          height: '16px',
          accentColor: '#3a863e'
        }}
      />
      <span>Show point count</span>
    </label>
  </div>
)}
```

## DOM Element Structure

### FilterPanel Structure

```html
<div class="filter-panel open">
  <!-- Header -->
  <div class="filter-panel-header">
    <div class="filter-panel-title">
      <Filter size={18} />
      <h3>Filters</h3>
      <span class="filter-badge">3</span>
    </div>
    <button class="filter-panel-close">
      <X size={18} />
    </button>
  </div>

  <div class="filter-panel-content">
    <!-- Date Filters Section -->
    <div class="filter-section-category">Date Filters</div>
    <div class="filter-section">
      <!-- Date Range Controls -->
    </div>
    
    <!-- Scale Filters Section -->
    <div class="filter-section-category">Scales</div>
    <div class="filter-section">
      <!-- Satisfaction Filter -->
    </div>
    <div class="filter-section">
      <!-- Loyalty Filter -->
    </div>
    
    <!-- Basic Info Section -->
    <div class="filter-section-category">Basic Information</div>
    <div class="filter-section">
      <!-- Group Filter -->
    </div>
    
    <!-- Additional Attributes Section -->
    <div class="filter-section-category">Additional Attributes</div>
    <div class="filter-section">
      <!-- Custom Field Filter -->
    </div>
  </div>
  
  <!-- Footer -->
  <div class="filter-panel-footer">
    <!-- Point count toggle -->
    <div class="filter-panel-options">
      <label class="filter-option">
        <input type="checkbox" checked={showPointCount} />
        <span>Show point count</span>
      </label>
    </div>
    
    <button class="filter-reset-button">
      Reset All
    </button>
  </div>
</div>
```

### FilterToggle Structure

```html
<button class="filter-toggle active has-filters">
  <Filter size={18} />
  <span class="filter-count">3</span>
</button>
```

### Point Counter Structure

```html
<div class="point-counter-display">
  15 out of 20 data points
</div>
```

## CSS Selectors and Variables

### Main Container Selectors

```css
.filtered-chart-container {}
.filter-panel {}
.filter-overlay {}
.filter-toggle {}
.point-counter-display {}
```

### Section Selectors

```css
.filter-section-category {}
.filter-section {}
.filter-section-header {}
.filter-section-header-right {}
```

### Control Selectors

```css
.date-preset-buttons {}
.date-preset-button {}
.attribute-value-list {}
.attribute-value-item {}
.checkbox {}
```

### State Selectors

```css
.filter-toggle.active {}
.filter-toggle.has-filters {}
.filter-panel.open {}
.attribute-value-item.selected {}
```

## Custom Helper Functions

### Field Name Formatting

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

### Date Formatting

```typescript
const formatDateForDisplay = (date: Date | null): string => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
```

### Date Validation and Parsing

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

## Rendering Optimizations

### Memoized Values

```typescript
// In FilterPanel.tsx
// Extract all available fields and their unique values
const availableFields = useMemo(() => {
  // Field extraction logic
}, [data]);

// In FilteredChart.tsx
// Determine if we have filterable data
const hasFilterableData = useMemo(() => {
  // Detection logic
}, [data]);
```

### Dependency Arrays

```typescript
// Careful dependency array for filter application
useEffect(() => {
  applyFilters();
}, [filterState.dateRange.startDate, filterState.dateRange.endDate, filterState.dateRange.preset, 
    // Use a stringified version of attributes values to avoid infinite loops
    JSON.stringify(filterState.attributes.map(a => ({
      field: a.field,
      values: Array.from(a.values)
    })))
]);
```

## Error Handling

### Date Parsing Errors

```typescript
try {
  dateValue = new Date(dateStr);
  if (isNaN(dateValue.getTime())) {
    // Format detection fallbacks
  }
} catch (e) {
  console.error('Error parsing date:', dateStr, e);
  return false;
}
```
