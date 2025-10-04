# CSV Import Components Documentation

## Main Component: CSVImport

**File Location:** `/src/components/data-entry/forms/CSVImport/index.tsx`

### Purpose
The CSVImport component is the main entry point for the CSV import functionality. It orchestrates the file upload, validation, parsing, and data processing workflows, handling user interactions and providing feedback.

### Dependencies
- **External Libraries:**
  - `papaparse`: For CSV parsing
  - `React`: Core library for UI components

- **Internal Components:**
  - `FileUploader`: Drag-and-drop file interface
  - `ProgressIndicator`: Shows import progress
  - `ValidationError`: Displays validation errors
  - `DuplicateReport`: Shows potential duplicates
  - `ReportArea`: Consolidates reports
  - `UploadHistory`: Displays past imports
  - `ImportModeModal`: Selection for append/overwrite

- **Hooks:**
  - `useCSVParser`: Handles CSV parsing
  - `useCSVValidation`: Manages validation state
  - `useNotification`: Global notification system

- **Types:**
  - `HeaderScales`: Scale types from CSV
  - `ValidationErrorData`: Error data structure
  - `ProgressState`: Progress tracking
  - `DateIssueReport`: Date validation issues
  - `DuplicateReport`: Duplicate detection data

### Props
```typescript
interface CSVImportProps {
  // Function to handle imported data
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
  
  // Current scales for validation
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  
  // Existing IDs for duplicate checking
  existingIds: string[];
  
  // If scales are locked due to existing data
  scalesLocked: boolean;
  
  // History of previous uploads
  uploadHistory: UploadHistoryItem[];
  
  // Callback for successful uploads
  onUploadSuccess: (
    fileName: string, 
    count: number, 
    ids: string[], 
    wasOverwrite?: boolean
  ) => void;
}
```

### Key Methods
- `handleFileSelect`: Processes selected file
- `handleCompleteImport`: Finalizes successful import
- `handleImportModeSelect`: Handles append/overwrite choice
- `handleDownloadDuplicateReport`: Generates duplicate report
- `handleDownloadDateErrorsReport`: Generates date errors report
- `handleDownloadDateWarningsReport`: Generates date warnings report
- `handleTemplateDownload`: Creates template CSV

### Workflow
1. File selection via `FileUploader`
2. File parsing via `useCSVParser`
3. Validation of data structure and content
4. Detection of duplicates and issues
5. Display of errors/warnings via `ReportArea`
6. User selection of import mode if existing data
7. Finalization of import process
8. Update of upload history

## Component: FileUploader

**File Location:** `/src/components/data-entry/forms/CSVImport/components/FileUploader.tsx`

### Purpose
Provides a user-friendly interface for selecting CSV files, with drag-and-drop support and visual feedback.

### Props
```typescript
interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onTemplateDownload: () => void;
  processing: boolean;
}
```

### Features
- Drag-and-drop file upload
- Click-to-browse fallback
- Template download button
- Visual drop zone feedback
- Disabled state during processing
- File size and type information

### Key Methods
- `handleDrop`: Processes dropped files
- `handleFileChange`: Handles manual file selection

### CSS Classes
- `.csv-file-uploader`: Main container
- `.csv-file-uploader__dropzone`: Drop zone area
- `.csv-file-uploader__dropzone--dragging`: Active drag state
- `.csv-file-uploader__template-button`: Template download button

## Component: ProgressIndicator

**File Location:** `/src/components/data-entry/forms/CSVImport/components/ProgressIndicator.tsx`

### Purpose
Displays the progress of file processing, with visual indicators for different stages.

### Props
```typescript
interface ProgressIndicatorProps {
  progress: ProgressState;
}

interface ProgressState {
  stage: 'reading' | 'validating' | 'processing' | 'complete' | 'error';
  progress: number;
  fileName: string;
  fileSize: string;
}
```

### Features
- Visual progress bar
- Stage-specific colors
- Percentage display
- File information display
- Status text based on stage

### Key Methods
- `getStatusText`: Gets text based on stage
- `getProgressBarColor`: Gets color based on stage

### CSS Classes
- `.csv-progress-indicator`: Main container
- `.csv-progress-indicator__bar`: Progress bar container
- `.csv-progress-indicator__fill`: Colored progress indicator
- `.csv-progress-indicator__file-info`: File information display

## Component: ReportArea

**File Location:** `/src/components/data-entry/forms/CSVImport/components/ReportArea.tsx`

### Purpose
Centralizes the display of all error and warning reports in a structured format.

### Props
```typescript
interface ReportAreaProps {
  errorReports?: DateIssueReport | null;
  validationErrors?: ValidationErrorData | null;
  warningReports?: {
    duplicates?: DuplicateReport | null;
    dateWarnings?: DateIssueReport | null;
  };
  onDownloadDuplicates: () => void;
  onDownloadDateErrors: () => void;
  onDownloadDateWarnings: () => void;
}
```

### Features
- Categorized display of errors and warnings
- Visual separation of different report types
- Download buttons for detailed reports
- Conditional display based on report existence
- Consistent styling with severity indicators

### CSS Classes
- `.csv-import__reports`: Main container
- `.csv-import__report-area--error`: Error section
- `.csv-import__report-area--warning`: Warning section
- `.csv-import__report-header`: Section header
- `.csv-import__report-item`: Individual report item
- `.csv-import__report-button`: Download buttons

## Component: DateIssuesReport

