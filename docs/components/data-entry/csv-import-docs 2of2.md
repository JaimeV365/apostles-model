# CSV Import Utilities Documentation (Continued)

## Date Processing Utilities (continued)

**File Location:** `/src/components/data-entry/forms/CSVImport/utils/dateProcessing.ts`

### Usage Example (continued)
```typescript
// Parse a date string
const result = parseDateString('31/12/2023', 'dd/mm/yyyy');
if (result.isValid) {
  // Use the parsed date
  const formattedDate = formatDate(result.day!, result.month!, result.year!, 'yyyy-mm-dd');
  console.log(formattedDate); // Outputs: 2023-12-31
}
```

### Error Handling
- Returns validation status with error codes
- Detailed error messages for user feedback
- Categorizes issues as errors vs. warnings
- Future date detection as warning
- Invalid format as error

---

## Header Processing Utilities

**File Location:** `/src/components/data-entry/forms/CSVImport/utils/headerProcessing.ts`

### Purpose
Manages CSV header detection, normalization, and mapping to data scales.

### Key Functions
```typescript
// Detect scales from headers
export const detectScalesFromHeaders = (
  headers: string[],
  satisfactionScale: string,
  loyaltyScale: string
): HeaderScales

// Normalize headers for consistent processing
export const normalizeHeaders = (headers: string[]): string[]

// Map headers to internal field names
export const mapHeadersToFields = (headers: string[]): Record<string, string>

// Validate required headers
export const validateRequiredHeaders = (headers: string[]): ValidationResult

// Get scale from header name
export const getScaleFromHeader = (header: string): string | null
```

### Header Normalization
- Trims whitespace
- Converts to lowercase for comparison
- Removes special characters
- Standardizes naming conventions

### Scale Detection
- NPS (Net Promoter Score) detection
- CSAT (Customer Satisfaction) detection
- Custom scale support
- Multi-scale handling

### Required Headers
- Configurable required fields
- Missing field detection
- Alternative field name support

### Usage Example
```typescript
const headers = ['ID', 'First Name', 'Last Name', 'NPS Score', 'Survey Date'];
const normalized = normalizeHeaders(headers);

const scales = detectScalesFromHeaders(normalized, 'satisfaction', 'nps');
// Returns: { satisfactionHeader: null, loyaltyHeader: 'NPS Score' }

const validation = validateRequiredHeaders(normalized);
if (validation.isValid) {
  const fieldMap = mapHeadersToFields(normalized);
  // Process with field mapping
}
```

---

## Duplicate Detection Utilities

**File Location:** `/src/components/data-entry/forms/CSVImport/utils/duplicateDetection.ts`

### Purpose
Identifies and reports duplicate entries in CSV data based on configurable unique identifiers.

### Key Functions
```typescript
// Check for duplicates within the imported data
export const checkInternalDuplicates = (
  data: any[],
  idField: string = 'id'
): DuplicateReport

// Check for duplicates against existing data
export const checkExternalDuplicates = (
  importData: any[],
  existingIds: string[],
  idField: string = 'id'
): DuplicateReport

// Generate detailed duplicate report
export const generateDuplicateReport = (
  duplicates: Record<string, number[]>,
  data: any[]
): DuplicateDetail[]
```

### Duplicate Detection Features
- Internal duplicate detection (within imported file)
- External duplicate detection (against existing data)
- Configurable unique identifier fields
- Case-insensitive comparison option
- Row position tracking
- Detailed reporting

### Report Structure
```typescript
interface DuplicateReport {
  hasDuplicates: boolean;
  duplicateCount: number;
  details: DuplicateDetail[];
}

interface DuplicateDetail {
  id: string;
  rows: number[];
  rowData: any[];
}
```

### Usage Example
```typescript
const csvData = [
  { id: '1001', name: 'John Smith' },
  { id: '1002', name: 'Jane Doe' },
  { id: '1001', name: 'John S.' }, // Duplicate ID
];

const existingIds = ['1002', '1003'];

// Check for internal duplicates
const internalReport = checkInternalDuplicates(csvData);
if (internalReport.hasDuplicates) {
  console.log(`Found ${internalReport.duplicateCount} internal duplicates`);
  // Handle internal duplicates
}

// Check against existing data
const externalReport = checkExternalDuplicates(csvData, existingIds);
if (externalReport.hasDuplicates) {
  console.log(`Found ${externalReport.duplicateCount} conflicts with existing data`);
  // Handle external duplicates
}
```

---

## Data Transformation Utilities

**File Location:** `/src/components/data-entry/forms/CSVImport/utils/dataTransformation.ts`

### Purpose
Transforms and normalizes CSV data for system compatibility, handling type conversion and data cleaning.

