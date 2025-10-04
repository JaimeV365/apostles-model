# CSVImport Component

## Overview
The CSVImport component manages CSV file importing, validation, and processing for the Apostles Model data entry system.

## Features
- File upload handling
- Drag and drop support
- Progress tracking
- Error validation
- Scale compatibility
- Upload history
- Template download

## Interface
```typescript
interface CSVImportProps {
  /** Data import handler */
  onImport: (data: ImportData[], headerScales: HeaderScales) => string[];
  
  /** Current satisfaction scale */
  satisfactionScale: ScaleFormat;
  
  /** Current loyalty scale */
  loyaltyScale: ScaleFormat;
  
  /** Existing IDs to prevent duplicates */
  existingIds: string[];
  
  /** Scale lock status */
  scalesLocked: boolean;
  
  /** Upload history tracking */
  uploadHistory: UploadHistoryItem[];
  
  /** Success callback */
  onUploadSuccess: (fileName: string, count: number, ids: string[]) => void;
}
```

## Usage Example
```tsx
<CSVImport
  onImport={handleImport}
  satisfactionScale="1-5"
  loyaltyScale="1-5"
  existingIds={currentIds}
  scalesLocked={hasData}
  uploadHistory={history}
  onUploadSuccess={handleSuccess}
/>
```

## File Processing

### Validation Steps
1. File type check
2. Size validation
3. Header verification
4. Data validation
5. Scale compatibility
6. Duplicate checking

### Progress Tracking
```typescript
interface ProgressState {
  stage: 'reading' | 'validating' | 'processing' | 'complete' | 'error';
  progress: number;
  fileName: string;
  fileSize: string;
}
```

## Error Handling

### Validation Errors
```typescript
interface ValidationError {
  title: string;
  message: string;
  details?: string;
  fix?: string;
}
```

### Error Types
- File type mismatch
- Size limits
- Missing columns
- Invalid data
- Scale conflicts
- Duplicate IDs

## Upload History

### History Item
```typescript
interface UploadHistoryItem {
  fileName: string;
  timestamp: Date;
  count: number;
  remainingCount: number;
  associatedIds: string[];
}
```

## Performance
- Chunked processing
- Progress updates
- Memory management
- Large file handling

## Best Practices
- Clear feedback
- Error recovery
- History tracking
- Scale validation

## Related Components
- DataEntryModule
- NotificationSystem
- ScaleManager

## Notes
- Maximum file size: 10MB
- Supported formats: CSV
- Required columns
- Scale constraints