**File Location:** `/src/components/data-entry/forms/CSVImport/components/DateIssuesReport.tsx`

### Purpose
Displays information about date formatting issues detected during import.

### Props
```typescript
interface DateIssuesReportProps {
  report: DateIssueReport;
  onDownload: () => void;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  iconClassName?: string;
  buttonClassName?: string;
  isError?: boolean;
  message?: string;
}

interface DateIssueReport {
  count: number;
  items: Array<{
    row: number;
    id: string;
    reason: string;
    value: string;
  }>;
}
```

### Features
- Count of affected rows
- Contextual messaging
- Download button for detailed report
- Configurable styling for errors vs warnings
- Custom message override
- Conditional rendering based on issue count

### CSS Classes
- `.csv-import__date-issues`: Error container
- `.csv-import__date-warnings`: Warning container
- `.csv-import__download-report`: Download button

## Component: DuplicateReport

**File Location:** `/src/components/data-entry/forms/CSVImport/components/DuplicateReport.tsx`

### Purpose
Displays information about potential duplicate entries detected during import.

### Props
```typescript
interface DuplicateReportProps {
  report: DuplicateReport;
  onDownload: () => void;
}

interface DuplicateReport {
  count: number;
  items: Array<{ 
    id: string; 
    name: string; 
    reason: string;
  }>;
}
```

### Features
- Count of potential duplicates
- Download button for detailed report
- Warning styling
- Conditional rendering based on duplicate count

### CSS Classes
- `.csv-duplicate-report`: Main container
- `.csv-duplicate-report__header`: Report header
- `.csv-duplicate-report__icon`: Warning icon
- `.csv-duplicate-report__download`: Download button

## Component: ValidationError

**File Location:** `/src/components/data-entry/forms/CSVImport/components/ValidationError.tsx`

### Purpose
Displays critical validation errors that prevent import completion.

### Props
```typescript
interface ValidationErrorProps {
  error: ValidationErrorData;
}

interface ValidationErrorData {
  title: string;
  message: string;
  details?: string;
  fix?: string;
}
```

### Features
- Error title and message
- Optional detailed explanation
- Suggested fix instructions
- Error styling
- Warning icon

### CSS Classes
- `.csv-validation-error`: Main container
- `.csv-validation-error__title`: Error title
- `.csv-validation-error__message`: Error message
- `.csv-validation-error__details`: Additional details
- `.csv-validation-error__fix`: Fix instructions

## Component: UploadHistory

**File Location:** `/src/components/data-entry/forms/CSVImport/components/UploadHistory.tsx`

### Purpose
Displays the history of previous CSV imports with their status.

### Props
```typescript
interface UploadHistoryProps {
  history: UploadHistoryItem[];
}

interface UploadHistoryItem {
  fileName: string;
  timestamp: Date;
  count: number;
  remainingCount: number;
  associatedIds: string[];
}
```

### Features
- List of previous imports
- File name and timestamp
- Entry count and remaining count
- Special styling for deleted entries
- Conditional rendering based on history existence

### CSS Classes
- `.csv-upload-history`: Main container
- `.csv-upload-history__title`: Section title
- `.csv-upload-history__list`: History list container
- `.csv-upload-history__item`: Individual history item
- `.csv-upload-history__deleted`: Deleted entry styling

## Component: ImportModeModal

**File Location:** `/src/components/data-entry/forms/CSVImport/components/ImportModeModal.tsx`

### Purpose
Presents a modal dialog for selecting import mode when existing data is present.

### Props
```typescript
interface ImportModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: ImportMode) => void;
}

type ImportMode = 'append' | 'overwrite';
```

### Features
- Modal dialog with overlay
- Two options: append or overwrite
- Descriptive text for each option
- Visual distinction between options
- Close button
- Background click dismissal

### CSS Classes
- `.import-mode-overlay`: Background overlay
- `.import-mode-modal`: Modal container
- `.import-mode-header`: Modal header
- `.import-mode-content`: Content area
- `.import-mode-buttons`: Button container
- `.import-mode-button`: Option buttons
- `.import-mode-button--append`: Append option styling
- `.import-mode-button--overwrite`: Overwrite option styling

## Component: DuplicateHandler

**File Location:** `/src/components/data-entry/components/DuplicateHandler.tsx`

### Purpose
Displays a modal dialog for individual duplicate entry resolution during manual data entry.

### Props
```typescript
interface DuplicateHandlerProps {
  isOpen: boolean;
  onClose: () => void;
  existingEntry: DuplicateEntry;
  newEntry: DuplicateEntry;
  onSkip: () => void;
  onAdd: () => void;
  onEdit: () => void;
}

interface DuplicateEntry {
  id: string;
  name?: string;
  email?: string;
  satisfaction: number;
  loyalty: number;
  date?: string;
}
```

### Features
- Side-by-side comparison of entries
- Visual distinction between existing and new entries
- Three action options: Skip, Edit, Add
- Contextual information about duplicate cause
- Modal dialog with overlay
- Close button

### CSS Classes
- `.duplicate-handler-overlay`: Background overlay
- `.duplicate-handler-modal`: Modal container
- `.duplicate-handler-header`: Modal header
- `.duplicate-handler-content`: Content area
- `.duplicate-handler-comparison`: Entry comparison
- `.duplicate-handler-entry`: Entry display
- `.duplicate-handler-footer`: Button container
- `.duplicate-handler-button`: Action buttons
