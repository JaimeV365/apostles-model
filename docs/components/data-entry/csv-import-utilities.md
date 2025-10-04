# CSV Import Utilities Documentation

## File Handling Utilities

**File Location:** `/src/components/data-entry/forms/CSVImport/utils/fileHandlers.ts`

### Purpose
Provides utilities for file validation, size calculation, and template generation.

### Key Functions

#### `formatFileSize`
```typescript
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
```
Converts a byte value to a human-readable size string.

#### `validateFile`
```typescript
export const validateFile = (file: File): { isValid: boolean; error: ValidationErrorData | null } => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
    
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: {
        title: 'File too large',
        message: `File size (${formatFileSize(file.size)}) exceeds maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`,
        fix: 'Please reduce your file size or split it into smaller files'
      }
    };
  }

  if (file.type && !['text/csv', 'application/vnd.ms-excel'].includes(file.type)) {
    return {
      isValid: false,
      error: {
        title: 'Invalid file type',
        message: 'Only CSV files are supported',
        details: `Received file of type: ${file.type}`,
        fix: 'Please save your file as a CSV and try again'
      }
    };
  }

  return { isValid: true, error: null };
};
```
Validates a file for size and type constraints.

#### `generateTemplateCSV`
```typescript
export const generateTemplateCSV = (satisfactionScale: ScaleFormat, loyaltyScale: ScaleFormat): void => {
  try {
    // Parse scale values
    const [satMin, satMax] = satisfactionScale.split('-');
    const [loyMin, loyMax] = loyaltyScale.split('-');
    
    // Create template with required and optional columns with clearer formatting
    const headerRow = `ID,Name,Email,Satisfaction:${satMin}-${satMax},Loyalty:${loyMin}-${loyMax},Date(dd/mm/yyyy),Country,TrueLoyalist,NumPurchases,NumComplaints`;
    const exampleRow = `ABC123,John Smith,john@example.com,${satMax},${loyMax},01/01/2024,United Kingdom,Yes,5,0`;
    
    // Enhanced notes row with more specific instructions
    const notesRow = `optional,optional,optional,REQUIRED (1-${satMax}),REQUIRED (1-${loyMax}),optional (dd/mm/yyyy, mm/dd/yyyy, or yyyy-mm-dd),optional,optional,optional,optional`;
    
    // Information row with additional guidance
    const infoRow = `,,,"Use 'Sat' or 'CSAT' also works","Use 'Loy' or 'NPS' also works","Include format in header for clarity",,,,`;
    
    const template = `${headerRow}\n${exampleRow}\n${notesRow}\n${infoRow}`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'segmentor_data_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating template CSV:', error);
  }
};
```
Generates a template CSV file with appropriate headers, example data, and instructions based on current scales.

---

## Date Processing Utilities

**File Location:** `/src/components/data-entry/forms/CSVImport/utils/dateProcessing.ts`

### Purpose
Provides specialized functions for date parsing, validation, and formatting with support for multiple formats.

### Key Functions

#### `isLeapYear`
```typescript
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};
```
Determines if a given year is a leap year.

#### `getDaysInMonth`
```typescript
export const getDaysInMonth = (month: number, year?: number): number => {
  if (month === 2) {
    return year && isLeapYear(year) ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
};
```
Gets the number of days in a month, accounting for leap years.

#### `getFormatSeparator`
```typescript
export const getFormatSeparator = (dateFormat: string): string => {
  return dateFormat.includes('/') ? '/' : 
         dateFormat.includes('-') ? '-' : '.';
};
```
Extracts the separator character from a date format string.

#### `expandTwoDigitYear`
```typescript
export const expandTwoDigitYear = (yearStr: string): string => {
  const currentYear = new Date().getFullYear();
  const century = currentYear.toString().substring(0, 2);
  const enteredYear = parseInt(yearStr);
  const twoDigitCurrentYear = currentYear % 100;
  
  // Use current century if year is ≤ current two-digit year, otherwise use previous century
  return enteredYear <= twoDigitCurrentYear 
    ? `${century}${yearStr.padStart(2, '0')}` 
    : `${parseInt(century) - 1}${yearStr.padStart(2, '0')}`;
};
```
Converts a two-digit year to a four-digit year based on the current year.

