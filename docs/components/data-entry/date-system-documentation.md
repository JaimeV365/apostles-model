# Date Entry System Documentation

## Overview

The date entry system is a sophisticated component that provides an intuitive, error-resistant interface for entering dates in various formats. It incorporates real-time validation, format selection, auto-formatting, and comprehensive error handling to ensure data integrity while maintaining a smooth user experience.

## Architecture

### Directory Structure

```
src/components/data-entry/
└── utils/
    └── date/
        ├── index.ts               # Main exports
        ├── dateInputHandler.ts    # Core input handling logic
        ├── blurHandler.ts         # Blur event handling
        ├── helpers.ts             # Helper functions
        ├── types.ts               # Type definitions
        └── formatHandlers/        # Format-specific handlers
            ├── ddmmyyyy.ts        # DD/MM/YYYY format
            ├── mmddyyyy.ts        # MM/DD/YYYY format
            └── yyyymmdd.ts        # YYYY-MM-DD format
```

### Component Integration

```
DataInput
└── DateField
    └── InputField
```

## Core Components

### DateField

**File Path:** `src/components/data-entry/forms/DataInput/components/DateField.tsx`

The primary component that provides the date input interface with format selection.

#### Props Interface

```typescript
interface DateFieldProps {
  formState: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  onInputChange: (field: keyof FormState, value: string) => void;
  isLocked: boolean;
  hasExistingDates: boolean;
}
```

#### Key Features

1. **Format Selector**
   - Dropdown menu for selecting date format
   - Supported formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
   - Format locking to maintain consistency with existing data

2. **Format Conversion**
   - Automatic conversion when changing formats
   - Preserves date value across format changes
   - Handles edge cases in conversion

3. **Error and Warning Display**
   - Shows validation errors inline
   - Displays warnings for unusual dates
   - Separates errors (blocking) from warnings (non-blocking)

## Date Handling Utilities

### dateInputHandler.ts

**File Path:** `src/components/data-entry/utils/date/dateInputHandler.ts`

Handles real-time validation and formatting as users type.

#### Key Function

```typescript
export const handleDateInput = (
  value: string,
  currentValue: string,
  dateFormat: string
): DateHandlerResult => {
  // Input processing logic
  // ...
  return { formattedValue, error, warning };
};
```

#### Features

1. **Real-time Validation**
   - Validates as user types
   - Early error detection for impossible values
   - Preserves input state when backspacing

2. **Auto-formatting**
   - Automatically inserts separators
   - Handles multiple separator types (/, -, .)
   - Normalizes input to match selected format

3. **Format-specific Processing**
   - Different logic for each date format
   - Custom validation rules per format
   - Specialized handling for each date part

### blurHandler.ts

**File Path:** `src/components/data-entry/utils/date/blurHandler.ts`

Provides final validation and formatting when the field loses focus.

#### Key Function

```typescript
export const handleDateBlur = (
  value: string,
  dateFormat: string
): DateHandlerResult => {
  // Complete date validation
  // ...
  return { formattedValue, error, warning };
};
```

#### Features

1. **Complete Validation**
   - Full date validation rules
   - Cross-field validation (day, month, year)
   - Calendar rules (month lengths, leap years)

2. **Date Normalization**
   - Two-digit year expansion
   - Date part padding with zeros
   - Separator normalization

3. **Warning Detection**
   - Future date detection
   - Unusual date detection (too old/too recent)
   - Suspicious patterns

### helpers.ts

**File Path:** `src/components/data-entry/utils/date/helpers.ts`

Provides reusable utility functions for date operations.

#### Key Functions

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

// Get the separator from a date format
export const getFormatSeparator = (dateFormat: string): string => {
  return dateFormat.includes('/') ? '/' : 
         dateFormat.includes('-') ? '-' : '.';
};

