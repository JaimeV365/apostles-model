# Apostles Model Filter System Documentation

## Overview

The filter system allows users to filter data points displayed in the Apostles Model visualization. It provides a comprehensive interface for filtering by date ranges, satisfaction/loyalty scores, and any additional metadata present in the imported data.

## Components Structure

### Main Components

1. **FilteredChart.tsx**
   - Parent component that manages filter state and integration with the chart
   - Contains the filter toggle button and filter panel
   - Handles filtered data display logic

2. **FilterPanel.tsx**
   - Sliding panel with filtering controls
   - Contains filter sections for different data types
   - Manages point counter visibility toggle

3. **FilterToggle.tsx**
   - Button to open/close the filter panel
   - Shows count of active filters

### Support Files

- **FilteredChart.css** - Styling for the chart container and point counter
- **FilterPanel.css** - Styling for the filter panel and its controls
- **FilterToggle.css** - Styling for the toggle button

## Data Flow

1. Data enters the system via the parent App component
2. FilteredChart receives the full dataset via props
3. FilterPanel receives the full dataset for filtering
4. When filters are applied, FilterPanel returns filtered data
5. FilteredChart updates the QuadrantChart with filtered data
6. Point counter displays the count of visible vs. total points

```
App → FilteredChart → FilterPanel → [Filter Applied] → FilteredChart → QuadrantChart
```

## Filter Types

### Date Filters

- Date range filtering (preset periods or custom range)
- Only visible when dates exist in the dataset
- Uses DateRange state for tracking selected dates

### Scale Filters

- Satisfaction values
- Loyalty values
- Displays count of records per value

### Basic Information Filters

- Group
- Name
- Email

### Additional Attributes

- Dynamic section based on any extra columns in the data
- Appears when non-standard fields are present

## State Management

### FilteredChart States

```typescript
const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
const [filteredData, setFilteredData] = useState<DataPoint[]>(data);
const [activeFilterCount, setActiveFilterCount] = useState(0);
const [showPointCount, setShowPointCount] = useState(true);
```

### FilterPanel States

```typescript
interface FilterState {
  dateRange: DateRange;
  attributes: AttributeFilter[];
  isActive: boolean;
}
```

## Integration Points

### Point Counter

- Located at the top right of the chart next to the filter button
- Displays "X out of Y data points"
- Visibility controlled by checkbox in filter panel
- Only displays when filters are available and enabled

### Filter Detection Logic

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

## Field Name Handling

Field names are displayed with proper capitalization and formatting:

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
  
  // Check case-insensitive match for special fields
  for (const [fieldKey, display] of Object.entries(specialFieldMap)) {
    if (field.toLowerCase() === fieldKey.toLowerCase()) {
      return display;
    }
  }
  
  // For other fields, just capitalize first letter
  return field.charAt(0).toUpperCase() + field.slice(1);
};
```

## Filter Logic Implementation

### Date Filter Logic

```typescript
const isDateInRange = (dateStr: string | undefined, range: DateRange): boolean => {
  if (!dateStr || !range.startDate) return true;
  
  // Parse date based on format
  let dateValue: Date;
  try {
    dateValue = new Date(dateStr);
    if (isNaN(dateValue.getTime())) {
      // Try different formats if standard parsing fails
      const parts = dateStr.split(/\/|-/);
      if (parts.length === 3) {
        // Detect format
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

### Attribute Filter Logic

```typescript
// Check attribute filters
for (const attr of attributes) {
  // Skip if no values selected (include all)
  if (attr.values.size === 0) continue;
  
  // Check if this item matches any selected value for this attribute
  const itemValue = (item as any)[attr.field];
  if (!attr.values.has(itemValue)) return false;
}
```

## User Experience

1. User imports data with various fields
2. If filterable data is detected, filter funnel icon appears
3. Clicking funnel opens filter panel
4. User can select from available filters
5. Active filters count appears on funnel icon
6. Filtered data is displayed in the chart
7. Point counter shows visible vs. total points when enabled

## Notes on Styling

- The filter panel slides in from the right side
- Active filters have colored indicators
- Filter panel has consistent section organization
- Point counter matches the application's design language

## Troubleshooting

- If the funnel icon isn't appearing, no filterable data was detected
- If date filters aren't working, check date format consistency
- If point counter is missing, ensure it's enabled in the filter panel

## Customization Points

- Add new filter types in FilterPanel.tsx
- Update specialFieldMap to handle new field naming conventions
- Modify filter styling in the CSS files
