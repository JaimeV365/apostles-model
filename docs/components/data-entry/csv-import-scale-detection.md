# CSV Import Scale Detection Flow - Complete Documentation

## Overview

The Scale Detection Flow is a critical part of the CSV Import system that automatically detects scale formats from CSV headers and data, then prompts users for confirmation when the scale format is ambiguous. This ensures accurate data interpretation and prevents misclassification of customer feedback.

## Scale Detection Process

### 1. Initial Header Processing

When a CSV file is uploaded, the system first performs basic header processing:

```typescript
// Basic header processing extracts scales from headers
const basicResult = processHeaders(headers);
```

**Supported Header Formats:**
- `Satisfaction:1-5`, `Sat:1-5`, `CSAT:1-5`
- `Loyalty:1-10`, `Loy:1-10`, `NPS` (defaults to 0-10)
- `Sat-5`, `Loy-10` (inferred as 1-5, 1-10)

### 2. Enhanced Data Analysis

If basic processing detects potential ambiguity (especially for scales ending in -10), the system performs enhanced analysis:

```typescript
// Enhanced processing analyzes actual data values
const headerResult = processHeadersWithDataAnalysis(headers, cleanedData);
```

**Key Detection Logic:**
- **Case 1: Data contains 0** → Definitely 0-X scale
- **Case 2: Data starts at 1, max=10** → Could be either 1-10 or 0-10
- **Case 3: Data starts above 1, max=10** → Ask user to confirm
- **Default: Data consistent with header** → Use detected scale

### 3. Scale Confirmation Modal

When user confirmation is needed (`headerResult.needsUserConfirmation = true`), the Scale Confirmation Modal is displayed.

#### Modal Features
- **Clear Scale Options**: Shows both possible interpretations (e.g., "1-10 (1=lowest)" vs "0-10 (0=lowest)")
- **Data Range Display**: Shows the actual range of data found (e.g., "Data range: 3 - 10")
- **User-Friendly Labels**: Removed trademark references, uses simple format descriptions
- **Validation**: Continue button is disabled until user makes required selections

#### Modal Props
```typescript
interface ScaleConfirmationModalProps {
  isOpen: boolean;
  onConfirm: (confirmedScales: { satisfaction?: ScaleFormat; loyalty?: ScaleFormat }) => void;
  onCancel: () => void;
  scaleDetection: {
    satisfaction?: ScaleDetectionResult;
    loyalty?: ScaleDetectionResult;
  };
  basicScales: HeaderScales;
}
```

### 4. Scale Confirmation Processing

When the user confirms their choice, the system processes the confirmed scales without re-triggering the detection:

```typescript
const handleScaleConfirmation = (confirmedScales) => {
  // Apply confirmed scales to header result
  const finalHeaderScales = applyConfirmedScales(pendingFileData.headerResult, confirmedScales);
  
  // Close modal immediately
  setShowScaleConfirmationModal(false);
  
  // Continue with processing using confirmed scales
  // NO re-parsing that would trigger detection again
};
```

## Scale Detection Results

### ScaleDetectionResult Interface

```typescript
interface ScaleDetectionResult {
  definitive: ScaleFormat | null;         // Definitive scale if no ambiguity
  possibleScales: ScaleFormat[];          // Possible interpretations
  needsUserInput: boolean;                // Whether user confirmation is needed
  dataRange: { min: number; max: number }; // Actual data range found
}
```

### Example Detection Scenarios

**Scenario 1: Clear 0-10 Scale**
```typescript
// Header: "Loy-10", Data: [0, 2, 4, 6, 8, 10]
{
  definitive: "0-10",
  possibleScales: [],
  needsUserInput: false,
  dataRange: { min: 0, max: 10 }
}
```

**Scenario 2: Ambiguous 10-Scale**
```typescript
// Header: "Loy-10", Data: [3, 5, 7, 8, 9, 10]
{
  definitive: null,
  possibleScales: ["1-10", "0-10"],
  needsUserInput: true,
  dataRange: { min: 3, max: 10 }
}
```