// Convert two-digit years to four digits
export const expandTwoDigitYear = (yearStr: string): string => {
  // Two-digit year expansion logic
  // ...
};
```

### Format-Specific Handlers

**Directory Path:** `src/components/data-entry/utils/date/formatHandlers/`

Specialized handlers for each supported date format.

#### dd/mm/yyyy Format (ddmmyyyy.ts)

```typescript
export const handleDDMMYYYYInput = (
  value: string,
  currentValue: string,
  dateFormat: string
): DateHandlerResult => {
  // Day-month-year format handling
  // ...
};
```

#### mm/dd/yyyy Format (mmddyyyy.ts)

```typescript
export const handleMMDDYYYYInput = (
  value: string,
  currentValue: string,
  dateFormat: string
): DateHandlerResult => {
  // Month-day-year format handling
  // ...
};
```

#### yyyy-mm-dd Format (yyyymmdd.ts)

```typescript
export const handleYYYYMMDDInput = (
  value: string,
  currentValue: string,
  dateFormat: string
): DateHandlerResult => {
  // Year-month-day format handling
  // ...
};
```

## Type Definitions

**File Path:** `src/components/data-entry/utils/date/types.ts`

```typescript
export interface DateHandlerResult {
  formattedValue: string;  // The formatted date string
  error: string;           // Error message, empty if no error
  warning?: string;        // Warning message, optional
}
```

## Validation Rules

### Basic Validation

1. **Day Validation**
   - Must be between 1 and 31
   - Must be valid for the specific month
   - Special handling for February

2. **Month Validation**
   - Must be between 1 and 12
   - Proper validation against month length

3. **Year Validation**
   - Must be 2 or 4 digits (not 1 or 3)
   - Two-digit years expanded based on current year
   - Leap year validation for February 29th

### Advanced Validation

1. **Calendar Validation**
   - Days validated against month length (e.g., April has 30 days)
   - February validated for 28/29 days based on leap years
   - Handles leap year calculations correctly

2. **Contextual Validation**
   - Future dates generate warnings
   - Dates far in the past generate warnings
   - Dates far in the future generate warnings

## Key Workflows

### Date Input Workflow

1. **User Types Character**
   - Input passed to `handleDateInput`
   - Format determined from `dateFormat` parameter
   - Input normalized and formatted for chosen format

2. **Separator Handling**
   - Auto-insertion based on input pattern
   - When user types separator, parts may be zero-padded
   - Different separators normalized to format standard

3. **Real-time Validation**
   - Basic validation as user types
   - Early error detection for impossible values
   - Errors displayed immediately below input

### Blur Handling Workflow

1. **User Exits Field**
   - Input passed to `handleDateBlur`
   - Full validation performed
   - Two-digit years expanded to four digits

2. **Date Normalization**
   - Parts padded with zeros as needed
   - Separator standardized based on format
   - Date fully formatted according to selected format

3. **Comprehensive Validation**
   - Full calendar validation (days in month, leap years)
   - Warning generation for unusual dates
   - Validation errors displayed if issues found

### Format Change Workflow

1. **User Selects New Format**
   - Current date converted to new format using `convertDateFormat`
   - All date parts retained during conversion
   - Format state updated

2. **Format Lock Detection**
   - Format changes blocked if `hasExistingDates` is true
   - User informed about lock reason when hovering
   - Ensures consistency in dataset

## Format Conversion

### Format Mapping

The system supports conversion between formats:

```typescript
const convertDateFormat = (dateStr: string, fromFormat: string, toFormat: string): string => {
  // Extract date parts based on source format
  if (fromFormat.startsWith('dd')) {
    [day, month, year] = parts;
  } else if (fromFormat.startsWith('MM')) {
    [month, day, year] = parts;
  } else if (fromFormat.startsWith('yyyy')) {
    [year, month, day] = parts;
  }
  
  // Reconstruct based on target format
  if (toFormat.startsWith('dd')) {
    return [day, month, year].join(toSep);
  } else if (toFormat.startsWith('MM')) {
    return [month, day, year].join(toSep);
  } else if (toFormat.startsWith('yyyy')) {
    return [year, month, day].join(toSep);
  }
};
```

### Separator Handling

Separators are intelligently managed:

1. **Format Detection**
   - Separator from format string detected with `getFormatSeparator`
   - User input separators normalized to format standard
   - Multiple consecutive separators reduced to single separator

2. **Separator Flexibility**
   - Accepts /, -, and . as input separators
   - Normalizes to the format's preferred separator
   - Maintains consistent output format

## Two-Digit Year Handling

### Year Expansion Rules

Two-digit years are expanded to four digits using a sliding window approach:

```typescript
export const expandTwoDigitYear = (yearStr: string): string => {
  const currentYear = new Date().getFullYear();
  const century = currentYear.toString().substring(0, 2);
  const enteredYear = parseInt(yearStr);
  const twoDigitCurrentYear = currentYear % 100;
  
  // Years <= current two-digit year get current century
  // Years > current two-digit year get previous century
  return enteredYear <= twoDigitCurrentYear 
    ? `${century}${yearStr.padStart(2, '0')}` 
    : `${parseInt(century) - 1}${yearStr.padStart(2, '0')}`;
};
```

This means:
- For current year 2025 (two-digit: 25):
  - Years 00-25 → 2000-2025
  - Years 26-99 → 1926-1999

## Error and Warning Messaging

### Error Types

1. **Format Errors**
   - "Day must be greater than 0"
   - "Day cannot be greater than 31"
   - "Month must be greater than 0"
   - "Month cannot be greater than 12"
   - "Year must be 2 or 4 digits"

2. **Calendar Errors**
   - "February cannot have more than 29 days"
   - "February 2023 is not a leap year and has 28 days"
   - "April has only 30 days"

3. **Completeness Errors**
   - "Please enter a complete date"

### Warning Types

1. **Future Warning**
   - "Date is in the future"

2. **Range Warnings**
   - "Date is very far in the past"
   - "Date is very far in the future"

## Integration With Form System

### Form State Integration

```typescript
// In DataInput/index.tsx
<DateField
  formState={formState}
  errors={errors}
  onInputChange={handleInputChange}
  isLocked={props.scalesLocked}
  hasExistingDates={hasExistingDates}