#### `getDateFormatFromHeader`
```typescript
export const getDateFormatFromHeader = (header: string): string => {
  const headerLower = header.toLowerCase();
  
  // Check explicit format indicators in parentheses first
  if (headerLower.includes('(dd/mm/yyyy)') || headerLower.includes('(dd-mm-yyyy)')) {
    return 'dd/mm/yyyy';
  }
  if (headerLower.includes('(mm/dd/yyyy)') || headerLower.includes('(mm-dd-yyyy)')) {
    return 'mm/dd/yyyy';
  }
  if (headerLower.includes('(yyyy-mm-dd)') || headerLower.includes('(yyyy/mm/dd)')) {
    return 'yyyy-mm-dd';
  }
  
  // Then check for patterns in the header text
  if (headerLower.includes('dd/mm') || headerLower.includes('dd-mm')) {
    return 'dd/mm/yyyy';
  }
  if (headerLower.includes('mm/dd') || headerLower.includes('mm-dd')) {
    return 'mm/dd/yyyy';
  }
  if (headerLower.includes('yyyy-mm') || headerLower.includes('yyyy/mm')) {
    return 'yyyy-mm-dd';
  }
  
  // Default to dd/mm/yyyy if no indicators are found
  return 'dd/mm/yyyy';
};
```
Extracts the date format from a header name based on format indicators.

#### `parseDateString`
```typescript
export const parseDateString = (dateStr: string, format: string): ParsedDateResult => {
  // Normalize separators to '/'
  const normalizedDate = dateStr.replace(/[-\.]/g, '/');
  const parts = normalizedDate.split('/');
  
  if (parts.length !== 3) {
    return { 
      isValid: false, 
      error: `Date "${dateStr}" does not have three parts (day, month, year)` 
    };
  }
  
  let day, month, year;
  
  // Extract values based on format
  if (format === 'dd/mm/yyyy') {
    [day, month, year] = parts.map(p => parseInt(p.trim()));
  } else if (format === 'mm/dd/yyyy') {
    [month, day, year] = parts.map(p => parseInt(p.trim()));
  } else if (format === 'yyyy-mm-dd') {
    [year, month, day] = parts.map(p => parseInt(p.trim()));
  } else {
    // Default to dd/mm/yyyy if format is unknown
    [day, month, year] = parts.map(p => parseInt(p.trim()));
  }
  
  // Basic validation
  if (isNaN(day) || day < 1 || day > 31) {
    return { isValid: false, error: `Invalid day ${day}` };
  }
  
  if (isNaN(month) || month < 1 || month > 12) {
    return { isValid: false, error: `Invalid month ${month}` };
  }
  
  if (isNaN(year)) {
    return { isValid: false, error: `Invalid year ${year}` };
  }
  
  // Warning checks
  let warning: string | undefined;
  
  // Check year range
  if (year < 1900) {
    warning = `Year ${year} is too far in the past`;
  }
  
  if (year > 2100) {
    warning = `Year ${year} is too far in the future`;
  }
  
  // Check valid days in month
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // Adjust February for leap years
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    daysInMonth[2] = 29;
  }
  
  if (day > daysInMonth[month]) {
    return { isValid: false, error: `Invalid day ${day} for month ${month}` };
  }
  
  // Check if date is in the future
  const currentDate = new Date();
  const enteredDate = new Date(year, month - 1, day);
  
  if (enteredDate > currentDate && !warning) {
    warning = 'Date is in the future';
  }
  
  return { isValid: true, day, month, year, warning };
};
```
Parses and validates a date string based on the provided format.

#### `formatDate`
```typescript
export const formatDate = (day: number, month: number, year: number, format: string): string => {
  const paddedDay = String(day).padStart(2, '0');
  const paddedMonth = String(month).padStart(2, '0');
  
  if (format === 'dd/mm/yyyy') {
    return `${paddedDay}/${paddedMonth}/${year}`;
  } else if (format === 'mm/dd/yyyy') {
    return `${paddedMonth}/${paddedDay}/${year}`;
  } else if (format === 'yyyy-mm-dd') {
    return `${year}-${paddedMonth}-${paddedDay}`;
  }
  
  // Default format
  return `${paddedDay}/${paddedMonth}/${year}`;
};
```
Formats a date based on the provided format.

---

## Date Report Utilities

**File Location:** `/src/components/data-entry/forms/CSVImport/utils/dateReports.ts`

### Purpose
Provides utilities for generating downloadable reports about date issues.

### Key Functions

