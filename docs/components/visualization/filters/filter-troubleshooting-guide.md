# Apostles Model Filter Troubleshooting Guide

## Common Issues and Solutions

### Filter Funnel Not Appearing

**Symptoms:**
- Filter funnel icon is not visible in the chart
- No way to access the filter panel

**Possible Causes:**
1. No filterable data detected
2. Only standard fields present (satisfaction/loyalty only)
3. No data variation (all points have identical values)

**Troubleshooting:**
1. Check if your data includes:
   - Date fields
   - Custom fields beyond the standard ones
   - Variation in satisfaction/loyalty scores
2. Examine the `hasFilterableData` function result:
```typescript
console.log('Has filterable data:', hasFilterableData);
console.log('Has dates:', data.some(item => item.date));
console.log('Satisfaction values:', new Set(data.map(item => item.satisfaction)));
```

**Solution:**
Add more varied data or include additional fields to enable filtering.

### Date Filters Not Working

**Symptoms:**
- Date range is set but data doesn't filter
- Date filters apply inconsistently

**Possible Causes:**
1. Inconsistent date formats in the data
2. Date parsing errors
3. Timezone issues

**Troubleshooting:**
1. Check the format of date values:
```typescript
console.log('Date formats:', data.map(item => ({
  date: item.date,
  parsed: new Date(item.date || '')
})));
```
2. Look for date parsing errors in console

**Solutions:**
1. Ensure consistent date formats in imported data
2. Add more date format detection to `isDateInRange` function
3. Add proper error handling for unparseable dates

### Point Counter Missing

**Symptoms:**
- Point counter not visible despite filters applied
- Counter checkbox has no effect

**Possible Causes:**
1. No filterable data detected (`hasFilterableData` is false)
2. Point counter checkbox state not being properly set
3. CSS z-index issues causing counter to be hidden

**Troubleshooting:**
1. Verify checkbox state: `console.log('Show point count:', showPointCount);`
2. Check if counter meets display conditions:
```typescript
console.log('Counter visibility conditions:', {
  hasFilterableData,
  showPointCount,
  totalPoints: data.filter(p => !p.excluded).length
});
```

**Solutions:**
1. Ensure `hasFilterableData` is true (add filterable data)
2. Verify the checkbox state is being properly passed to the counter
3. Check CSS for z-index conflicts

### Incorrect Field Names in Filter Panel

**Symptoms:**
- Field names appear incorrectly capitalized
- Acronyms like "CES" appear as "Ces" or "ces"

**Possible Causes:**
1. Improper field name formatting in `getFieldDisplayName`
2. Case sensitivity not preserved for acronyms

**Troubleshooting:**
1. Log field names before and after formatting:
```typescript
console.log('Field names:', availableFields.map(f => ({
  original: f.field,
  formatted: getFieldDisplayName(f.field)
})));
```

**Solutions:**
1. Update the `getFieldDisplayName` function to handle special cases
2. Ensure acronyms are added to the specialFieldMap
3. Use case-insensitive comparison for matching special fields

### Filter Panel Not Closing

**Symptoms:**
- Filter panel stays open when clicking outside
- Close button or Escape key doesn't work

**Possible Causes:**
1. Event handler not attached properly
2. Event propagation issues
3. React event handling conflicts

**Troubleshooting:**
1. Check if click events are reaching document:
```typescript
document.addEventListener('click', () => console.log('Document clicked'));
```
2. Verify click handler logic:
```typescript
console.log('Click target in panel:', filterPanelRef.current?.contains(event.target));
```

**Solutions:**
1. Review event listener setup in `useEffect`
2. Ensure proper cleanup in effect return function
3. Check for event propagation issues with `stopPropagation()`

### Filters Not Resetting

**Symptoms:**
- "Reset All" button doesn't clear filters
- Some filters persist after reset

**Possible Causes:**
1. Reset function not completely clearing state
2. Remaining reference to old state

**Troubleshooting:**
1. Check reset implementation:
```typescript
console.log('Before reset:', filterState);
resetFilters();
console.log('After reset:', filterState);
```

**Solutions:**
1. Ensure reset creates fresh state objects:
```typescript
const resetFilters = () => {
  setFilterState({
    dateRange: {
      startDate: null,
      endDate: null,
      preset: 'all'
    },
    attributes: filterState.attributes.map(attr => ({
      ...attr,
      values: new Set()
    })),
    isActive: false,
  });
  setDatePickerVisible(false);
  setCustomStartDate('');
  setCustomEndDate('');
};
```

## Performance Issues

### Slow Filter Application

**Symptoms:**
- Noticeable lag when applying filters
- UI freezes momentarily during filtering

**Possible Causes:**
1. Large dataset
2. Inefficient filter algorithm
3. Too many re-renders

**Troubleshooting:**
1. Measure filter application time:
```typescript
console.time('Filter application');
applyFilters();
console.timeEnd('Filter application');
```
2. Check data size: `console.log('Data size:', data.length);`