/>

// In DateField.tsx
const handleDateChange = (value: string) => {
  const result = handleDateInput(value, formState.date, dateFormat);
  onInputChange('date', result.formattedValue);
  
  // Update error/warning state
  if (result.error) {
    setInternalError(result.error);
    setInternalWarning('');
  } else {
    setInternalError('');
    setInternalWarning(result.warning || '');
  }
};
```

### Format Locking

The system locks the date format when data with dates already exists:

```typescript
// In DataInput/index.tsx
const hasExistingDates = props.data?.some((item: { date?: string }) => 
  item.date && item.date.trim() !== ''
) || false;

// In DateField.tsx
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

### Form Validation Integration

```typescript
// In useFormValidation.ts
if (formState.date) {
  // Use the handleDateBlur function to validate the date
  const dateResult = handleDateBlur(formState.date, 'dd/MM/yyyy');
  if (dateResult.error) {
    errors.date = dateResult.error;
    isValid = false;
  }
}
```

## Usage Examples

### Basic Date Entry

```tsx
import React, { useState } from 'react';
import { DateField } from './components/DateField';

const DateEntryExample = () => {
  const [formState, setFormState] = useState({ date: '' });
  const [errors, setErrors] = useState({});
  
  const handleInputChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };
  
  return (
    <DateField
      formState={formState}
      errors={errors}
      onInputChange={handleInputChange}
      isLocked={false}
      hasExistingDates={false}
    />
  );
};
```

### Advanced Usage with Format Locking

```tsx
import React, { useState, useEffect } from 'react';
import { DateField } from './components/DateField';

const AdvancedDateEntry = ({ existingData }) => {
  const [formState, setFormState] = useState({ date: '' });
  const [errors, setErrors] = useState({});
  
  // Check if there are existing dates
  const hasExistingDates = existingData.some(item => 
    item.date && item.date.trim() !== ''
  );
  
  const handleInputChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };
  
  return (
    <DateField
      formState={formState}
      errors={errors}
      onInputChange={handleInputChange}
      isLocked={existingData.length > 0}
      hasExistingDates={hasExistingDates}
    />
  );
};
```

## Styling

### CSS Classes

