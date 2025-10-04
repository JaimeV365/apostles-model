# CSV Import Hooks Documentation

## Hook: useCSVParser

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
  validateDataRows: (
    data: any[], 
    satisfactionHeader: string, 
    loyaltyHeader: string,
    satisfactionScale: string,
    loyaltyScale: string
  ) => {
    data: any[];
    rejectedReport: DateIssueReport;
    warningReport: DateIssueReport;
  };
  findDataHeaders: (headers: string[]) => { 
    satisfaction: string | null;
    loyalty: string | null;
    scales: {
      satisfaction: string | null;
      loyalty: string | null;
    };
    validationErrors: string[];
  };
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
- `detectDuplicates`: Internal method to find duplicate entries

### Workflow
1. File validation
2. CSV parsing with PapaParse
3. Header detection and scale validation
4. Scale compatibility checking
5. Data row validation with provided function
6. Date format detection and validation
7. Duplicate checking
8. Scale compatibility verification with existing data
9. Import mode selection for existing data
10. Final data processing and callback

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
  showImportModeDialog,
  validateDataRows,
  findDataHeaders
});

// Then use in component
const handleFileSelect = (file: File) => {
  clearValidationState();
  parseFile(file);
};
```

### Key Logic Highlights

#### Header Detection
```typescript
// Use validation utils for header detection
const headers = Object.keys(results.data[0] || {});
// Use strict validation for headers and scales
const headerValidation = validateHeaders(headers);

if (headerValidation.validationErrors.length > 0) {
  onError({
    title: 'Invalid CSV Headers',
    message: headerValidation.validationErrors[0],
    details: headerValidation.validationErrors.length > 1 ? 
      headerValidation.validationErrors.slice(1).join('\n') : undefined,
    fix: 'Please ensure your headers include valid scales (1-5, 1-7, or 1-10)'
  });
  setProgress(null);
  return;
}

const satisfactionHeader = headerValidation.satisfaction;
const loyaltyHeader = headerValidation.loyalty;
const scales = headerValidation.scales;
```

#### Scale Validation
```typescript
// Validate scales if existing data is present
if (scalesLocked) {
  if (headerScales.satisfaction !== satisfactionScale) {
    onError({
      title: 'Scale mismatch',
      message: `CSV uses different Satisfaction scale (${headerScales.satisfaction}) than current (${satisfactionScale})`,
      fix: 'Please adjust your CSV file scales to match the current settings'
    });
    setProgress(null);
    return;
  }

  if (headerScales.loyalty !== loyaltyScale) {
    onError({
      title: 'Scale mismatch',
      message: `CSV uses different Loyalty scale (${headerScales.loyalty}) than current (${loyaltyScale})`,
      fix: 'Please adjust your CSV file scales to match the current settings'
    });
    setProgress(null);
    return;
  }
}
```

#### Date Processing
```typescript
// Process data rows
try {
  const validationResult = validateDataRows(
    results.data, 
    satisfactionHeader, 
    loyaltyHeader,
    headerScales.satisfaction,
    headerScales.loyalty
  );

  const validatedData = validationResult.data;
  
  // Set reports for UI display
  // Filter and set reports for UI display
  if (validationResult.rejectedReport.count > 0) {
    const filteredItems = validationResult.rejectedReport.items.filter(item => {
      // Find the original row
      const row = results.data[item.row - 2]; // Adjust for row numbering
      return isDataRow(row);
    });
    
    if (filteredItems.length > 0) {
      setDateIssuesReport({
        count: filteredItems.length,
        items: filteredItems
      });
    }
  }
  if (validationResult.warningReport.count > 0) {
    const filteredWarnings = validationResult.warningReport.items.filter(item => {
      const row = results.data[item.row - 2]; // Adjust for row numbering
      return isDataRow(row);
    });
    
    if (filteredWarnings.length > 0) {
      setDateWarningsReport({
        count: filteredWarnings.length,
        items: filteredWarnings
      });
    }
  }
```

### Error Handling
- File validation errors
- CSV parsing errors
- Scale detection errors
- Data validation errors
- Scale mismatch errors
- Duplicate detection

### Performance Considerations
- Streaming parser for large files
- Progressive feedback during processing
- Template row filtering
- Asynchronous validation

---

## Hook: useCSVValidation

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