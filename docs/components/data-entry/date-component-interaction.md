# Date Component Interaction Flow

## Component Interaction Overview

The date entry system involves multiple components and utilities that work together to provide a seamless date input experience. This document outlines how these components interact.

## Main Component Flow

### Input Flow Diagram
```
┌───────────────┐     ┌────────────────┐     ┌────────────────┐
│ DateField.tsx │────▶│ InputField.tsx │────▶│ Event Handlers │
└───────────────┘     └────────────────┘     └────────────────┘
        │                                             │
        ▼                                             ▼
┌───────────────┐     ┌────────────────┐     ┌────────────────┐
│ Date Format   │     │ dateInputHandler │◀───│  Format-specific │
│  Selection    │     │     .ts         │     │     Handlers   │
└───────────────┘     └────────────────┘     └────────────────┘
                              │
                              ▼
                      ┌────────────────┐
                      │ Parent Form    │
                      │ State Updates  │
                      └────────────────┘
```

## Detailed Component Interactions

### 1. DateField → InputField

```typescript
// DateField.tsx
<InputField
  type="text"
  placeholder={dateFormat.toLowerCase()}
  value={formState.date}
  onChange={handleDateChange}
  onBlur={handleBlur}
  error={internalError || errors.date}
/>
```

- `DateField` renders an `InputField` component
- Provides date-specific event handlers
- Manages internal error/warning state
- Forwards form state values

### 2. InputField → User Events

```typescript
// InputField.tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  onChange(e.target.value);
};

<input
  type={type}
  value={value}
  onChange={handleChange}
  onBlur={() => onBlur?.(value)}
  placeholder={placeholder}
  className={`input-field ${error ? 'input-field--error' : ''}`}
  required={required}
/>
```

- Captures keyboard events
- Calls appropriate handlers with updated values
- Manages basic input field behavior
- Applies appropriate CSS classes for error states

### 3. DateField → Date Event Handlers

```typescript
// DateField.tsx
const handleDateChange = (value: string) => {
  const result = handleDateInput(value, formState.date, dateFormat);
  onInputChange('date', result.formattedValue);
  
  if (result.error) {
    setInternalError(result.error);
    setInternalWarning('');
  } else {
    setInternalError('');
    setInternalWarning(result.warning || '');
  }
};

const handleBlur = (value: string) => {
  const result = handleDateBlur(value, dateFormat);
  onInputChange('date', result.formattedValue);
  
  if (result.error) {
    setInternalError(result.error);
    setInternalWarning('');
  } else {
    setInternalError('');
    setInternalWarning(result.warning || '');
  }
};
```

- Calls date handling utilities
- Updates form state via `onInputChange`
- Manages internal error/warning state
- Prioritizes errors over warnings

### 4. DateField → Date Format Selection

```typescript
// DateField.tsx
const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const newFormat = e.target.value;
  
  // First convert any existing date to the new format
  if (formState.date) {
    const convertedDate = convertDateFormat(formState.date, dateFormat, newFormat);
    onInputChange('date', convertedDate);
  }
  
  // Then update the format
  setDateFormat(newFormat);
};

<select
  value={dateFormat}
  onChange={handleFormatChange}
  className="date-format-select"
  disabled={hasExistingDates}
>
  {DATE_FORMATS.map(format => (
    <option key={format.value} value={format.value}>
      {format.label}
    </option>
  ))}
</select>
```

- Manages date format selection
- Converts existing date when format changes
- Respects format locking when data exists
- Updates UI to reflect current format

### 5. Date Handler → Date Format Handlers

```typescript
// dateInputHandler.ts
let formattedValue = '';

// Different validation based on date format
if (dateFormat.toLowerCase().startsWith('dd')) {
  // DD/MM/YYYY format logic
} else if (dateFormat.toLowerCase().startsWith('mm')) {
  // MM/DD/YYYY format logic
} else if (dateFormat.toLowerCase().startsWith('yyyy')) {
  // YYYY-MM-DD format logic
}

return { formattedValue, error };
```

- Determines which format-specific handler to use
- Processes input according to selected format
- Returns formatted value and any errors

### 6. DateField → Parent Form State

```typescript
// DataInput/index.tsx via DateField
const handleInputChange = (field: keyof FormState, value: string) => {
  setFormState(prev => ({ ...prev, [field]: value }));
  setErrors(prev => ({ ...prev, [field]: undefined }));
};

// Used in DateField
onInputChange('date', result.formattedValue);
```

- Updates parent form state with formatted date
- Clears parent form errors when value changes
- Maintains form state consistency

## State and Data Flow

### Form State Updates
1. User types in date field
2. `handleDateChange` processes input
3. `handleDateInput` formats and validates
4. `onInputChange` updates parent form state
5. Format-specific validation occurs
6. UI updates to reflect changes

### Blur Event Flow
1. User tabs out or clicks away
2. `handleBlur` processes final validation
3. `handleDateBlur` performs complete validation
4. Two-digit years expanded, parts padded
5. Final validation runs
6. Form state updates with fully formatted date

### Format Change Flow
1. User selects new date format
2. `handleFormatChange` processes change
3. Existing date converted to new format
4. Format state updates
5. UI updates to reflect new format
6. Further input follows new format rules

## Error Handling Flow

### Input-Time Errors
1. User types invalid value
2. `handleDateInput` detects error
3. Error message returned in result
4. `setInternalError` updates error state
5. Error displayed via InputField

### Blur-Time Errors
1. User leaves field with invalid/incomplete date
2. `handleDateBlur` performs final validation
3. Error detected and returned in result
4. Error displayed in UI
5. User must fix before submission

### Warning Flow
1. Valid but unusual date detected
2. Warning message returned in result
3. `setInternalWarning` updates warning state
4. Warning displayed if no errors present
5. Form can still be submitted with warnings

## DateTime Format Locking Mechanism

The date format becomes locked when dates already exist in the dataset to maintain consistency:

```typescript
// DateField.tsx
<select
  value={dateFormat}
  onChange={handleFormatChange}
  className="date-format-select"
  disabled={hasExistingDates}
>
  {/* Format options */}
</select>

// When hovering over disabled selector
{hasExistingDates && (
  <div className="validation-message">
    Date format is locked<br />while data with dates exists
  </div>
)}
```

- `hasExistingDates` flag comes from parent component
- When true, format selector is disabled
- Hover message explains the lock reason
- Ensures consistent date formats across dataset

## Form Validation Integration

The date validation is integrated with the overall form validation:

```typescript
// useFormValidation.ts
if (formState.date) {
  // Use the handleDateBlur function to validate the date
  const dateResult = handleDateBlur(formState.date, 'dd/MM/yyyy');
  if (dateResult.error) {
    errors.date = dateResult.error;
    isValid = false;
  }
}
```

- Form submission validation uses same validators
- Date errors prevent form submission
- Uses blur handler for complete validation