```css
/* Date field container */
.date-field {
  position: relative;
}

/* Input container */
.date-input-container {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  width: 100%;
}

/* Format selector */
.date-format-select {
  height: 42px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 16px;
  width: 140px;
}

/* Error message */
.error-message {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: bold;
  color: #dc2626;
  background-color: #fee2e2;
  border-radius: 4px;
  border: 1px solid #fca5a5;
  z-index: 15;
  width: 100%;
}

/* Warning message */
.warning-message {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  background-color: #fef3c7;
  color: #f97316;
  border: 1px solid #f97316;
  border-radius: 4px;
  z-index: 15;
  width: 100%;
}

/* Format lock message */
.validation-message {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  background-color: #fef3c7;
  color: #f97316;
  border: 1px solid #f97316;
  border-radius: 4px;
  z-index: 20;
  width: max-content;
  display: none;
}

/* Show lock message on hover */
.date-format-container:hover .validation-message {
  display: block;
}
```

## Performance Considerations

### Optimization Techniques

1. **Efficient Input Handling**
   - Minimal state updates during typing
   - Normalization before processing to reduce edge cases
   - Early validation to catch obvious errors

2. **Memoization**
   - State updates only when necessary
   - Event handlers defined with useCallback
   - Format handlers optimized for reuse

3. **Controlled Re-renders**
   - Internal state for errors/warnings to reduce parent re-renders
   - Local validation to minimize form-level re-validation
   - Progressive validation to distribute processing

## Accessibility Considerations

1. **Keyboard Accessibility**
   - Full keyboard navigation support
   - Format selector accessible via keyboard
   - Error messages linked to input fields

2. **Screen Reader Support**
   - Error messages properly associated with inputs
   - Format selector with clear labels
   - Status updates for validation results

3. **Visual Accessibility**
   - Sufficient color contrast for error and warning states
   - Format lock indicator visible on hover
   - Clear visual distinction between errors and warnings

## Edge Cases and Solutions

### Input Edge Cases

1. **Multiple Separators**
   - Consecutive separators are normalized to a single separator
   - Mixed separators are normalized to the format's separator
   - Extra separators at the end are handled gracefully

2. **Incomplete Input**
   - Partial dates during typing are allowed
   - Incomplete dates on blur generate specific error
   - Clear guidance on expected format

3. **Year Ambiguity**
   - Two-digit years expanded based on sliding window
   - Year expansion consistent with modern date practices
   - Warnings for potentially ambiguous years

### Validation Edge Cases

1. **Leap Year Detection**
   - Proper algorithm for leap year calculation
   - Special handling for century years
   - Clear error messages for February 29th in non-leap years

2. **Month Length Awareness**
   - Month-specific validation for day values
   - Named months in error messages for clarity
   - Different validation for days 29-31 based on month

3. **Format Transitions**
   - Seamless conversion between date formats
   - Date value preservation during format changes
   - Graceful handling of incomplete dates during conversion

## Troubleshooting Guide

### Common Issues

1. **Format Not Changing**
   - Check if `hasExistingDates` is true
   - Verify hover message is displayed to explain lock
   - Ensure no dates exist in the dataset to allow format changes

2. **Two-Digit Year Issues**
   - Review `expandTwoDigitYear` function for current year logic
   - Check that blur handler is being called properly
   - Verify correct format is being used for expansion

3. **Validation Error Persistence**
   - Ensure error state is being cleared on input change
   - Check that form validation is using current input value
   - Verify error display logic in DateField component

### Debugging Strategies

1. **Input Value Tracing**
   - Log input values at each processing stage
   - Track separator detection and normalization
   - Monitor state updates during typing

2. **Format Detection**
   - Verify format string is being correctly parsed
   - Check separator extraction logic
   - Confirm format-specific handlers are being called

3. **Validation Logic**
   - Test each validation rule individually
   - Verify calendar calculations (days in month, leap years)
   - Test boundary conditions (month end days, year transitions)

## Future Enhancements

Potential improvements for the date entry system:

1. **Enhanced Format Support**
   - Additional international formats
   - Localized month names
   - Format auto-detection from input

2. **UI Enhancements**
   - Calendar picker integration
   - Relative date input (today, yesterday, etc.)
   - Smart defaults based on context

3. **Advanced Validation**
   - Business day validation
   - Holiday awareness
   - Date range restrictions

4. **Performance Optimizations**
   - Cached validation results
   - More aggressive memoization
   - Reduced re-renders during typing
