# Data Entry System: Service-Oriented Architecture Documentation

## Overview

The Data Entry module implements a robust service-oriented architecture that separates concerns, improves maintainability, and enables scalability. This documentation explains the core services, their interactions, and the overall workflow of the system.

## Core Services Architecture

### 1. ValidationService

**Purpose**: Centralizes all validation logic for form inputs.

**Location**: `/src/components/data-entry/services/ValidationService.ts`

**Key Features**:
- Context-aware validation (create/edit/import)
- Field-specific and form-level validation
- Standardized error message format
- Extensible validation rules

**Primary Methods**:
- `validateId(id, options)`: Validates ID uniqueness based on context
- `validateEmail(email)`: Validates email format
- `validateSatisfaction(value, scale)`: Validates against scale constraints
- `validateLoyalty(value, scale)`: Validates against scale constraints
- `validateDate(date, format)`: Validates date format and logical constraints
- `validateForm(formState, options)`: Complete form validation with context

**Input/Output Flow**:
- **Input**: Field value + validation context
- **Output**: `{isValid: boolean, message?: string}` structure

### 2. DuplicateCheckService

**Purpose**: Detects potentially duplicate data entries to prevent redundant records.

**Location**: `/src/components/data-entry/services/DuplicateCheckService.ts`

**Key Features**:
- Multi-criteria duplicate detection
- Context-aware exclusions (for editing existing records)
- Detailed reasoning for duplicate identification
- Configurable matching criteria

**Primary Methods**:
- `checkForDuplicates(newDataPoint, options)`: Main detection method

**Input/Output Flow**:
- **Input**: New data point + existing data + options
- **Output**: `{isDuplicate: boolean, duplicate?: DataPoint, reason?: string}`

### 3. FormatService

**Purpose**: Handles format conversions, standardization, and internationalization.

**Location**: `/src/components/data-entry/services/FormatService.ts`

**Key Features**:
- Date format conversion
- Scale format standardization
- Text formatting (name capitalization)
- Format detection for imports

**Primary Methods**:
- `convertDateFormat(dateStr, fromFormat, toFormat)`: Converts dates between formats
- `getSupportedDateFormats()`: Returns available date formats
- `formatName(name)`: Standardizes name formatting

**Input/Output Flow**:
- **Input**: Raw data + format specifications
- **Output**: Formatted data + validation info

### 4. StateManagementService

**Purpose**: Manages application state transitions and form state persistence.

**Location**: `/src/components/data-entry/services/StateManagementService.ts`

**Key Features**:
- Entry mode management (create/edit/import)
- Form state initialization
- Scale locking logic
- State transformation utilities

**Primary Methods**:
- `createInitialFormState(context)`: Builds initial form state based on context
- `shouldLockScales(data, isEditing, editingId)`: Determines if scales should be locked
- `shouldLockDateFormat(data, isEditing, editingId)`: Determines if date format should be locked
- `dataPointToFormState(dataPoint)`: Converts data point to form state
- `formStateToDataPoint(formState)`: Converts form state to data point

**Input/Output Flow**:
- **Input**: Application context and data
- **Output**: State configurations and transformations

## Service Dependencies and Interactions

### Service Dependencies

```
ValidationService
├── No external service dependencies
└── Uses internal utility functions

FormatService
├── ValidationService (for validation during format conversion)
└── Date processing utilities

DuplicateCheckService
└── No external service dependencies

StateManagementService
└── No external service dependencies
```

### Service Interactions Workflow

1. **Manual Data Entry Flow**:
   ```
   DataInput Component
   ├── useDataInput Hook
   │   ├── ValidationService.validateForm()
   │   └── StateManagementService.createInitialFormState()
   ├── DateField Component → FormatService.convertDateFormat()
   └── useDuplicateCheck Hook → DuplicateCheckService.checkForDuplicates()
   ```

2. **CSV Import Flow**:
   ```
   CSVImport Component
   ├── useCSVParser Hook
   │   ├── FormatService.getSupportedDateFormats()
   │   └── ValidationService.validateDataRows()
   ├── HeaderProcessing → FormatService.extractScaleFromHeader()
   └── DuplicateDetection → DuplicateCheckService.checkForDuplicates()
   ```

3. **Data Edit Flow**:
   ```
   DataEntryModule
   ├── startEditing() → StateManagementService.dataPointToFormState()
   ├── ValidationService.validateForm(context: 'edit')
   └── DuplicateCheckService.checkForDuplicates(excludedId: editingId)
   ```

## Data Flow Through the System

### 1. Input Data Phase

- **Manual Entry**: User input → Form state → Validation → Store
- **CSV Import**: File → Parse → Header detection → Row validation → Store
- **Edit**: Existing data → Form state → Edit → Validation → Update store

### 2. Data Transformation Phase

```
Raw Input → FormatService → Validated Data → DuplicateCheckService → Final Data
```

### 3. Output Phase

- Data stored in application state
- Data persisted to local storage
- Data displayed in data table

## Extension Points and Scalability

### Adding New Validation Rules

1. Extend the `ValidationService` with new methods
2. Update the `validateForm` method to incorporate new validations
3. Ensure form components use the new validation

### Supporting New Data Formats

1. Add format detection to `FormatService`
2. Implement format-specific conversion in appropriate utilities
3. Update UI components to display new format options

### Enhancing Duplicate Detection

1. Add new matching criteria to `DuplicateCheckService`
2. Update duplicate handling UI to display new criteria
3. Configure sensitivity of matching algorithm 

## Integration with UI Components

### Form Components

Each form field component connects to services through custom hooks:

- `useDataInput`: Connects to ValidationService and StateManagementService
- `useDuplicateCheck`: Connects to DuplicateCheckService
- Date components: Connect to FormatService

### Data Table Components

Data display components receive processed data after:
- Validation
- Formatting
- Duplicate checking

## Error Handling Strategy

1. **Field-Level Errors**: Managed by ValidationService, displayed inline
2. **Form-Level Errors**: Collected and displayed at submission
3. **Import Errors**: Categorized by type (validation/format/duplicate)
4. **System Errors**: Caught by global error boundaries

## Performance Considerations

1. **Validation**:
   - Fast validation for real-time feedback
   - Comprehensive validation on submit

2. **Format Conversion**:
   - Caching of commonly used formats
   - Intelligent handling of large datasets

3. **Duplicate Detection**:
   - Optimized for large datasets
   - Early termination when clear duplicates found

## Security Considerations

1. **Input Sanitization**:
   - Validation rules prevent XSS
   - Format standardization removes potential injections

2. **Data Integrity**:
   - Duplicate prevention ensures clean data
   - Format validation ensures valid data

## Conclusion

The service-oriented architecture of the Data Entry system provides clear separation of concerns, improved maintainability, and extensibility. By centralizing functionalities in discrete services, the system can adapt to new requirements with minimal changes to existing components.

Services act as the domain experts, while UI components focus on presentation and user interaction. This separation allows for easier testing, maintenance, and future enhancements.
