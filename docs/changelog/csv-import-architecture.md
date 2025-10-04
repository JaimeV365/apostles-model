# CSV Import System Architecture

## Overview

The CSV Import System provides a comprehensive solution for importing satisfaction and loyalty data with additional customizable fields. The system handles file uploading, validation, duplicate detection, data processing, and error reporting with robust user feedback mechanisms.

## Component Architecture

```
CSVImport (Main Component)
├── FileUploader
├── ProgressIndicator
├── ReportArea
│   ├── ValidationError
│   ├── DateIssuesReport
│   └── DuplicateReport
├── UploadHistory
└── ImportModeModal
```

## Directory Structure

```
src/components/data-entry/forms/CSVImport/
├── index.tsx                # Main component
├── components/              # UI components
│   ├── FileUploader.tsx     # File upload interface
│   ├── ProgressIndicator.tsx# Progress visualization
│   ├── ValidationError.tsx  # Error display
│   ├── DateIssuesReport.tsx # Date issues reporting
│   ├── ReportArea.tsx       # Consolidated reports
│   ├── DuplicateReport.tsx  # Duplicate reporting
│   ├── UploadHistory.tsx    # Upload history display
│   └── ImportModeModal.tsx  # Import mode selection
├── hooks/                   # Custom hooks
│   ├── useCSVParser.ts      # CSV parsing logic
│   └── useCSVValidation.ts  # Validation state management
├── styles/                  # CSS styles
│   └── index.css            # Main styles
├── types/                   # TypeScript definitions
│   └── index.ts             # Type definitions
└── utils/                   # Utility functions
    ├── csvImportUtils.ts    # General utility functions
    ├── dateProcessing.ts    # Date handling utilities
    ├── dateReports.ts       # Date reporting utilities
    ├── duplicates.ts        # Duplicate detection
    ├── fileHandlers.ts      # File operations
    ├── index.ts             # Utility exports
    └── validation.ts        # Data validation
```

## Data Flow Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  File Input  │────▶│  CSV Parser  │────▶│  Validation  │
└──────────────┘     └──────────────┘     └──────────────┘
                             │                    │
                             ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Data Entry  │◀────│ Data Processing │◀───│ Error Handling │
│    Module    │     └──────────────┘     └──────────────┘
└──────────────┘
```

## Main Component Interfaces

### CSVImport Props

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
  onUploadSuccess: (fileName: string, count: number, ids: string[], wasOverwrite?: boolean) => void;
}
```

### HeaderScales Interface

```typescript
interface HeaderScales {
  satisfaction: ScaleFormat;
  loyalty: ScaleFormat;
}
```

### UploadHistoryItem Interface

```typescript
interface UploadHistoryItem {
  fileName: string;
  timestamp: Date;
  count: number;
  remainingCount: number;
  associatedIds: string[];
}
```

## Core Features

### 1. File Upload

- Drag-and-drop interface
- Click-to-browse fallback
- Template download option
- File size and type validation
- Visual progress indication

### 2. Data Validation

- CSV structure validation
- Required field checking (satisfaction, loyalty)
- Scale range validation
- Date format validation
- Email format validation
- Duplicate detection

### 3. Error Handling

- Categorized errors and warnings
- Visual error reporting
- Downloadable error reports
- Recovery options

### 4. Import Modes

- Append mode (add to existing data)
- Overwrite mode (replace all existing data)
- Modal-based selection interface

### 5. History Tracking

- Persistent upload history
- Entry tracking
- Status monitoring

## Component Relationships

### Parent-Child Relationships

- **DataEntryModule** → **CSVImport**
  - Provides scales, IDs, and history data
  - Receives processed import data

- **CSVImport** → **FileUploader**
  - Handles file selection
  - Provides template download functionality

- **CSVImport** → **ReportArea**
  - Consolidates error and warning reports
  - Provides download functionality

- **CSVImport** → **ImportModeModal**
  - Manages import mode selection
  - Controls flow for existing data

### Hook Relationships

- **useCSVParser**
  - Handles file parsing logic
  - Manages progress state
  - Processes validation

- **useCSVValidation**
  - Manages error and warning states
  - Provides state clearing functions

## State Management

### Component State

```typescript
// Main component state
const [showImportModeModal, setShowImportModeModal] = useState(false);
const [pendingFileData, setPendingFileData] = useState<{file: File, headerScales: HeaderScales} | null>(null);

// From useCSVValidation hook
const {
  error,
  setError,
  duplicateReport,
  setDuplicateReport,
  clearValidationState
} = useCSVValidation();

// From useCSVParser hook
const {
  progress,
  parseFile,
  finalizeImport,
  dateIssuesReport,
  dateWarningsReport
} = useCSVParser({ ... });
```

### External State

- Scales configuration from parent component
- Existing IDs from parent component
- Upload history from parent component
- Notification system from global context

## Error Handling Strategy

The system implements a multi-layered error handling strategy:

1. **Prevention**: Input validation, file type checking, template downloads
2. **Detection**: Format validation, data validation, duplicate detection
3. **Reporting**: Error messages, warnings, detailed reports
4. **Recovery**: Edit options, skip options, import mode selection

### Error Categories

- **Critical Errors**: Prevent import (file format, required fields)
- **Data Errors**: Invalid values (satisfaction/loyalty range)
- **Date Errors**: Invalid or unusual dates
- **Duplicates**: Potential duplicate entries
- **Warnings**: Suspicious values or edge cases

## CSV Template Structure

```
ID,Name,Email,Satisfaction-5,Loyalty-5,Date,Country,TrueLoyalist,NumPurchases,NumComplaints
ABC123,John Smith,john@example.com,5,5,01/01/2024,USA,Yes,5,0
OPTIONAL,OPTIONAL,OPTIONAL,REQUIRED,REQUIRED,OPTIONAL,OPTIONAL,OPTIONAL,OPTIONAL,OPTIONAL
```

### Field Descriptions

- **ID**: Optional identifier (auto-generated if empty)
- **Name**: Optional person or entity name
- **Email**: Optional email address (validates format)
- **Satisfaction-X**: Required satisfaction score (1-X)
- **Loyalty-X**: Required loyalty score (1-X)
- **Date**: Optional date value (multiple formats supported)
- **Country**: Optional geographical data
- **TrueLoyalist**: Optional custom field
- **NumPurchases**: Optional custom field
- **NumComplaints**: Optional custom field
- **Custom Fields**: Any additional columns are imported as custom fields

## Date Format Support

The system supports multiple date formats:

- **DD/MM/YYYY**: Day-Month-Year (European format)
- **MM/DD/YYYY**: Month-Day-Year (US format)
- **YYYY-MM-DD**: Year-Month-Day (ISO format)

### Date Validation Features

- Format auto-detection
- Leap year validation
- Month/day range validation
- Future date warnings
- Historical boundary warnings (too old/too recent)
- Separator normalization (/, -, .)

## Duplicate Detection Strategy

Duplicates are detected based on several criteria:

1. **ID Matching**: Same ID in import or existing data
2. **Email Matching**: Same email addresses
3. **Name Matching**: Identical names
4. **Combined Criteria**: Multiple matching fields

### Duplicate Resolution Options

- **Skip**: Discard the new entry
- **Edit**: Modify the entry before adding
- **Add Anyway**: Keep both entries

## Integration Guide

### Integrating with DataEntryModule

```typescript
<CSVImport 
  onImport={handleCSVImport}
  satisfactionScale={satisfactionScale}
  loyaltyScale={loyaltyScale}
  existingIds={data.map(d => d.id)}
  scalesLocked={isScalesLocked}
  uploadHistory={uploadHistory}
  onUploadSuccess={(fileName, count, ids, wasOverwrite) => {
    // Update upload history
    // Update UI
    // Show notifications
  }}
/>
```

### Handling Import Results

```typescript
const handleCSVImport = (
  csvData: Array<DataPoint>, 
  headerScales: HeaderScales,
  overwrite?: boolean
): string[] => {
  // Process imported data
  const processedData = mapDataToInternalFormat(csvData);
  
  // Either append or overwrite
  const newData = overwrite ? [...processedData] : [...existingData, ...processedData];
  
  // Update application state
  setData(newData);
  
  // Return IDs of imported entries
  return processedData.map(item => item.id);
};
```

## Style Guidelines

The CSV Import system follows consistent styling guidelines:

- **Colors**: 
  - Success: Green (#3a863e)
  - Error: Red (#DC2626, #B91C1C)
  - Warning: Amber (#F59E0B, #92400E)
  - Info: Blue (#3B82F6, #1E40AF)
  - Neutral: Gray (#6B7280, #374151)

- **Typography**:
  - Headings: 16-18px, 600 weight
  - Body: 14-15px, 400 weight
  - Detail text: 12-13px
  - Font family: System font stack

- **Layout**:
  - Card-based containers
  - Consistent padding (16-20px)
  - Responsive grid structure
  - Mobile-friendly design

## Success Metrics

The system tracks several success metrics:

- **Import Success Rate**: Percentage of successful imports
- **Error Rate**: Types and frequency of errors
- **Resolution Rate**: How often errors are resolved vs. abandoned
- **User Satisfaction**: Qualitative feedback on import experience
- **Performance**: Time to process and import data

## Performance Considerations

- **Large File Handling**: Optimized for files up to 10MB
- **Streaming Parser**: Uses streaming for memory efficiency
- **Batch Processing**: Processes large imports in chunks
- **Asynchronous Validation**: Prevents UI blocking during validation
- **Progressive Feedback**: Real-time updates on import progress

## Future Extensions

The CSV import system is designed for extensibility:

1. **Enhanced Filtering**: Advanced filtering of imported data
2. **Custom Mappings**: User-defined column mapping
3. **Data Transformation**: Custom transformations during import
4. **Multi-file Import**: Batch importing of multiple files
5. **Import Templates**: Saved import configurations
