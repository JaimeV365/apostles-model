# Date Validation System Implementation

## Core Validation Logic

### Input-Time Validation
The date entry system validates user input incrementally as the user types, providing immediate feedback for common errors.

### The `dateInputHandler.ts` File

This is the core file handling input validation. It exports two main functions:

```typescript
export const handleDateInput = (
  value: string,
  currentValue: string,
  dateFormat: string
): DateHandlerResult => { /* ... */ }

export const handleDateBlur = (
  value: string,
  dateFormat: string
): DateHandlerResult => { /* ... */ }
```

#### Input Handler
The `handleDateInput` function performs several key operations:

1. **Incremental Format Handling**
   ```typescript
   // Clean up the input - prevent multiple separators in a row
   // First normalize all separators to the format separator
   let normalizedValue = value.replace(/[/\-\.]/g, formatSeparator);
   
   // Remove any duplicate separators
   while (normalizedValue.includes(formatSeparator + formatSeparator)) {
     normalizedValue = normalizedValue.replace(formatSeparator + formatSeparator, formatSeparator);
   }
   ```

2. **Format-Specific Processing**
   ```typescript
   if (dateFormat.toLowerCase().startsWith('dd')) {
     // DD/MM/YYYY format logic
   } else if (dateFormat.toLowerCase().startsWith('mm')) {
     // MM/DD/YYYY format logic
   } else if (dateFormat.toLowerCase().startsWith('yyyy')) {
     // YYYY-MM-DD format logic
   }
   ```

3. **Validation Logic**
   ```typescript
   // Example validation for DD/MM/YYYY format
   if (parts[0]?.length === 2) {
     const day = parseInt(parts[0]);
     if (day === 0) {
       error = 'Day must be greater than 0';
     } else if (day > 31) {
       error = 'Day cannot be greater than 31';
     }

     // More validation...
   }
   ```

#### Blur Handler
The `handleDateBlur` function performs final validation when the user exits the field:

1. **Two-Digit Year Expansion**
   ```typescript
   // Handle 2-digit years
   if (formattedParts[yearIndex].length === 1 || formattedParts[yearIndex].length === 2) {
     formattedParts[yearIndex] = expandTwoDigitYear(formattedParts[yearIndex]);
   }
   ```

2. **Part Padding**
   ```typescript
   // Ensure month and day are 2 digits
   formattedParts[0] = parts[0].padStart(2, '0'); // day
   formattedParts[1] = parts[1].padStart(2, '0'); // month
   ```

3. **Complete Date Validation**
   ```typescript
   // Check for valid date
   if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
     const daysInMonth = getDaysInMonth(monthNum, yearNum);
     
     if (dayNum > daysInMonth) {
       // validation error
     }
   }
   ```

## Format-Specific Handlers

### DD/MM/YYYY Format (`ddmmyyyy.ts`)

```typescript
export const handleDDMMYYYYInput = (
  value: string,
  currentValue: string,
  dateFormat: string
): DateHandlerResult => {
  // Input handling specific to day-first format
  // ...

  // Day-specific validation
  if (parts[0]?.length === 2) {
    const day = parseInt(parts[0]);
    // Validate day
  }

  // Month-specific validation after day
  if (!error && parts[1]?.length === 2) {
    const month = parseInt(parts[1]);
    // Validate month
  }
}
```

### MM/DD/YYYY Format (`mmddyyyy.ts`)

```typescript
export const handleMMDDYYYYInput = (
  value: string,
  currentValue: string,
  dateFormat: string
): DateHandlerResult => {
  // Input handling specific to month-first format
  // ...

  // Month-specific validation first
  if (parts[0]?.length === 2) {
    const month = parseInt(parts[0]);
    // Validate month
  }

  // Day-specific validation after month
  if (!error && parts[1]?.length === 2) {
    const day = parseInt(parts[1]);
    // Validate day based on month
  }
}
```

### YYYY-MM-DD Format (`yyyymmdd.ts`)

```typescript
export const handleYYYYMMDDInput = (
  value: string,
  currentValue: string,
  dateFormat: string
): DateHandlerResult => {
  // Input handling specific to year-first format
  // ...

  // Year-specific validation first
  if (parts[0]?.length === 4) {
    const year = parseInt(parts[0]);
    // Validate year
  }

  // Month-specific validation after year
  if (parts[1]?.length === 2) {
    const month = parseInt(parts[1]);
    // Validate month
  }
}
```

