# CSV Import System

## Overview
The CSV Import component manages file importing, validation, processing, and integration with the Apostles Model data entry system. It provides a robust interface for users to upload data with extensive validation and error handling.

## Key Features
- File uploading with drag-and-drop support
- Comprehensive validation system for CSV data
- Scale compatibility checking (1-5, 1-7, 1-10)
- Duplicate detection and handling
- Date format validation and normalization
- Error and warning reporting with downloadable reports
- Import mode selection (append or replace)
- Template generation
- Upload history tracking

## Architecture

### Component Structure
```
CSVImport/
├── index.tsx                # Main component
├── components/              # UI Components
│   ├── FileUploader.tsx     # File upload interface
│   ├── ProgressIndicator.tsx# Progress tracking
│   ├── ValidationError.tsx  # Error display
│   ├── DuplicateReport.tsx  # Duplicate visualization
│   ├── EnhancedReportArea.tsx # Consolidated reporting
│   ├── DateIssuesReport.tsx # Date error reporting
│   ├── DateWarningsReport.tsx # Date warning reporting
│   ├── UploadHistory.tsx    # History tracking
│   ├── ImportModeModal.tsx  # Mode selection dialog
│   └── ReportArea.tsx       # Legacy report display
├── hooks/                   # Logic hooks
│   ├── useCSVParser.ts      # CSV parsing and validation
│   └── useCSVValidation.ts  # Validation state management
├── utils/                   # Utility functions
│   ├── csvImportUtils.ts    # General utilities
│   ├── dateProcessing.ts    # Date handling
│   ├── dateReports.ts       # Date report generation
│   ├── duplicates.ts        # Duplicate detection
│   ├── fileHandlers.ts      # File operations
│   ├── strictScaleValidator.ts # Scale validation
│   └── validation.ts        # Data validation
├── types/                   # Type definitions
│   └── index.ts             # Type declarations
└── styles/                  # CSS styles
    └── index.css            # Component styling
```

### Data Flow
1. **File Selection**: User uploads a CSV through FileUploader
2. **Initial Validation**: File type and size are checked
3. **Parsing**: CSV is parsed using PapaParse
4. **Header Detection**: Column headers and scales are identified
5. **Data Validation**: Rows are validated for required fields and data types
6. **Scale Validation**: Ensures compatibility with existing data
7. **Duplicate Detection**: Checks for duplicates within file and against existing data
8. **Date Validation**: Validates date formats and values
9. **Import Mode**: If existing data, user selects append or replace
10. **Processing**: Valid data is processed and imported
11. **Reporting**: Success notification and history update

## Main Component Interface

```typescript
interface CSVImportProps {
  /** Data import handler */
  onImport: (
    data: Array<{ 
      id: string; 
      name: string; 
      satisfaction: number; 
      loyalty: number;
      date?: string;
      email?: string;
      [key: string]: any;  // Additional custom fields
    }>, 
    headerScales: HeaderScales,
    overwrite?: boolean
  ) => string[];
  
  /** Current satisfaction scale */
  satisfactionScale: ScaleFormat;
  
  /** Current loyalty scale */
  loyaltyScale: ScaleFormat;
  
  /** Existing IDs for validation */
  existingIds: string[];
  
  /** Scale lock status */
  scalesLocked: boolean;
  
  /** Upload history tracking */
  uploadHistory: UploadHistoryItem[];
  
  /** Success callback */
  onUploadSuccess: (
    fileName: string, 
    count: number, 
    ids: string[], 
    wasOverwrite?: boolean
  ) => void;
}
```

## Key Types

### HeaderScales
```typescript
export interface HeaderScales {
  satisfaction: ScaleFormat;
  loyalty: ScaleFormat;
}

type ScaleFormat = '1-3' | '1-5' | '1-7' | '1-10' | '0-10';
```

### ValidationErrorData
```typescript
export interface ValidationErrorData {
  title: string;
  message: string;
  details?: string;
  fix?: string;
}
```

### ProgressState
```typescript
export interface ProgressState {
  stage: 'reading' | 'validating' | 'processing' | 'complete' | 'error';
  progress: number;
  fileName: string;
  fileSize: string;
}
```

### DateIssueReport
```typescript
export interface DateIssueReport {
  count: number;
  items: Array<{
    row: number;
    id: string;
    reason: string;
    value: string;
  }>;
}
```

### DuplicateReport
```typescript
export interface DuplicateReport {
  count: number;
  items: Array<{ 
    id: string; 
    name: string; 
    reason: string;
  }>;
}
```