**Scenario 3: Clear 1-5 Scale**
```typescript
// Header: "Sat-5", Data: [1, 2, 3, 4, 5]
{
  definitive: "1-5",
  possibleScales: [],
  needsUserInput: false,
  dataRange: { min: 1, max: 5 }
}
```

## Supported Scale Formats

### Satisfaction Scales
- `1-3`: Three-point satisfaction scale
- `1-5`: Five-point satisfaction scale (most common)
- `1-7`: Seven-point satisfaction scale

### Loyalty Scales
- `1-5`: Five-point loyalty scale
- `1-7`: Seven-point loyalty scale
- `1-10`: Ten-point loyalty scale (traditional)
- `0-10`: Net Promoter Score (NPS) style scale

## Integration Points

### 1. CSV Parser Hook

The scale detection integrates with `useCSVParser`:

```typescript
// In useCSVParser.ts
if (headerResult.needsUserConfirmation) {
  console.log("Scale confirmation needed, storing pending data");
  setPendingFileData({
    file,
    headerScales: headerResult.scales,
    validatedData: undefined,
    headerResult
  });
  setProgress(prev => prev ? 
    { ...prev, stage: 'waiting-for-scale-confirmation', progress: 60 } : null);
  return;
}
```

### 2. Main CSV Import Component

The main component handles the modal display and confirmation:

```typescript
// Handle scale confirmation modal display
useEffect(() => {
  if (pendingFileData?.headerResult?.needsUserConfirmation) {
    setShowScaleConfirmationModal(true);
  }
}, [pendingFileData]);
```

### 3. Scale Application Function

The `applyConfirmedScales` function applies user choices:

```typescript
export const applyConfirmedScales = (
  result: EnhancedHeaderProcessingResult,
  confirmedScales: { satisfaction?: ScaleFormat; loyalty?: ScaleFormat }
): HeaderProcessingResult => {
  return {
    satisfactionHeader: result.satisfactionHeader,
    loyaltyHeader: result.loyaltyHeader,
    scales: {
      satisfaction: confirmedScales.satisfaction || result.scales.satisfaction,
      loyalty: confirmedScales.loyalty || result.scales.loyalty
    },
    isValid: result.isValid,
    errors: result.errors
  };
};
```

## Error Handling

### 1. Missing Header Information

If header information is missing during scale confirmation:

```typescript
if (!headerResult?.satisfactionHeader || !headerResult?.loyaltyHeader) {
  setError({
    title: 'Processing Error',
    message: 'Missing header information for validation',
    fix: 'Please try uploading the file again'
  });
  setProgress(null);
  return;
}
```

### 2. Re-parsing Errors

If re-parsing fails during scale confirmation:

```typescript
error: (error: Error) => {
  console.error('Scale confirmation re-parsing error:', error);
  setError({
    title: 'File Processing Error',
    message: 'Could not process the file with confirmed scales',
    details: error.message,
    fix: 'Please try uploading the file again'
  });
  setProgress(null);
}
```

### 3. Cancellation Handling

When user cancels scale confirmation:

```typescript
const handleScaleConfirmationCancel = () => {
  console.log("Scale confirmation cancelled");
  setShowScaleConfirmationModal(false);
  setPendingFileData(null);
  setProgress(null);
};
```

## User Experience Flow

### 1. File Upload
User selects a CSV file with headers like "Sat-5" and "Loy-10"

### 2. Automatic Detection
System detects satisfaction scale clearly (1-5) but finds loyalty scale ambiguous due to data range

### 3. Modal Presentation
Scale Confirmation Modal appears with:
- Clear explanation: "We can see you are using a scale that could be interpreted in different ways"
- Two options for loyalty: "1-10 (1=lowest)" and "0-10 (0=lowest)"
- Data range shown: "Data range: 3 - 10"

### 4. User Selection
User selects appropriate scale format based on their understanding

