# Date Handling System Documentation

## Overview
The date handling system provides robust date input validation, formatting, and error handling with support for multiple date formats and intelligent year handling.

## Core Components

### dateInputHandler.ts
Primary handler for date input processing and validation.

#### Key Functions

1. `handleDateInput`
```typescript
interface DateHandlerResult {
  formattedValue: string;
  error: string;
}

handleDateInput(value: string, currentValue: string, dateFormat: string): DateHandlerResult
```

Features:
- Separator normalization (/, -, .)
- Auto-padding single digits
- Intelligent year handling
- Progressive validation
- Format preservation

2. `handleDateBlur`
Features:
- Two-digit year completion
- Complete date validation
- Format validation
- Error messaging

### Validation Rules

#### Day Validation
- Must be > 0
- Must be ≤ 31
- Must be valid for the selected month
- Special February handling

#### Month Validation
- Must be > 0
- Must be ≤ 12
- Days validated against month length

#### Year Validation
- Two-digit completion rules:
  - ≥ 21: Prefix with "19" (e.g., "25" → "1925")
  - < 21: Prefix with "20" (e.g., "19" → "2019")
- Must be between 1900-2100
- Leap year handling for February 29th

### Error Handling

#### Progressive Validation
```typescript
// Day errors
'Day must be greater than 0'
'Day cannot be greater than 31'

// Month errors
'Month must be greater than 0'
'Month cannot be greater than 12'

// Special month errors
'February can only have up to 29 days'
'This month can only have ${daysInMonth} days'

// Year errors
'Year must be 2 or 4 digits'
'Please enter a complete date'
```

### Format Support
- DD/MM/YYYY (default)
- MM/DD/YYYY
- YYYY-MM-DD

## Implementation Details

### Separator Handling
```typescript
// Accept any separator
const userTypedSeparator = /[/\-\.]/.test(value[value.length - 1]);

// Convert to format separator
const formatSeparator = dateFormat.includes('/') ? '/' : 
                       dateFormat.includes('-') ? '-' : '.';
```

### Auto-Completion Rules
```typescript
// Single digit padding
'1' → '01/'
'12/1' → '12/01/'

// Year completion on blur
'12/12/23' → '12/12/2023'
'12/12/35' → '12/12/1935'
```

### Leap Year Calculation
```typescript
const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
const maxDays = isLeapYear ? 29 : 28;
```

## Usage Example
```typescript
// In DataInput.tsx
const handleDateChange = (value: string) => {
  const result = handleDateInput(value, date, dateFormat);
  setDate(result.formattedValue);
  
  if (result.error) {
    setErrors(prev => ({ ...prev, date: result.error }));
  } else {
    setErrors(prev => {
      const { date, ...rest } = prev;
      return rest;
    });
  }
};
```

## Save this file to: `/docs/components/data-entry/date-handling.md`