## Helper Functions (`helpers.ts`)

The system uses several helper functions:

```typescript
// Check if a year is a leap year
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// Get the number of days in a month
export const getDaysInMonth = (month: number, year?: number): number => {
  if (month === 2) {
    return year && isLeapYear(year) ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
};

// Extract the separator from a date format
export const getFormatSeparator = (dateFormat: string): string => {
  return dateFormat.includes('/') ? '/' : 
         dateFormat.includes('-') ? '-' : '.';
};

// Convert two-digit years to four digits
export const expandTwoDigitYear = (yearStr: string): string => {
  const currentYear = new Date().getFullYear();
  const century = currentYear.toString().substring(0, 2);
  const enteredYear = parseInt(yearStr);
  const twoDigitCurrentYear = currentYear % 100;
  
  // Use current century if year is ≤ current two-digit year, otherwise use previous century
  return enteredYear <= twoDigitCurrentYear 
    ? `${century}${yearStr.padStart(2, '0')}` 
    : `${parseInt(century) - 1}${yearStr.padStart(2, '0')}`;
};
```

## Types and Interfaces (`types.ts`)

```typescript
export interface DateHandlerResult {
  formattedValue: string;  // The formatted date string
  error: string;           // Error message, empty if no error
  warning?: string;        // Warning message, optional
}
```

## Integration with DateField Component

### Component Implementation

```typescript
export const DateField: React.FC<DateFieldProps> = ({
  formState,
  errors,
  onInputChange,
  isLocked,
  hasExistingDates
}) => {
  const [dateFormat, setDateFormat] = useState('dd/MM/yyyy');
  const [internalError, setInternalError] = useState('');
  const [internalWarning, setInternalWarning] = useState('');

  const handleDateChange = (value: string) => {
    const result = handleDateInput(value, formState.date, dateFormat);
    onInputChange('date', result.formattedValue);
    
    // Set error or warning, but not both
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
    
    // Set error or warning, but not both
    if (result.error) {
      setInternalError(result.error);
      setInternalWarning('');
    } else {
      setInternalError('');
      setInternalWarning(result.warning || '');
    }
  };

  // Format conversion logic and UI rendering
  // ...
};
```

## Error Display

Error and warning display is handled through the component:

```tsx
<InputField
  type="text"
  placeholder={dateFormat.toLowerCase()}
  value={formState.date}
  onChange={handleDateChange}
  onBlur={handleBlur}
  error={internalError || errors.date}
/>
{internalWarning && !internalError && (
  <div className="warning-message">
    {internalWarning}
  </div>
)}
```

## Format Conversion

When the user changes the date format, existing dates need to be converted:

```typescript
const convertDateFormat = (dateStr: string, fromFormat: string, toFormat: string): string => {
  if (!dateStr || dateStr.length < 8) return dateStr; // Not enough characters for valid date
  
  // Extract the separators
  const fromSep = fromFormat.includes('/') ? '/' : 
                fromFormat.includes('-') ? '-' : '.';
  const toSep = toFormat.includes('/') ? '/' : 
              toFormat.includes('-') ? '-' : '.';
  
  // Split into parts
  const parts = dateStr.split(fromSep);
  if (parts.length !== 3) return dateStr;
  
  let day, month, year;
  
  // Extract based on source format
  if (fromFormat.startsWith('dd')) {
    [day, month, year] = parts;
  } else if (fromFormat.startsWith('MM')) {
    [month, day, year] = parts;
  } else if (fromFormat.startsWith('yyyy')) {
    [year, month, day] = parts;
  } else {
    return dateStr; // Unknown format
  }
  
  // Construct based on target format
  if (toFormat.startsWith('dd')) {
    return [day, month, year].join(toSep);
  } else if (toFormat.startsWith('MM')) {
    return [month, day, year].join(toSep);
  } else if (toFormat.startsWith('yyyy')) {
    return [year, month, day].join(toSep);
  }
  
  return dateStr;
};
```

## Format Locking Mechanism

Date formats are locked when data with dates already exists:

```tsx
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
{hasExistingDates && (
  <div className="validation-message">
    Date format is locked<br />while data with dates exists
  </div>
)}
```
