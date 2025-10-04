# Visualization Filters Documentation

## Overview
The filtering system allows users to filter data points based on additional columns in their dataset. It includes both standard and premium features for data visualization control.

## Data Requirements

### Additional Columns Format
```typescript
interface DataColumnDefinition {
  name: string;
  type: 'text' | 'number' | 'date';
  label?: string;
}

interface DataPoint extends BaseDataPoint {
  [key: string]: string | number | Date;  // Dynamic additional fields
}
```

### CSV Import Format
```csv
name,satisfaction,loyalty,department,region,revenue
John Doe,4,5,Sales,North,50000
Jane Smith,3,4,Marketing,South,45000
```

## Filter Components

### Filter Dropdown
```typescript
interface FilterDropdownProps {
  columns: DataColumnDefinition[];
  selectedColumn: string | null;
  onColumnSelect: (column: string) => void;
  value: any;
  onChange: (value: any) => void;
}
```

### Premium Features Control
```typescript
interface PremiumFeaturesProps {
  /** Frequency visualization toggle */
  showFrequency: boolean;
  onFrequencyToggle: (show: boolean) => void;
  
  /** Preview timeout in ms */
  previewDuration?: number;
  
  /** Premium status */
  isPremium: boolean;
}
```

## Implementation

### Filter Section Layout
```tsx
<FilterSection>
  <FilterDropdown
    columns={availableColumns}
    selectedColumn={currentFilter}
    onColumnSelect={handleFilterChange}
  />
  
  <PremiumFeatures
    showFrequency={showFrequency}
    onFrequencyToggle={handleFrequencyToggle}
    isPremium={false}
  />
</FilterSection>
```

### Premium Feature Preview
```typescript
const handlePremiumFeatureClick = (feature: string) => {
  if (!isPremium) {
    // Enable feature temporarily
    enableFeature(feature);
    
    // Disable after preview
    setTimeout(() => {
      disableFeature(feature);
      showUpgradePrompt();
    }, PREVIEW_DURATION);
  }
};
```

## Styling

### Premium Feature Indicators
```css
.premium-feature {
  opacity: 0.7;
  cursor: pointer;
}

.premium-feature::after {
  content: '🔒';
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
}

.premium-feature:hover {
  opacity: 0.8;
}
```

### Filter Controls
```css
.filter-section {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.filter-dropdown {
  min-width: 200px;
}
```

## Usage

### Adding Filters
1. Import data with additional columns
2. Select filter column from dropdown
3. Apply filter value
4. Visualization updates automatically

### Premium Features
1. Frequency Visualization
   - Toggle to show/hide
   - Preview available for non-premium
   - Full access for premium users
2. Advanced Filters
   - Multiple filters
   - Complex conditions
   - Custom ranges

## Notes
- Premium features show preview functionality
- Lock icon indicates premium status
- Smooth transitions for enable/disable
- Clear upgrade messaging
- Maintain filter state