## Validation System

The CSV import system includes comprehensive validation at multiple levels:

1. **File Validation**
   - File type check (CSV only)
   - File size limits (10MB max)

2. **Header Validation**
   - Required columns detection (satisfaction, loyalty)
   - Scale extraction from headers
   - Format compatibility with existing data

3. **Data Validation**
   - Numeric value validation for satisfaction and loyalty
   - Scale range checking (1-5, 1-7, 1-10)
   - Email format validation
   - Date format validation
   - Custom field handling

4. **Scale Validation**
   - Scale compatibility with existing data
   - Scale format validation (1-5, 1-7, 1-10, 0-10)
   - Scale detection from headers

5. **Duplicate Detection**
   - Internal duplicates (within imported file)
   - External duplicates (against existing data)
   - Multi-field duplicate detection (ID, email, name)

## Date Processing

The system supports multiple date formats:
- dd/mm/yyyy (European)
- mm/dd/yyyy (US)
- yyyy-mm-dd (ISO)

Date processing features:
- Format detection from headers
- Separator normalization (/, -, .)
- Two-digit year expansion
- Leap year validation
- Future date warnings
- Invalid date rejection

## Error Handling and Reporting

The system provides rich error feedback:

1. **Validation Errors**
   - Clear error messages with title and details
   - Suggested fixes
   - Critical errors prevent import

2. **Warning Reports**
   - Duplicate detection warnings
   - Date format warnings (future dates, unusual dates)
   - Allow import with warnings

3. **Downloadable Reports**
   - CSV reports for duplicates
   - CSV reports for date issues
   - CSV reports for date warnings

4. **Visual Feedback**
   - Progress indicators
   - Colored warning and error displays
   - Success notifications

## Usage Example

```tsx
<CSVImport
  onImport={handleImport}
  satisfactionScale="1-5"
  loyaltyScale="1-5"
  existingIds={currentIds}
  scalesLocked={hasData}
  uploadHistory={importHistory}
  onUploadSuccess={handleUploadSuccess}
/>
```

### Handling Import Data

```typescript
const handleImport = (
  data: ImportData[], 
  headerScales: HeaderScales,
  overwrite?: boolean
) => {
  if (overwrite) {
    // Replace existing data
    setData(data);
  } else {
    // Append to existing data
    setData(prevData => [...prevData, ...data]);
  }
  
  // Return the IDs of imported data
  return data.map(item => item.id);
};

const handleUploadSuccess = (
  fileName: string, 
  count: number, 
  ids: string[], 
  wasOverwrite?: boolean
) => {
  // Update upload history
  setImportHistory(prev => [
    {
      fileName,
      timestamp: new Date(),
      count,
      remainingCount: count,
      associatedIds: ids
    },
    ...prev
  ]);
  
  // Additional success handling
};
```

## Template Generation

The system can generate template CSV files based on current scales:

```
ID,Name,Email,Satisfaction:1-5,Loyalty:1-5,Date(dd/mm/yyyy),Country,TrueLoyalist,NumPurchases,NumComplaints
ABC123,John Smith,john@example.com,5,5,01/01/2024,United Kingdom,Yes,5,0
optional,optional,optional,REQUIRED (1-5),REQUIRED (1-5),optional (dd/mm/yyyy, mm/dd/yyyy, or yyyy-mm-dd),optional,optional,optional,optional
,,"Use 'Sat' or 'CSAT' also works","Use 'Loy' or 'NPS' also works","Include format in header for clarity",,,,
```

## Import Modes

When data already exists, users can choose:

1. **Append Mode**
   - Add new data to existing data
   - Keeps all existing entries

2. **Replace Mode**
   - Remove all existing data
   - Replace with new imported data

## Scale Detection

The system can detect scales from headers:
- `Satisfaction:1-5`, `Sat-1-5`, `CSAT(1-5)`
- `Loyalty:1-7`, `Loy-1-7`, `NPS(0-10)`

Scale validation ensures compatibility with existing data when scales are locked.

## Best Practices for Integration

1. **Scale Management**
   - Initialize scales based on first data import
   - Lock scales once data exists
   - Ensure compatibility between manual and imported data

2. **Error Handling**
   - Provide clear feedback for validation errors
   - Allow users to download error reports
   - Show progress during import

3. **UX Considerations**
   - Drag-and-drop file interface
   - Progress indicators for large files
   - Clear validation feedback
   - Template download option

4. **Data Persistence**
   - Store upload history
   - Track imported IDs
   - Handle duplicate resolution