**Solutions:**
1. Optimize filter application logic
2. Use memoization for expensive computations
3. Consider pagination for very large datasets

### Memory Leaks

**Symptoms:**
- Browser memory usage grows over time
- Performance degrades with extended use

**Possible Causes:**
1. Event listeners not properly cleaned up
2. Closure references to old state

**Troubleshooting:**
1. Check effect cleanup:
```typescript
useEffect(() => {
  console.log('Adding event listener');
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    console.log('Removing event listener');
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [handleClickOutside]);
```

**Solutions:**
1. Ensure all event listeners are removed in effect cleanup
2. Use `useCallback` for event handlers to maintain stable references
3. Avoid capturing large objects in closures

## UI Styling Issues

### Misaligned Filter Panel

**Symptoms:**
- Filter panel appears in wrong position
- Panel partially off-screen

**Possible Causes:**
1. CSS positioning issues
2. Responsive design breakpoints
3. Z-index conflicts

**Troubleshooting:**
1. Inspect element positioning:
```typescript
const panelElement = document.querySelector('.filter-panel');
console.log('Panel position:', {
  top: panelElement?.style.top,
  right: panelElement?.style.right,
  width: panelElement?.style.width,
  transform: panelElement?.style.transform
});
```

**Solutions:**
1. Update CSS positioning:
```css
.filter-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 350px;
  transform: translateX(100%);
}

.filter-panel.open {
  transform: translateX(0);
}
```

### CSS Transitions Not Working

**Symptoms:**
- Filter panel appears/disappears without animation
- Smooth transitions missing

**Possible Causes:**
1. Missing transition properties in CSS
2. Conflicting CSS rules
3. React rendering optimization issues

**Troubleshooting:**
1. Check applied styles:
```typescript
const panel = document.querySelector('.filter-panel');
console.log('Computed styles:', window.getComputedStyle(panel));
```

**Solutions:**
1. Ensure proper transition CSS:
```css
.filter-panel {
  transition: transform 0.3s ease;
}
```
2. Use React transition group for complex animations

### Filter Toggle Button Positioning

**Symptoms:**
- Filter toggle button in wrong position
- Button overlapping with other elements

**Possible Causes:**
1. CSS positioning issues
2. Container layout problems
3. Z-index conflicts

**Troubleshooting:**
1. Check button positioning:
```typescript
const button = document.querySelector('.filter-toggle');
console.log('Button position:', button.getBoundingClientRect());
```

**Solutions:**
1. Update button positioning CSS:
```css
.filter-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
}
```

## Data-Related Issues

### Missing Filter Options

**Symptoms:**
- Expected filter options not appearing
- Some data fields not available for filtering

**Possible Causes:**
1. Data field detection issues
2. Empty or null values in data
3. Case sensitivity problems

**Troubleshooting:**
1. Check available fields extraction:
```typescript
console.log('Available fields:', availableFields);
console.log('Data fields:', data.map(item => Object.keys(item)));
```

**Solutions:**
1. Update field detection logic to handle edge cases
2. Add preprocessing step to clean data
3. Improve handling of null/undefined values

### Incorrect Data Type Handling

**Symptoms:**
- Numeric fields treated as strings
- Date fields not recognized properly

**Possible Causes:**
1. Type conversion issues
2. Inconsistent data formats
3. Missing type detection

**Troubleshooting:**
1. Check field value types:
```typescript
const fieldTypes = {};
data.forEach(item => {
  Object.entries(item).forEach(([key, value]) => {
    fieldTypes[key] = fieldTypes[key] || [];
    fieldTypes[key].push(typeof value);
  });
});
console.log('Field types:', fieldTypes);
```

**Solutions:**
1. Add explicit type detection and conversion
2. Normalize data types during import
3. Use specialized handling for dates and numbers

## Environment-Specific Issues

### Mobile View Problems

**Symptoms:**
- Filter panel too large on mobile screens
- Controls difficult to use on touch devices

**Possible Causes:**
1. Missing responsive breakpoints
2. Touch event handling issues
3. Small tap targets

**Troubleshooting:**
1. Test with mobile device emulation
2. Check viewport settings

**Solutions:**
1. Add mobile-specific styles:
```css
@media (max-width: 768px) {
  .filter-panel {
    width: 300px;
  }
}

@media (max-width: 480px) {
  .filter-panel {
    width: 100%;
  }
}
```
2. Increase size of interactive elements for touch

### Cross-Browser Compatibility

**Symptoms:**
- Filters work in some browsers but not others
- Visual differences between browsers

**Possible Causes:**
1. Browser-specific CSS issues
2. JavaScript compatibility problems
3. Event handling differences

**Troubleshooting:**
1. Test in multiple browsers
2. Check for browser console errors

**Solutions:**
1. Add browser-specific CSS prefixes
2. Use polyfills for unsupported features
3. Test thoroughly across browsers