#### `generateDateIssuesCSV`
```typescript
export const generateDateIssuesCSV = (report: DateIssueReport, reportType: 'issues' | 'warnings'): void => {
  const header = 'Row,ID,Reason,Value\n';
  const rows = report.items.map(item => 
    `${item.row},"${item.id}","${item.reason}","${item.value}"`
  ).join('\n');
  
  const content = header + rows;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Create appropriate filename based on report type
    const filename = reportType === 'issues' 
      ? 'invalid_dates_report.csv' 
      : 'unusual_dates_report.csv';
      
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error generating ${reportType} CSV:`, error);
  }
};
```
Generates a downloadable CSV report of date issues.

---

## Duplicate Detection Utilities

**File Location:** `/src/components/data-entry/forms/CSVImport/utils/duplicates.ts`

### Purpose
Provides utilities for detecting and reporting duplicate entries.

### Key Functions

#### `detectDuplicates`
```typescript
export const detectDuplicates = (newData: any[], existingIds: string[]): DuplicateReport => {
  console.log('Running duplicate detection on', newData.length, 'rows');
  
  if (newData.length === 0) {
    return { count: 0, items: [] };
  }
  
  // Create a map to track all reasons for each row by ID
  const duplicateMap = new Map<string, { item: any, reasons: Set<string> }>();
  
  // Existing email tracking (for duplication against existing data)
  const existingEmails = new Set<string>();
  
  // Check for duplicate IDs within the file
  const idsInFile = newData.filter(row => row.id).map(row => row.id);
  const uniqueIds = new Set<string>();
  const duplicateIds = new Set<string>();
  
  // Find duplicated IDs within this import
  idsInFile.forEach(id => {
    if (uniqueIds.has(id)) {
      duplicateIds.add(id);
    } else {
      uniqueIds.add(id);
    }
  });
  
  // Add all instances of duplicated IDs to the map
  duplicateIds.forEach(dupId => {
    const items = newData.filter(row => row.id === dupId);
    items.forEach(item => {
      const id = item.id || `noID-${Math.random().toString(36).substring(2, 9)}`;
      if (!duplicateMap.has(id)) {
        duplicateMap.set(id, { item, reasons: new Set() });
      }
      duplicateMap.get(id)?.reasons.add('Duplicate ID within imported file');
    });
  });
  
  // Check for IDs that already exist in the system
  const conflictingIds = idsInFile.filter(id => existingIds.includes(id));
  
  conflictingIds.forEach(id => {
    const item = newData.find(row => row.id === id);
    if (item) {
      const itemId = item.id || `noID-${Math.random().toString(36).substring(2, 9)}`;
      if (!duplicateMap.has(itemId)) {
        duplicateMap.set(itemId, { item, reasons: new Set() });
      }
      duplicateMap.get(itemId)?.reasons.add('ID already exists in system');
    }
  });
  
  // Add email duplicate detection
  // Create a map of all emails for quick lookup
  const emailMap = new Map<string, any[]>();
  
  // First gather all emails in this import
  newData.forEach(row => {
    if (row.email) {
      const email = row.email.toLowerCase().trim();
      if (!emailMap.has(email)) {
        emailMap.set(email, []);
      }
      emailMap.get(email)?.push(row);
    }
  });
  
  // Check for duplicate emails
  emailMap.forEach((rows, email) => {
    if (rows.length > 1) {
      // Duplicates within this import
      rows.forEach(row => {
        const itemId = row.id || `noID-${Math.random().toString(36).substring(2, 9)}`;
        if (!duplicateMap.has(itemId)) {
          duplicateMap.set(itemId, { item: row, reasons: new Set() });
        }
        duplicateMap.get(itemId)?.reasons.add('Duplicate email within imported file');
      });
    }
  });
  
  // Convert the map to the expected output format
  const duplicates: Array<{ id: string; name: string; reason: string }> = [];
  duplicateMap.forEach((entry, id) => {
    duplicates.push({
      id,
      name: entry.item.name || 'Unnamed',
      reason: Array.from(entry.reasons).join(', ')
    });
  });
  
  const result = {
    count: duplicates.length,
    items: duplicates
  };
  
  return result;
};
```
Detects duplicates within the imported data and against existing data.

#### `generateDuplicateCSV`
```typescript
export const generateDuplicateCSV = (duplicates: DuplicateReport): void => {
  const header = 'ID,Name,Reason\n';
  const rows = duplicates.items.map(item => 
    `"${item.id}","${item.name}","${item.reason}"`
  ).join('\n');
  
  const content = header + rows;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'duplicate_records.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating duplicate CSV:', error);
  }
};
```
Generates a downloadable CSV report of duplicate entries.

---

## Scale Validation Utilities

**File Location:** `/src/components/data-entry/forms/CSVImport/utils/strictScaleValidator.ts`

### Purpose
Provides utilities for validating scale formats and detecting scales from headers.

### Key Functions

#### `validateScaleFormat`
```typescript
export function validateScaleFormat(scale: string, type: 'satisfaction' | 'loyalty'): boolean {
    return type === 'satisfaction' 
      ? VALID_SAT_SCALES.includes(scale as ScaleFormat)
      : VALID_LOY_SCALES.includes(scale as ScaleFormat);
}
```
Validates if a scale is in the list of valid scales for the specified type.

#### `extractScaleFromHeader`
```typescript
export function extractScaleFromHeader(header: string, type: 'satisfaction' | 'loyalty'): {
  found: boolean; 
  valid: boolean;
  scale: ScaleFormat | null;
  error: string | null;
} {
    const normalizedHeader = header.toLowerCase().replace(/\s+/g, '');
  let scaleMatch: string | null = null;
  
  // Try to find any scale pattern in the header
  // Common formats: Sat-1-5, Satisfaction:1-5, CSAT(1-5)
  const patterns = [
    /-(\d+-\d+)/, // Pattern like "Sat-1-5"
    /:(\d+-\d+)/, // Pattern like "Satisfaction:1-5"
    /\((\d+-\d+)\)/ // Pattern like "CSAT(1-5)"
  ];
  
  for (const pattern of patterns) {
    const match = normalizedHeader.match(pattern);
    if (match && match[1]) {
      scaleMatch = match[1];
      break;
    }
  }
  
  if (!scaleMatch) {
    return { 
      found: false, 
      valid: false, 
      scale: null, 
      error: `No scale found in header "${header}". Expected format like "Satisfaction:1-5"` 
    };
  }
  
  const isValid = validateScaleFormat(scaleMatch, type);
  
  return {
    found: true,
    valid: isValid,
    scale: isValid ? scaleMatch as ScaleFormat : null,
    error: isValid ? null : `Invalid scale "${scaleMatch}" in header "${header}". Valid scales for ${type} are: ${type === 'satisfaction' ? VALID_SAT_SCALES.join(', ') : VALID_LOY_SCALES.join(', ')}`
  };
}
```
Extracts and validates a scale from a header string.

#### `validateHeaders`
```typescript
export function validateHeaders(headers: string[]): {
    satisfaction: string | null;
    loyalty: string | null;
    scales: {
      satisfaction: ScaleFormat | null;
      loyalty: ScaleFormat | null;
    };
    validationErrors: string[];
} {
    let satisfactionHeader: string | null = null;
    let loyaltyHeader: string | null = null;
    let satisfactionScale: ScaleFormat | null = null;
    let loyaltyScale: ScaleFormat | null = null;
    const errors: string[] = [];
  
    // Find header containing specified terms
    const findHeader = (searchTerms: string[]): string | null => {
      return headers.find(header => {
        const normalized = header.toLowerCase();
        return searchTerms.some(term => normalized.includes(term));
      }) || null;
    };
  
    // Find satisfaction header
    satisfactionHeader = findHeader(['sat', 'csat', 'satisfaction']);
    
    if (satisfactionHeader) {
      const result = extractScaleFromHeader(satisfactionHeader, 'satisfaction');
      if (result.valid) {
        satisfactionScale = result.scale;
      } else {
        errors.push(result.error || `Invalid satisfaction scale in header "${satisfactionHeader}"`);
      }
    } else {
      errors.push("Missing satisfaction header (e.g., 'Satisfaction:1-5', 'Sat-1-7')");
    }
  
    // Find loyalty header
    loyaltyHeader = findHeader(['loy', 'loyalty', 'nps']);
    
    if (loyaltyHeader) {
      // Special case for NPS
      if (loyaltyHeader.toLowerCase() === 'nps') {
        loyaltyScale = '0-10'; // Default scale for NPS
      } else {
        const result = extractScaleFromHeader(loyaltyHeader, 'loyalty');
        if (result.valid) {
          loyaltyScale = result.scale;
        } else {
          errors.push(result.error || `Invalid loyalty scale in header "${loyaltyHeader}"`);
        }
      }
    } else {
      errors.push("Missing loyalty header (e.g., 'Loyalty:1-5', 'Loy-1-7', 'NPS')");
    }
  
    return {
      satisfaction: satisfactionHeader,
      loyalty: loyaltyHeader,
      scales: {
        satisfaction: satisfactionScale,
        loyalty: loyaltyScale
      },
      validationErrors: errors
    };
}
```
Validates all headers and extracts scales.

#### `validateDataValue`
```typescript
export function validateDataValue(value: number, scale: ScaleFormat): {
  valid: boolean;
  error?: string;
} {
  if (typeof value !== 'number' || isNaN(value)) {
    return {
      valid: false,
      error: `Value must be a valid number within range`
    };
  }
  
  const [min, max] = scale.split('-').map(Number);
  
  if (value < min || value > max) {
    return {
      valid: false,
      error: `Value ${value} is outside the valid range (${min}-${max})`
    };
  }
  
  return { valid: true };
}
```
Validates a single data value against a scale.

#### `validateRow`
```typescript
export function validateRow(
  row: any,
  satisfactionHeader: string,
  loyaltyHeader: string,
  satisfactionScale: ScaleFormat,
  loyaltyScale: ScaleFormat
): {
  valid: boolean;
  errors: string[];
  processedRow: any | null;
} {
  const errors: string[] = [];
  
  // Get and validate satisfaction value
  const satValue = Number(row[satisfactionHeader]);
  const satValidation = validateDataValue(satValue, satisfactionScale);
  if (!satValidation.valid) {
    errors.push(`Satisfaction: ${satValidation.error}`);
  }
  
  // Get and validate loyalty value
  const loyValue = Number(row[loyaltyHeader]);
  const loyValidation = validateDataValue(loyValue, loyaltyScale);
  if (!loyValidation.valid) {
    errors.push(`Loyalty: ${loyValidation.error}`);
  }
  
  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      processedRow: null
    };
  }
  
  // Create processed row with validated values
  return {
    valid: true,
    errors: [],
    processedRow: {
      ...row,
      satisfaction: satValue,
      loyalty: loyValue
    }
  };
}
```
Validates a single data row.

#### `validateDataSet`
```typescript
export function validateDataSet(
  data: any[],
  satisfactionHeader: string,
  loyaltyHeader: string,
  satisfactionScale: ScaleFormat,
  loyaltyScale: ScaleFormat
): {
  valid: boolean;
  errors: Array<{
    rowIndex: number;
    data: any;
    errors: string[];
  }>;
  validData: any[];
} {
  const errors: Array<{
    rowIndex: number;
    data: any;
    errors: string[];
  }> = [];
  
  const validData: any[] = [];
  
  data.forEach((row, index) => {
    const validation = validateRow(
      row,
      satisfactionHeader,
      loyaltyHeader,
      satisfactionScale,
      loyaltyScale
    );
    
    if (!validation.valid) {
      errors.push({
        rowIndex: index + 2, // +2 for header row and 0-indexing
        data: row,
        errors: validation.errors
      });
    } else if (validation.processedRow) {
      validData.push(validation.processedRow);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    validData
  };
}
```
Validates an entire dataset.

---

## General Validation Utilities

**File Location:** `/src/components/data-entry/forms/CSVImport/utils/validation.ts`

### Purpose
Provides general validation utilities for CSV data.

### Key Functions

#### `validateEmail`
```typescript
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email) return { isValid: true };
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return {
    isValid: re.test(String(email).toLowerCase()),
    message: 'Please enter a valid email address'
  };
};
```
Validates an email address format.

#### `findDataHeaders`
```typescript
export const findDataHeaders = (headers: string[]): { 
  satisfaction: string | null;
  loyalty: string | null;
  scales: {
    satisfaction: string | null;
    loyalty: string | null;
  },
  validationErrors: string[]
} => {
  let satisfactionHeader = null;
  let loyaltyHeader = null;
  let satisfactionScale = null;
  let loyaltyScale = null;
  const errors = [];

  // Helper to normalize
  const normalizeHeader = (header: string) => header.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Find satisfaction and loyalty headers
  for (const header of headers) {
    const normalized = normalizeHeader(header);
    
    // Find satisfaction header
    if ((normalized.includes('sat') || normalized.includes('csat')) && !satisfactionHeader) {
      satisfactionHeader = header;
      
      // Check for scale
      const { scale, valid } = extractScale(header);
      
      if (scale) {
        satisfactionScale = scale;
        if (!valid) {
          errors.push(`Invalid satisfaction scale format in header "${header}". Valid scales are 1-5, 1-7, or 1-10.`);
        }
      } else {
        errors.push(`Missing scale in satisfaction header "${header}". Format should be like "Satisfaction:1-5" or "Sat-1-7".`);
      }
    }
    
    // Find loyalty header
    if ((normalized.includes('