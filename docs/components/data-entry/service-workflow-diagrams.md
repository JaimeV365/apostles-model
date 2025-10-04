# Data Entry Service Workflows and Diagrams

## Service Interaction Diagrams

### Manual Data Entry Workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  DataInput Form │────▶│  useDataInput   │────▶│ ValidationService│
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                        ▲
         │                      │                        │
         │                      │                        │
         ▼                      ▼                        │
┌─────────────────┐     ┌─────────────────┐             │
│  Field Components│     │StateManagement  │─────────────┘
└─────────────────┘     │    Service      │
         │              └─────────────────┘
         │                      ▲
         ▼                      │
┌─────────────────┐             │
│  FormatService  │─────────────┘
└─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│DuplicateCheck   │
│    Service      │
└─────────────────┘
```

### CSV Import Workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   FileUploader  │────▶│   useCSVParser  │────▶│ HeaderProcessing │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │                        │
                                │                        │
                                ▼                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │ValidationService │◀────│  FormatService  │
                        └─────────────────┘     └─────────────────┘
                                │                        ▲
                                │                        │
                                ▼                        │
                        ┌─────────────────┐             │
                        │DuplicateCheck   │─────────────┘
                        │    Service      │
                        └─────────────────┘
```

## Data Flow Through Services

### Form Input Data Flow

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│  Raw Input │────▶│  Format    │────▶│  Validate  │────▶│  Check for │
│   Values   │     │  Service   │     │  Service   │     │ Duplicates │
└────────────┘     └────────────┘     └────────────┘     └────────────┘
                                                                │
                                                                │
                                                                ▼
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│  Data      │◀────│   State    │◀────│  Resolve   │◀────│ Duplicate  │
│  Store     │     │ Management │     │ Duplicates │     │  Handler   │
└────────────┘     └────────────┘     └────────────┘     └────────────┘
```

### CSV Data Flow

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│  CSV File  │────▶│  Parse CSV │────▶│  Process   │────▶│  Validate  │
│            │     │            │     │  Headers   │     │   Rows     │
└────────────┘     └────────────┘     └────────────┘     └────────────┘
                                                                │
                                                                │
                                                                ▼
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│  Format    │◀────│  Transform │◀────│  Check for │◀────│   Error    │
│  Service   │     │   Dates    │     │ Duplicates │     │  Handling  │
└────────────┘     └────────────┘     └────────────┘     └────────────┘
        │                                    │
        │                                    │
        ▼                                    ▼
┌────────────┐                       ┌────────────┐
│Processed   │                       │  Import    │
│Data Array  │◀──────────────────────│  Mode      │
└────────────┘                       │ Selection  │
        │                            └────────────┘
        │
        ▼
┌────────────┐
│  Data      │
│  Store     │
└────────────┘
```

## Service Responsibilities

### ValidationService

**Primary Responsibility**: Ensure data integrity through validation rules

**Input Types**:
- Individual field values + context
- Complete form state
- Row data from CSV imports

**Output Types**:
- Validation results with error messages
- Processed data that meets validation criteria

### FormatService

**Primary Responsibility**: Format standardization and conversion

**Input Types**:
- Raw date strings + format specifications
- Scale formats that need normalization
- Text data requiring formatting

**Output Types**:
- Formatted values ready for display or storage
- Normalized scale formats
- Conversion results with validation information

### DuplicateCheckService

**Primary Responsibility**: Prevent duplicate data entries

**Input Types**:
- New data points
- Existing dataset
- Comparison configuration

**Output Types**:
- Duplicate detection results
- Detailed information about detected duplicates
- Suggested actions for resolution

### StateManagementService

**Primary Responsibility**: Manage application state and transitions

**Input Types**:
- Application context (create/edit/import)
- Data points and form states
- UI state requirements

**Output Types**:
- Initial state configurations
- State transition logic
- Data transformations

## Service Implementation Details

### ValidationService Implementation

```typescript
export const ValidationService = {
  // Field validations
  validateId(id: string, options: ValidationOptions): ValidationResult {
    // Check if ID is unique in given context
    // Return validation result
  },
  
  validateEmail(email: string): ValidationResult {
    // Check email format using regex
    // Return validation result
  },
  
  validateSatisfaction(value: string, scale: ScaleFormat): ValidationResult {
    // Validate against scale constraints
    // Return validation result
  },
  
  // Form validation
  validateForm(
    formState: FormState,
    options: ValidationOptions
  ): { isValid: boolean; errors: Record<string, string> } {
    // Validate all fields with context awareness
    // Return complete validation result
  }
};
```

