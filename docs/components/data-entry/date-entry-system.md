# Date Entry System Documentation

## Overview
The date entry system provides a flexible, user-friendly interface for entering and validating dates in multiple formats with robust error handling, validation, and formatting capabilities.

## Component Architecture

### Key Files
```
src/components/data-entry/
├── forms/
│   ├── DataInput/
│   │   ├── components/
│   │   │   └── DateField.tsx      # Date field component
│   └── InputField.tsx             # Base input component
└── utils/
    └── date/
        ├── index.ts               # Main exports
        ├── dateInputHandler.ts    # Core date handling logic
        ├── blurHandler.ts         # Blur event handling
        ├── helpers.ts             # Helper functions
        ├── types.ts               # Type definitions
        └── formatHandlers/        # Format-specific handlers
            ├── ddmmyyyy.ts        # DD/MM/YYYY format
            ├── mmddyyyy.ts        # MM/DD/YYYY format
            └── yyyymmdd.ts        # YYYY-MM-DD format
```

### Component Hierarchy
```
DataInput
└── DateField
    └── InputField
```

## Core Functionality

### Date Formats Supported
- `DD/MM/YYYY` - Day/Month/Year with `/` separator (default)
- `MM/DD/YYYY` - Month/Day/Year with `/` separator
- `YYYY-MM-DD` - Year-Month-Day with `-` separator

### Separator Flexibility
The system supports multiple separators in each format:
- Forward slash: `/`
- Hyphen: `-`
- Period: `.`

## Implementation Details

### DateField Component
The `DateField` component (`DateField.tsx`) serves as the main entry point for date input with the following features:

1. **Format Selection Dropdown**
   - Users can select between DD/MM/YYYY, MM/DD/YYYY, and YYYY-MM-DD formats
   - Format selection is locked when dates already exist in the dataset

2. **Date Input Field**
   - Uses the base `InputField` component
   - Implements specialized date handling logic
   - Shows validation errors and warnings

### Date Handling Logic

#### Input Handling Flow
1. User types into the date field
2. `handleDateChange` captures input and calls `handleDateInput`
3. Input is formatted according to the selected format
4. Real-time validation occurs as the user types
5. Errors are displayed immediately for quick feedback

#### Blur Handling Flow
1. User tabs or clicks away from field
2. `handleDateBlur` is triggered
3. Complete date validation occurs
4. Two-digit years are expanded to four digits
5. Date parts are padded with zeros as needed
6. Comprehensive validation checks are performed

### Date Validation

#### Basic Validation
- Day values must be between 1-31
- Month values must be between 1-12
- Year values must be 2 or 4 digits

#### Advanced Validation
- Days validated against month length (e.g., April has 30 days)
- February validated for 28/29 days based on leap years
- Future dates generate warnings
- Years before 1900 or far in the future generate warnings

### Error Handling

#### Error Types
1. **Format Errors**
   - "Day must be greater than 0"
   - "Day cannot be greater than 31"
   - "Month must be greater than 0"
   - "Month cannot be greater than 12"
   - "Year must be 2 or 4 digits"

2. **Logical Errors**
   - "February cannot have more than 29 days"
   - "February 2023 is not a leap year and has 28 days"
   - "April has only 30 days"

3. **Completeness Errors**
   - "Please enter a complete date"

#### Warning Types
- "Date is in the future"
- "Date is very far in the past"
- "Date is very far in the future"

### Two-Digit Year Handling
- Years 00-20 are interpreted as 2000-2020
- Years 21-99 are interpreted as 1921-1999
- This logic adapts based on the current year

### Formatter Implementation

#### Common Formatting Operations
1. **Separator Normalization**
   - Any separator (/, -, .) is normalized to the format's standard separator
   - Multiple consecutive separators are reduced to a single separator

2. **Auto-Padding**
   - Single-digit day/month values are padded with a leading zero
   - Two-digit years are expanded to four digits on blur

3. **Auto-Separator Insertion**
   - Separators are automatically inserted after day/month or year/month
   - This occurs after the user types two digits or when they type a separator

#### Format-Specific Logic
Each format has specialized handling in dedicated files:

1. **ddmmyyyy.ts**
   - Handles day input first, then month, then year
   - Validates days against months early in the input process

2. **mmddyyyy.ts**
   - Handles month input first, then day, then year
   - Specific validation for month range before day validation

3. **yyyymmdd.ts**
   - Handles year input first, then month, then day
   - Special handling for 4-digit year input before adding separators

## Example Data Flow

### For DD/MM/YYYY Format:
1. User types "1"
   - Display: "1"
2. User types "6"
   - Display: "16/"
   - System automatically adds separator
3. User types "0"
   - Display: "16/0"
4. User types "8"
   - Display: "16/08/"
   - System automatically adds second separator
5. User types "23"
   - Display: "16/08/23"
6. User tabs out (blur event)
   - Display: "16/08/2023"
   - System expands two-digit year to four digits

### For YYYY-MM-DD Format:
1. User types "2"
   - Display: "2"
2. User types "023"
   - Display: "2023-"
   - System automatically adds separator after 4 digits
3. User types "1"
   - Display: "2023-1"
4. User types "2"
   - Display: "2023-12-"
   - System automatically adds second separator
5. User types "25"
   - Display: "2023-12-25"

## Error Handling Examples

### Example 1: Invalid Day for Month
1. User enters "31/04/2023"
2. System validates that April has only 30 days
3. Error displayed: "April has only 30 days"

### Example 2: February in Non-Leap Year
1. User enters "29/02/2023"
2. System validates that 2023 is not a leap year
3. Error displayed: "February 2023 is not a leap year and has 28 days"

### Example 3: Incomplete Date
1. User enters "15/06"
2. User tabs out
3. Error displayed: "Please enter a complete date"

## Integration with Form Validation

### Form Submission Validation
1. Date validation is included in the form's overall validation
2. Date errors prevent form submission
3. Validation includes checking date format and logical constraints

### Data Persistence
1. Valid dates are stored in the format selected by the user
2. When data with dates exists, date format is locked to maintain consistency

## Implementation Notes

### Helper Functions
- `isLeapYear`: Determines if a given year is a leap year
- `getDaysInMonth`: Returns the number of days in a month, considering leap years
- `getFormatSeparator`: Extracts the separator character from a date format string
- `expandTwoDigitYear`: Converts a two-digit year to a four-digit year

### Performance Considerations
- Input handling is optimized to reduce unnecessary re-renders
- Format-specific handlers are used to improve code organization
- Error states are managed locally when possible

## Planned Enhancements
- Additional international date formats
- Enhanced accessibility features
- Date picker integration option
- Relative date support ("today", "yesterday", etc.)

## For Maintenance

### Key Areas to Review When Modifying
1. Check both `handleDateInput` and `handleDateBlur` functions
2. Review the format-specific handlers in the formatHandlers directory
3. Test all error and warning conditions after changes
4. Verify behavior with different separators
5. Ensure date format lock behavior works correctly

### Common Issues
1. Separator inconsistency between input and format
2. Two-digit year expansion logic needs updating over time
3. Format-specific edge cases in validation
4. Interaction between input and blur handlers