### Key Functions
```typescript
// Transform raw CSV data to application format
export const transformCSVData = (
  data: any[],
  headerMapping: Record<string, string>,
  dateFormat: string
): any[]

// Clean and normalize text fields
export const cleanTextData = (text: string): string

// Convert score values to numbers
export const normalizeScoreValue = (
  value: string | number,
  scale: string
): number | null

// Process and validate date fields
export const processDateFields = (
  data: any[],
  dateFields: string[],
  format: string
): { processed: any[], issues: DateIssueReport }
```

### Transformation Features
- Field mapping based on headers
- Data type conversion
- Text data cleaning and normalization
- Score value normalization
- Date field processing
- Empty field handling
- Data validation during transformation

### Score Normalization
- Scale-specific normalization
- String to number conversion
- Valid range checking
- Scale mapping (e.g., 1-5 to 0-100)

### Usage Example
```typescript
const rawCSVData = [
  { 'Customer ID': '1001', 'First Name': 'John', 'NPS Score': '8', 'Survey Date': '15/10/2023' },
  { 'Customer ID': '1002', 'First Name': 'Jane', 'NPS Score': '9', 'Survey Date': '16/10/2023' }
];

const headerMapping = {
  'Customer ID': 'id',
  'First Name': 'firstName',
  'NPS Score': 'loyaltyScore',
  'Survey Date': 'surveyDate'
};

const transformedData = transformCSVData(rawCSVData, headerMapping, 'dd/mm/yyyy');
// Result: [
//   { id: '1001', firstName: 'John', loyaltyScore: 8, surveyDate: '2023-10-15' },
//   { id: '1002', firstName: 'Jane', loyaltyScore: 9, surveyDate: '2023-10-16' }
// ]
```

---

## Performance Optimization Utilities

**File Location:** `/src/components/data-entry/forms/CSVImport/utils/performanceOptimization.ts`

### Purpose
Provides utilities for optimizing performance during CSV processing, especially for large files.

### Key Functions
```typescript
// Process data in chunks for better UI responsiveness
export const processInChunks = <T, R>(
  items: T[],
  processFunction: (item: T) => R,
  chunkSize: number = 100,
  onProgress?: (processed: number, total: number) => void
): Promise<R[]>

// Debounce UI updates during processing
export const debounceProgressUpdate = (
  updateFunction: (progress: number) => void,
  delay: number = 100
): (progress: number) => void

// Optimize memory usage during processing
export const optimizeMemoryUsage = <T>(
  data: T[],
  processFunction: (chunk: T[]) => void
): void
```

### Optimization Features
- Chunk-based processing
- Progress tracking and reporting
- UI update throttling
- Memory usage optimization
- Background processing
- RequestAnimationFrame integration

### Usage Example
```typescript
const largeDataset = [...]; // 10,000+ rows

// Process in chunks with progress updates
const results = await processInChunks(
  largeDataset,
  transformRow,
  200,
  (processed, total) => {
    setProgress(Math.round((processed / total) * 100));
  }
);

// Or optimize memory
optimizeMemoryUsage(largeDataset, (chunk) => {
  // Process chunk
  processChunk(chunk);
});
```

---

## Error Handling Utilities

**File Location:** `/src/components/data-entry/forms/CSVImport/utils/errorHandling.ts`

### Purpose
Provides standardized error handling, reporting, and user feedback for CSV import operations.

### Key Functions
```typescript
// Create standardized error objects
export const createValidationError = (
  code: ErrorCode,
  message: string,
  details?: any
): ValidationErrorData

// Parse Papa Parse errors to standard format
export const handlePapaParseError = (
  error: PapaParseError
): ValidationErrorData

// Create a user-friendly error message
export const generateUserErrorMessage = (
  error: ValidationErrorData
): string

// Log and track errors for analytics
export const logImportError = (
  error: ValidationErrorData,
  context: any
): void
```

### Error Codes
- `INVALID_FILE_TYPE`: Unsupported file type
- `EMPTY_FILE`: File contains no data
- `MISSING_HEADERS`: Required headers not found
- `INVALID_DATA`: Data validation failures
- `DUPLICATE_DATA`: Duplicate entries found
- `SCALE_MISMATCH`: Incompatible scales
- `PARSE_ERROR`: CSV parsing errors
- `UNKNOWN_ERROR`: Uncategorized errors

### Error Structure
```typescript
interface ValidationErrorData {
  code: ErrorCode;
  title: string;
  message: string;
  details?: any;
  rows?: number[];
}
```

### Usage Example
```typescript
try {
  // Import logic
} catch (err) {
  let error;
  if (err instanceof PapaParseError) {
    error = handlePapaParseError(err);
  } else {
    error = createValidationError(
      'UNKNOWN_ERROR',
      'An unexpected error occurred during import',
      err
    );
  }
  
  setError(error);
  logImportError(error, { fileName, fileSize });
  
  const userMessage = generateUserErrorMessage(error);
  displayToast(userMessage, 'error');
}
```