### DuplicateCheckService Implementation

```typescript
export const DuplicateCheckService = {
  checkForDuplicates(
    newDataPoint: DataPoint,
    options: DuplicateCheckOptions
  ): DuplicateCheckResult {
    // Check for duplicates with context-awareness
    // Identify matching criteria
    // Return detailed result
  }
};
```

### FormatService Implementation

```typescript
export const FormatService = {
  convertDateFormat(
    dateStr: string, 
    fromFormat: string, 
    toFormat: string
  ): DateConversionResult {
    // Convert date between formats
    // Validate result
    // Return formatted date
  },
  
  getSupportedDateFormats(): Array<{value: string, label: string}> {
    // Return available date formats
  },
  
  formatName(name: string): string {
    // Apply standardized formatting to names
    // Return formatted name
  }
};
```

### StateManagementService Implementation

```typescript
export const StateManagementService = {
  // State initialization
  createInitialFormState(context: Partial<StateContext>): FormState {
    // Create appropriate initial state based on context
    // Return form state
  },
  
  // State locking logic
  shouldLockScales(data: DataPoint[], isEditing: boolean, editingId?: string): boolean {
    // Determine if scales should be locked
    // Return lock status
  },
  
  // Data transformations
  dataPointToFormState(dataPoint: DataPoint): FormState {
    // Convert data point to form state
    // Return form state
  },
  
  formStateToDataPoint(formState: FormState): DataPoint {
    // Convert form state to data point
    // Return data point
  }
};
```

## UI Component Integration

### Form Components

Each form field component connects to services through custom hooks:

```typescript
// In a form field component
const { validateField } = useValidation();

const handleChange = (value: string) => {
  // Format the value if needed
  const formattedValue = FormatService.formatValue(value);
  
  // Validate the value
  const validationResult = validateField(field, formattedValue);
  
  // Update state with value and validation result
  updateField(field, formattedValue, validationResult);
};
```

### Hooks Integration

Custom hooks act as intermediaries between UI components and services:

```typescript
// useDataInput hook
export const useDataInput = (props: DataInputProps) => {
  // Use StateManagementService to initialize form
  const initialState = StateManagementService.createInitialFormState({
    mode: props.editingData ? 'edit' : 'create',
    editingData: props.editingData
  });
  
  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    // Validate form using ValidationService
    const validationResult = ValidationService.validateForm(formState, {
      context: props.editingData ? 'edit' : 'create',
      originalId: props.editingData?.id,
      existingIds: props.existingIds,
      satisfactionScale: props.satisfactionScale,
      loyaltyScale: props.loyaltyScale
    });
    
    // Process form submission if valid
    // ...
  };
  
  // Return state and handlers
  return {
    formState,
    errors,
    handleInputChange,
    handleSubmit,
    resetForm
  };
};
```

## Configuration and Extension

### 1. Adding New Validation Rules

To add a new validation rule, extend the ValidationService:

```typescript
// Add method to ValidationService
validateCustomField(value: string, options: CustomOptions): ValidationResult {
  // Implement validation logic
  return { isValid: true/false, message: 'Error message if invalid' };
}

// Update validateForm to use new validation
validateForm(...) {
  // Existing validations
  
  // Add new validation
  if (needsCustomValidation) {
    const customResult = this.validateCustomField(formState.customField, options);
    if (!customResult.isValid) {
      errors.customField = customResult.message;
      isValid = false;
    }
  }
  
  return { isValid, errors };
}
```

### 2. Supporting New Data Formats

To add a new date format:

```typescript
// Add to FormatService
const SUPPORTED_FORMATS = [
  { value: 'dd/MM/yyyy', label: 'dd/mm/yyyy' },
  { value: 'MM/dd/yyyy', label: 'mm/dd/yyyy' },
  { value: 'yyyy-MM-dd', label: 'yyyy-mm-dd' },
  { value: 'new-format', label: 'New Format Display' } // Add new format
];

// Update conversion logic
convertDateFormat(dateStr, fromFormat, toFormat) {
  // Existing format conversions
  
  // Add new format handling
  if (fromFormat === 'new-format' || toFormat === 'new-format') {
    // Implement conversion logic
  }
  
  // Return result
}
```

## Conclusion

This service architecture provides a clean separation of concerns between business logic (services) and presentation (components). Each service has a specific responsibility area with well-defined interfaces, making the system maintainable, extensible, and scalable.

The design handles complex operations like data validation, format conversion, and duplicate checking in a modular way, allowing the system to evolve without major refactoring.
