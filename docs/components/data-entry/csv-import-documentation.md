# CSV Import System Documentation

## Overview

The CSV Import system provides a user-friendly interface for importing data from CSV files with robust validation, error handling, and duplicate detection. It supports multiple scales, date formats, and custom fields.

![CSV Import Workflow](workflow-diagram.svg)

## Import Workflow

1. **File Upload**: User selects a CSV file through the FileUploader component
2. **Initial Internal Validation**:
   - Checks file format and size
   - Validates internal structure (headers, data types)
   - Detects internal duplicate IDs
   - Verifies scale compatibility
3. **Add/Replace Decision** (if existing data present):
   - User chooses to add to current data or replace everything
   - If replace is chosen, all existing data is deleted
4. **Between-Gates Validation**:
   - Examines values for validity (dates, emails, required fields)
   - Identifies potential duplicates with existing data
   - Checks for unusual dates or values
5. **Data Import**:
   - Processes and normalizes valid data
   - Adds entries to the data table
   - Updates storage and notifies parent components

## Key Components

### FileUploader

Manages the file selection UI with drag-and-drop support and template download functionality.

```tsx
<FileUploader 
  onFileSelect={handleFileSelect}
  onTemplateDownload={handleTemplateDownload}
  processing={!!progress || !!pendingFileData}
/>
```

### ProgressIndicator

Displays real-time feedback during file processing with stage-specific colors and messages.

```tsx
<ProgressIndicator progress={progress} />
```

### ImportModeModal

Presents the add/replace decision when existing data is detected.

```tsx
<ImportModeModal 
  isOpen={showImportModeModal}
  onClose={() => {
    setShowImportModeModal(false);
    setPendingFileData(null);
    setProgress(null);
  }}
  onSelectMode={handleImportModeSelect}
/>
```

### ReportArea

Centralizes the display of validation results, including errors and warnings.

```tsx
<ReportArea 
  errorReports={dateIssuesReport}
  validationErrors={error}
  warningReports={{
    duplicates: duplicateReport,
    dateWarnings: dateWarningsReport
  }}
  onDownloadDuplicates={handleDownloadDuplicateReport}
  onDownloadDateErrors={handleDownloadDateErrorsReport}
  onDownloadDateWarnings={handleDownloadDateWarningsReport}
/>
```

## Core Utility Functions

### detectDuplicates

Identifies potential duplicates between imported data and existing entries.

```typescript
const duplicateInfo = detectDuplicates(validatedData, existingIds);
```

### validateDataRows

Processes each data row with comprehensive validation for all fields.

```typescript
const validationResult = validateDataRows(
  results.data, 
  headerResult.satisfactionHeader, 
  headerResult.loyaltyHeader,
  headerScales.satisfaction,
  headerScales.loyalty
);
```

### processParsedData

Handles the final validation and import of data after all checks have passed.

```typescript
processParsedData(
  pendingFileData.validatedData, 
  pendingFileData.headerScales, 
  pendingFileData.file.name,
  overwrite
);
```

## Key State Management

### Progress Tracking

```typescript
const [progress, setProgress] = useState<ProgressState | null>(null);
```

### Validation Reports

```typescript
const [error, setError] = useState<ValidationErrorData | null>(null);
const [duplicateReport, setDuplicateReport] = useState<DuplicateReport | null>(null);
const [dateIssuesReport, setDateIssuesReport] = useState<DateIssueReport | null>(null);
const [dateWarningsReport, setDateWarningsReport] = useState<DateIssueReport | null>(null);
```

### Pending File Data

Stores data between validation stages and import mode selection.

```typescript
const [pendingFileData, setPendingFileData] = useState<{
  file: File, 
  headerScales: HeaderScales,
  validatedData?: any[]
} | null>(null);
```

## Critical Functions

### handleCompleteImport

Called when initial parsing and validation are complete. Determines whether to proceed with import or show the Add/Replace modal.

```typescript
const handleCompleteImport = useCallback((
  validatedData: any[], 
  headerScales: HeaderScales, 
  fileName: string,
  hasDateIssues: boolean = false,
  hasDateWarnings: boolean = false
) => {
  // Check for duplicates and set reports
  const duplicateInfo = detectDuplicates(validatedData, existingIds);
  if (duplicateInfo.count > 0) {
    setDuplicateReport(duplicateInfo);
  }
  
  // Show Add/Replace if existing data present
  if (existingIds.length > 0) {
    setPendingFileData({ 
      file: new File([], fileName),
      headerScales,
      validatedData
    });
    showImportModeDialog();
    return false;
  }
  
  // Otherwise process as "add"
  return processParsedData(validatedData, headerScales, fileName, false);
}, [existingIds, setDuplicateReport, processParsedData, showImportModeDialog]);
```

### handleImportModeSelect

Processes the user's choice from the Add/Replace modal.

```typescript
const handleImportModeSelect = (mode: ImportMode) => {
  setShowImportModeModal(false);
  
  if (!pendingFileData) {
    setProgress(null);
    return;
  }
  
  const overwrite = mode === 'overwrite';
  
  // Process the data with selected mode
  processParsedData(
    pendingFileData.validatedData, 
    pendingFileData.headerScales, 
    pendingFileData.file.name || 'data.csv',
    overwrite
  );
};
```

## Validation Rules

### Internal Validation

- File type must be CSV
- File size limit: 10MB
- No duplicate IDs within the file
- Scale compatibility with existing data
- Required headers present

### Value Validation

- Satisfaction and loyalty values within scale ranges
- Valid date formats and reasonable dates
- Valid email formats
- Required fields present
- No invalid characters or values

## Error Handling

The system provides comprehensive error and warning feedback:

1. **Error Messages**: Blocks import when critical issues are found
2. **Warning Messages**: Allows import but informs the user of potential issues
3. **Duplicate Reports**: Shows potentially conflicting entries
4. **Date Issue Reports**: Identifies problematic date values

## Download Features

Users can download detailed reports for:

1. Duplicate entries
2. Date errors
3. Date warnings
4. CSV templates with correct headers

## Integration with Parent Components

The CSV Import component communicates with parent components through these props:

```typescript
interface CSVImportProps {
  onImport: (
    data: Array<{ 
      id: string; 
      name: string; 
      satisfaction: number; 
      loyalty: number;
      date?: string;
      email?: string;
      [key: string]: any;
    }>, 
    headerScales: HeaderScales,
    overwrite?: boolean
  ) => string[];
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  existingIds: string[];
  scalesLocked: boolean;
  uploadHistory: UploadHistoryItem[];
  onUploadSuccess: (
    fileName: string, 
    count: number, 
    ids: string[], 
    wasOverwrite?: boolean
  ) => void;
}
```