---

## Configuration and Defaults

**File Location:** `/src/components/data-entry/forms/CSVImport/config/defaults.ts`

### Purpose
Centralizes configuration values and defaults for the CSV import system.

### Key Configurations
```typescript
// Supported file types
export const SUPPORTED_FILE_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/csv'
];

// Maximum file size (in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Default Papa Parse options
export const DEFAULT_PAPA_PARSE_CONFIG = {
  header: true,
  skipEmptyLines: 'greedy',
  dynamicTyping: false, // We handle type conversion manually
  transform: (value: string) => value.trim()
};

// Required headers for valid import
export const REQUIRED_HEADERS = [
  'id', 
  'firstName', 
  'lastName'
];

// Alternative header mappings
export const HEADER_ALTERNATIVES = {
  'id': ['customerid', 'customer id', 'userid', 'user id', 'respondentid'],
  'firstName': ['first name', 'firstname', 'first', 'given name'],
  'lastName': ['last name', 'lastname', 'last', 'surname', 'family name']
};

// Default date format
export const DEFAULT_DATE_FORMAT = 'dd/mm/yyyy';

// Supported date formats
export const SUPPORTED_DATE_FORMATS = [
  'dd/mm/yyyy',
  'mm/dd/yyyy',
  'yyyy-mm-dd'
];

// Chunk size for processing
export const DEFAULT_CHUNK_SIZE = 200;

// Scale mappings
export const SCALE_IDENTIFIERS = {
  'nps': ['nps', 'net promoter score', 'promoter score', 'recommendation'],
  'csat': ['csat', 'satisfaction', 'customer satisfaction', 'sat score'],
  'ces': ['ces', 'effort', 'customer effort', 'effort score']
};
```

### Usage
These defaults are imported and used throughout the CSV import system to ensure consistency and configurability.

Example:
```typescript
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from '../config/defaults';

const validateFile = (file: File): ValidationResult => {
  if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: createValidationError('INVALID_FILE_TYPE', 'Unsupported file type')
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: createValidationError('FILE_TOO_LARGE', 'File exceeds maximum size')
    };
  }
  
  return { isValid: true };
};
```

## Integration Guidelines

### Best Practices for Import Integration

1. **Import Flow**
   - Use the hooks in this order: `useCSVValidation` → `useCSVParser`
   - Handle all error states explicitly
   - Provide clear user feedback at each step

2. **Error Handling**
   - Display appropriate error messages
   - Offer clear resolution steps
   - Log errors for troubleshooting

3. **Performance**
   - Use chunk processing for large files
   - Implement cancelable import operations
   - Show progress indicators

4. **User Experience**
   - Provide sample templates
   - Display clear validation feedback
   - Allow correction of validation issues

5. **Data Security**
   - Validate all data thoroughly
   - Sanitize inputs before database operations
   - Implement proper error boundaries

### Component Integration Example

```tsx
import { useCSVValidation, useCSVParser } from './hooks';
import { CSVDropzone, ValidationErrors, ProgressIndicator } from './components';

const CSVImportForm = () => {
  // Set up validation state
  const {
    error,
    setError,
    duplicateReport,
    setDuplicateReport,
    dateIssuesReport,
    clearValidationState
  } = useCSVValidation();

  // Configure parser
  const {
    progress,
    parseFile,
    finalizeImport,
    dateIssuesReport: parserDateIssues
  } = useCSVParser({
    onComplete: handleCompleteImport,
    onDuplicatesFound: setDuplicateReport,
    onError: setError,
    satisfactionScale: 'csat',
    loyaltyScale: 'nps',
    scalesLocked: true,
    existingIds: existingCustomerIds,
    setPendingFileData,
    showImportModeDialog
  });

  // Handle file selection
  const handleFileSelect = (file: File) => {
    clearValidationState();
    parseFile(file);
  };

  // Handle import completion
  const handleCompleteImport = (data, headerScales, fileName) => {
    // Process final data
    saveImportedData(data);
    // Update UI
    setImportComplete(true);
  };

  return (
    <div>
      <CSVDropzone onFileSelect={handleFileSelect} />
      
      {error && <ValidationErrors error={error} />}
      
      {progress && <ProgressIndicator progress={progress} />}
      
      {duplicateReport && (
        <DuplicateReporter
          report={duplicateReport}
          onResolve={handleResolveDuplicates}
        />
      )}
      
      {dateIssuesReport && (
        <DateIssuesReporter
          report={dateIssuesReport}
          onResolve={handleResolveDateIssues}
        />
      )}
    </div>
  );
};
```
