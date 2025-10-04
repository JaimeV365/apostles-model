# Date Field Integration with Form System

This document describes how the date field component integrates with the broader form system in the application.

## Form Integration Overview

The date field is integrated into the form system through several key touchpoints:

1. **Form State Management**
2. **Validation Integration**
3. **Error Handling**
4. **Data Persistence**
5. **Duplicate Detection**
6. **CSV Import Integration**

## Form State Management

The date field is integrated into the form state using the `useDataInput` hook in the parent form:

```typescript
// src/components/data-entry/forms/DataInput/hooks/useDataInput.ts

export const useDataInput = (props: DataInputProps) => {
  const initialFormState: FormState = {
    id: props.editingData?.id || '',
    name: props.editingData?.name || '',
    email: props.editingData?.email || '',
    satisfaction: props.editingData?.satisfaction?.toString() || '',
    loyalty: props.editingData?.loyalty?.toString() || '',
    date: props.editingData?.date || ''  // Date field included in form state
  };

  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const handleInputChange = useCallback((field: keyof FormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  // ... more hook logic
};
```

This hook is used in the main `DataInput` component:

```typescript
// src/components/data-entry/forms/DataInput/index.tsx

const DataInput: React.FC<DataInputProps> = (props) => {
  const {
    formState,
    errors,
    handleInputChange,
    handleSubmit: originalSubmit,
    resetForm
  } = useDataInput(props);
  
  // ... 
  
  return (
    <form onSubmit={handleSubmit} className="data-input" noValidate>
      <CardLayout title="Manual Entry">
        <div className="data-input__grid">
          {/* ... other fields ... */}
          
          <DateField
            formState={formState}
            errors={errors}
            onInputChange={handleInputChange}
            isLocked={props.scalesLocked}
            hasExistingDates={hasExistingDates}
          />
          
          {/* ... other fields ... */}
        </div>
      </CardLayout>
    </form>
  );
};
```

## Validation Integration

The date field's validation is integrated with the form validation system in `useFormValidation`:

```typescript
// src/components/data-entry/forms/DataInput/hooks/useFormValidation.ts

export const validateForm = (
  formState: FormState,
  satisfactionScale: ScaleFormat,
  loyaltyScale: ScaleFormat,
  existingIds: string[]
): { isValid: boolean; errors: Partial<Record<keyof FormState, string>> } => {
  const errors: Partial<Record<keyof FormState, string>> = {};
  let isValid = true;

  // ... other validations ...

  // Date validation if provided
  if (formState.date) {
    // Use the handleDateBlur function to validate the date
    const dateResult = handleDateBlur(formState.date, 'dd/MM/yyyy');
    if (dateResult.error) {
      errors.date = dateResult.error;
      isValid = false;
    }
  }

  return { isValid, errors };
};
```

## Error Handling

The date component integrates with the form error handling system in several ways:

1. **Local error state** in the DateField component for immediate feedback:
   ```typescript
   const [internalError, setInternalError] = useState('');
   const [internalWarning, setInternalWarning] = useState('');
   ```

2. **Error propagation** to the parent form state:
   ```typescript
   onInputChange('date', result.formattedValue);
   ```

3. **Error display** in the UI:
   ```typescript
   <InputField
     // ...
     error={internalError || errors.date}
   />
   {internalWarning && !internalError && (
     <div className="warning-message">
       {internalWarning}
     </div>
   )}
   ```

## Data Persistence

When a form is submitted, the date data is included in the data point that will be stored:

```typescript
// src/components/data-entry/DataEntryModule.tsx

const handleDataSubmit = (id: string, name: string, email: string, satisfaction: number, loyalty: number, date: string) => {
  try {
    let newId = id;
    if (!newId) {
      newId = idCounter.getNextId();
    }

    const newDataPoint: DataPoint = {
      id: newId,
      name,
      email: email || undefined,
      satisfaction,
      loyalty,
      date: date || undefined,  // Date is included in the data point
      group: determineGroup(satisfaction, loyalty)
    };

    // ... save data point logic ...
  } catch (error) {
    // ... error handling ...
  }
};
```

The data is then saved to local storage:

```typescript
storageManager.saveState({
  data: newData,
  uploadHistory
});
```

## Duplicate Detection

The date field is included in the duplicate detection logic:

```typescript
// src/components/data-entry/hooks/useDuplicateCheck.ts

export const useDuplicateCheck = (existingData: DataPoint[]) => {
  // ...

  const checkForDuplicates = (newDataPoint: DataPoint): DuplicateCheckResult => {
    // Normalize new data point values
    const normalizedNewName = newDataPoint.name?.trim() || '';
    const normalizedNewEmail = newDataPoint.email?.trim().toLowerCase() || '';
    const normalizedNewDate = newDataPoint.date?.trim() || '';  // Date is used in duplicate detection
    
    const duplicate = existingData.find(existing => {
      // Different ID check (if same ID, it's an edit not duplicate)
      if (existing.id === newDataPoint.id) return false;
      
      // Normalize existing values
      const normalizedExistingName = existing.name?.trim() || '';
      const normalizedExistingEmail = existing.email?.trim().toLowerCase() || '';
      const normalizedExistingDate = existing.date?.trim() || '';  // Date is used in duplicate detection

      // 1. First condition: Satisfaction and loyalty values must match
      const valueMatch = existing.satisfaction === newDataPoint.satisfaction && 
                        existing.loyalty === newDataPoint.loyalty;
      
      if (!valueMatch) return false;  // If values don't match, it's not a duplicate

      // 2. Field match checks including date
      // ...
      
      // Date field matching condition
      const dateMatch = (normalizedExistingDate === '' && normalizedNewDate === '') || 
                       (normalizedExistingDate !== '' && normalizedNewDate !== '' && 
                        normalizedExistingDate === normalizedNewDate);
      
      // Check for substantive date match
      const hasSubstantiveDateMatch = normalizedExistingDate !== '' && 
                                     normalizedNewDate !== '' && 
                                     normalizedExistingDate === normalizedNewDate;
      
      const hasAnySubstantiveMatch = hasSubstantiveNameMatch || 
                                    hasSubstantiveEmailMatch || 
                                    hasSubstantiveDateMatch;
      
      // It's a duplicate if there's at least one substantive match AND all fields match our criteria
      return hasAnySubstantiveMatch && nameMatch && emailMatch && dateMatch;
    });

    // ... rest of duplicate handling logic ...
  };

  // ...
};
```

## CSV Import Integration

The date field is also supported in CSV imports:

```typescript
// src/components/data-entry/forms/CSVImport.tsx

// Regular expression that matches CSV header for date field
const dateHeaderRegex = /^date$/i;

// In validation logic
if (headers.some(h => dateHeaderRegex.test(h))) {
  // Process date column
  const dateHeader = headers.find(h => dateHeaderRegex.test(h));
  
  processedData = processedData.map(row => {
    const dateValue = row[dateHeader!];
    return {
      ...row,
      date: dateValue ? dateValue.trim() : undefined
    };
  });
}
```

## Date Format Lock Management

The date format is locked when data with dates already exists to maintain consistency:

```typescript
// In DateField.tsx
<select
  value={dateFormat}
  onChange={handleFormatChange}
  className="date-format-select"
  disabled={hasExistingDates}
>
  {/* format options */}
</select>

// In DataInput/index.tsx
const hasExistingDates = props.data?.some((item: { date?: string }) => 
  item.date && item.date.trim() !== ''
) || false;
```

This is passed from the parent component:

```typescript
<DateField
  formState={formState}
  errors={errors}
  onInputChange={handleInputChange}
  isLocked={props.scalesLocked}
  hasExistingDates={hasExistingDates}
/>
```

## Data Table Integration

The date is displayed in the data table:

```typescript
// src/components/data-entry/table/DataDisplay.tsx

const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
  const point = sortedData[index];
  return (
    <div style={{ /* ... */ }}>
      {/* ... other fields ... */}
      <div style={{ flex: 0.8, padding: '8px' }}>{point.date || '-'}</div>
      {/* ... other fields ... */}
    </div>
  );
};
```

The date is also used in sorting:

```typescript
// Sort handling for date column
if (sortField === 'date') {
  const aValue = a[sortField] || '';
  const bValue = b[sortField] || '';
  return sortDirection === 'asc' 
    ? aValue.localeCompare(bValue) 
    : bValue.localeCompare(aValue);
}
```

## Historical Data Usage

The date information can be used for historical analysis in future features:

1. Tracking customer changes over time
2. Analyzing trends by date
3. Comparing snapshots from different timeframes
4. Filtering visualizations by date periods
5. Creating time-based reports

This planned functionality is described in the historical feature specifications documents:

- `historical-feature-spec.md`
- `historical-feature-spec-reviewed.md`
- `historical-feature-spec reviewed 2.md`
- `historical-implementation-plan.md`
- `historical-implementation-plan-reviewed.md`
- `historical-technical-implementation.md`

## Form Submission

When the form is submitted, the date field, along with all other field values, is processed:

```typescript
// src/components/data-entry/forms/DataInput/index.tsx

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // Validate form first
  const validationResult = originalSubmit(e, false);
  
  if (validationResult?.isValid) {
    // Create data point from form state
    const newDataPoint: DataPoint = {
      id: formState.id || '',
      name: formState.name,
      email: formState.email || undefined,
      satisfaction: Number(formState.satisfaction),
      loyalty: Number(formState.loyalty),
      date: formState.date || undefined,  // Date is included here
      group: 'default'
    };
    
    // ... rest of submission logic ...
  }
};
```

## Conclusion

The date field is fully integrated into the form system with:

1. Proper state management
2. Comprehensive validation
3. Consistent error handling
4. Duplicate detection support
5. Data persistence
6. CSV import capabilities
7. Table display and sorting

This integration ensures that date data is properly collected, validated, and managed throughout the application.
