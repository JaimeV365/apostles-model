# CSV Import Hooks and Utilities Documentation

## Custom Hooks

### useCSVParser

**File Location:** `/src/components/data-entry/forms/CSVImport/hooks/useCSVParser.ts`

### Purpose
Manages the complex workflow of parsing, validating, and processing CSV files, providing state management and error handling.

### Interface
```typescript
interface UseCSVParserProps {
  onComplete: (data: any[], headerScales: HeaderScales, fileName: string) => void;
  onDuplicatesFound: (duplicates: DuplicateReport) => void;
  onError: (error: ValidationErrorData) => void;
  satisfactionScale: string;
  loyaltyScale: string;
  scalesLocked: boolean;
  existingIds: string[];
  setPendingFileData: (data: {file: File, headerScales: HeaderScales} | null) => void;
  showImportModeDialog: () => void;
}

// Return value
interface UseCSVParserReturn {
  progress: ProgressState | null;
  currentFileName: string;
  parseFile: (file: File) => void;
  finalizeImport: (data: any[], headerScales: HeaderScales, fileName: string) => void;
  dateIssuesReport: DateIssueReport | null;
  dateWarningsReport: DateIssueReport | null;
}
```

### State Management
```typescript
const [progress, setProgress] = useState<ProgressState | null>(null);
const [currentFileName, setCurrentFileName] = useState<string>('');
const [dateIssuesReport, setDateIssuesReport] = useState<DateIssueReport | null>(null);
const [dateWarningsReport, setDateWarningsReport] = useState<DateIssueReport | null>(null);
```

### Key Methods
- `parseFile`: Primary method for handling file parsing
- `finalizeImport`: Completes the import process after validation

### Workflow
1. File validation
2. CSV parsing with PapaParse
3. Header detection and scale detection
4. Data row validation
5. Date format detection and validation
6. Duplicate checking
7. Scale compatibility verification
8. Import mode selection for existing data
9. Final data processing and callback

### Usage Example
```typescript
const {
  progress,
  parseFile,
  finalizeImport,
  dateIssuesReport,
  dateWarningsReport
} = useCSVParser({
  onComplete: handleCompleteImport,
  onDuplicatesFound: handleDuplicatesFound,
  onError: handleError,
  satisfactionScale,
  loyaltyScale,
  scalesLocked,
  existingIds,
  setPendingFileData,
  showImportModeDialog
});

// Then use in component
const handleFileSelect = (file: File) => {
  clearValidationState();
  parseFile(file);
};
```

### Key Dependencies
- PapaParse library for CSV processing
- Validation utility functions
- Date processing utilities
- Duplicate detection utilities

### Error Handling
- File validation errors
- CSV parsing errors
- Data validation errors
- Scale mismatch errors

### Performance Considerations
- Streaming parser for large files
- Progressive feedback during processing
- Asynchronous validation
- Browser memory management

---

### useCSVValidation

**File Location:** `/src/components/data-entry/forms/CSVImport/hooks/useCSVValidation.ts`

### Purpose
Manages the validation state of the CSV import process, including errors, warnings, and reports.

### Interface
```typescript
// Return value
interface UseCSVValidationReturn {
  error: ValidationErrorData | null;
  setError: (error: ValidationErrorData) => void;
  duplicateReport: DuplicateReport | null;
  setDuplicateReport: (report: DuplicateReport) => void;
  dateIssuesReport: DateIssueReport | null;
  setDateIssuesReport: (report: DateIssueReport) => void;
  dateWarningsReport: DateIssueReport | null;
  setDateWarningsReport: (report: DateIssueReport) => void;
  clearValidationState: () => void;
}
```

### State Management
```typescript
const [error, setError] = useState<ValidationErrorData | null>(null);
const [duplicateReport, setDuplicateReport] = useState<DuplicateReport | null>(null);
const [dateIssuesReport, setDateIssuesReport] = useState<DateIssueReport | null>(null);
const [dateWarningsReport, setDateWarningsReport] = useState<DateIssueReport | null>(null);
```

### Key Methods
- `clearValidationState`: Resets all validation state
- State setters for each validation type

### Usage Example
```typescript
const {
  error,
  setError,
  duplicateReport,
  setDuplicateReport,
  dateIssuesReport,
  setDateIssuesReport,
  dateWarningsReport,
  setDateWarningsReport,
  clearValidationState
} = useCSVValidation();

// Use in component
clearValidationState(); // Before starting new import
setError({ title: 'Error', message: 'Invalid format' }); // When error occurs
```

### Purpose
Centralizes validation state management for clean component code.

---

## Utility Modules

### Date Processing Utilities

**File Location:** `/src/components/data-entry/forms/CSVImport/utils/dateProcessing.ts`

### Purpose
Provides specialized functions for date parsing, validation, and formatting with support for multiple formats.

### Key Functions
```typescript
// Check if a year is a leap year
export const isLeapYear = (year: number): boolean

// Get the number of days in a month
export const getDaysInMonth = (month: number, year?: number): number

// Get the separator from a date format
export const getFormatSeparator = (dateFormat: string): string

// Convert two-digit years to four digits
export const expandTwoDigitYear = (yearStr: string): string

// Extract the proper date format from the header name
export const getDateFormatFromHeader = (header: string): string

// Parse and validate a date string
export const parseDateString = (dateStr: string, format: string): ParsedDateResult

// Format date based on format
export const formatDate = (day: number, month: number, year: number, format: string): string
```

### Date Format Support
- `dd/mm/yyyy`: Day first (European)
- `mm/dd/yyyy`: Month first (US)
- `yyyy-mm-dd`: Year first (ISO)

### DateFormatting Features
- Format auto-detection from headers
- Header to format mapping
- Two-digit year expansion
- Format-specific validation
- Separator normalization
- Leap year handling
- Future date detection
- Valid date range checking

### Usage Example
```typescript
// Parse a date string
const result = parseDateString('31/12/2023', 'dd/mm/yyyy');
if (result.isValid) {
  // Use the parsed date
  const formattedDate = formatDate(result.day!, result.month