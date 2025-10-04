# DataDisplay Component

## Overview
The DataDisplay component presents entered data in a tabular format with sorting, editing, and data management capabilities.

## Features
- Data table display
- Column sorting
- Row editing
- Data deletion
- Row exclusion
- Average calculation
- Virtualized rows
- Responsive design

## Interface
```typescript
interface DataDisplayProps {
  /** Data array to display */
  data: DataPoint[];
  
  /** Row deletion handler */
  onDelete: (id: string) => void;
  
  /** Edit row handler */
  onEdit: (id: string) => void;
  
  /** Delete all handler */
  onDeleteAll: () => void;
  
  /** Row exclusion toggle */
  onToggleExclude: (id: string) => void;
  
  /** Current satisfaction scale */
  satisfactionScale: string;
  
  /** Current loyalty scale */
  loyaltyScale: string;
}
```

## Usage Example
```tsx
<DataDisplay
  data={dataPoints}
  onDelete={handleDelete}
  onEdit={handleEdit}
  onDeleteAll={handleDeleteAll}
  onToggleExclude={handleExclude}
  satisfactionScale="1-5"
  loyaltyScale="1-5"
/>
```

## Sorting System
```typescript
interface SortConfig {
  field: 'id' | 'name' | 'satisfaction' | 'loyalty';
  direction: 'asc' | 'desc' | null;
}
```

## Row Virtualization
```typescript
const ROW_HEIGHT = 50;
const HEADER_HEIGHT = 40;
const FOOTER_HEIGHT = 60;

<FixedSizeList
  height={height - HEADER_HEIGHT - FOOTER_HEIGHT}
  width={width}
  itemCount={data.length}
  itemSize={ROW_HEIGHT}
>
  {Row}
</FixedSizeList>
```

## Statistics Calculation
```typescript
const calculateStats = (data: DataPoint[]) => {
  const totals = data.reduce((acc, curr) => ({
    satisfaction: acc.satisfaction + curr.satisfaction,
    loyalty: acc.loyalty + curr.loyalty,
    count: acc.count + 1
  }), { satisfaction: 0, loyalty: 0, count: 0 });

  return {
    averageSatisfaction: totals.satisfaction / totals.count,
    averageLoyalty: totals.loyalty / totals.count
  };
};
```

## Row Actions
- Edit
- Delete
- Exclude
- Multi-select
- Bulk actions

## Styling
```css
.data-display {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.table-row {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f3f4f6;
}
```

## Performance
- Row virtualization
- Memoized sorting
- Efficient updates
- Lazy loading

## Accessibility
- ARIA roles
- Sort indicators
- Action buttons
- Focus management

## Related Components
- DataEntryModule
- InputField
- NotificationSystem

## Notes
- Sort persistence
- Filter options
- Export capability
- Print layout
- Mobile view