### 5. Confirmation Processing
System applies selected scales and continues with import without re-triggering detection

### 6. Import Completion
Data is processed with correct scale interpretation

## Best Practices

### 1. Clear Header Formats
Recommend users use explicit scale formats in headers:
- ✅ `Satisfaction:1-5`
- ✅ `Loyalty:0-10`
- ⚠️ `Sat-5` (works but may need confirmation)
- ❌ `Satisfaction` (no scale information)

### 2. Consistent Data Ranges
Ensure data values align with intended scale:
- For 0-10 scales: Include 0 values when possible
- For 1-10 scales: Start from 1
- Avoid gaps that create ambiguity

### 3. Template Usage
Provide users with templates that include proper scale formatting

## Technical Implementation Details

### Key Files

1. **headerProcessing.ts**: Core scale detection logic
2. **ScaleConfirmationModal.tsx**: User interface for scale selection
3. **index.tsx**: Main CSV import orchestration
4. **useCSVParser.ts**: Parser hook with scale detection integration

### State Management

```typescript
// Pending file data structure
const [pendingFileData, setPendingFileData] = useState<{
  file: File, 
  headerScales: HeaderScales,
  validatedData?: any[],
  headerResult?: any
} | null>(null);

// Modal visibility
const [showScaleConfirmationModal, setShowScaleConfirmationModal] = useState(false);
```

### Progress Tracking

Scale confirmation adds a specific progress stage:

```typescript
stage: 'waiting-for-scale-confirmation'
```

This prevents the system from completing import while waiting for user input.

## Recent Fixes

### 1. Infinite Loop Prevention

**Problem**: Modal re-triggered scale detection causing infinite loop

**Solution**: Direct Papa.parse call with proper state cleanup instead of calling `parseFile()` again

### 2. Terminology Updates

**Problem**: Used trademarked terms like "NPS-style"

**Solution**: Simplified to generic descriptions like "(0=lowest)" and "(1=lowest)"

### 3. Button State Management

**Problem**: Continue button always enabled even without user selection

**Solution**: Added validation to disable button until required selections are made

```typescript
const hasRequiredSelections = 
  (!hasLoyaltyChoice || selectedScales.loyalty) && 
  (!hasSatisfactionChoice || selectedScales.satisfaction);
```

## Testing Scenarios

### 1. No Ambiguity Cases
- Headers: "Sat:1-5", "Loy:1-7" with data starting from 1
- Expected: No modal, direct processing

### 2. Clear 0-10 Scale
- Headers: "Loy-10" with data containing 0 values
- Expected: No modal, automatic 0-10 detection

### 3. Ambiguous Loyalty Scale
- Headers: "Loy-10" with data range 3-10
- Expected: Modal appears for loyalty scale selection

### 4. Multiple Ambiguous Scales
- Headers: "Sat-7", "Loy-10" with ambiguous data ranges
- Expected: Modal appears with both scale choices

### 5. User Cancellation
- Any ambiguous case with user clicking Cancel
- Expected: Import cancelled, states reset

## Maintenance Guidelines

### 1. Adding New Scale Formats

To add support for new scale formats:

1. Update `ScaleFormat` type definition
2. Add to `satisfactionScales` or `loyaltyScales` arrays
3. Update detection logic in `detectPossibleScales`
4. Test with sample data

### 2. Modifying Detection Logic

When modifying the detection algorithm:

1. Update `detectPossibleScales` function
2. Add comprehensive test cases
3. Verify no regressions in existing scenarios
4. Update documentation

### 3. UI/UX Improvements

For modal improvements:

1. Update `ScaleConfirmationModal.tsx`
2. Modify CSS for styling changes
3. Test accessibility compliance
4. Verify responsive design

---

*Document Version: 1.0*  
*Last Updated: January 2025*  
*Status: Production Ready ✅*  
*Recent Updates: Fixed infinite loop, updated terminology, improved UX ✅*