// src/components/data-entry/utils/strictScaleValidator.ts

import { ScaleFormat } from "@/types/base";

// Valid scale formats supported by the system
const VALID_SAT_SCALES: ScaleFormat[] = ['1-3', '1-5', '1-7'];
const VALID_LOY_SCALES: ScaleFormat[] = ['1-5', '1-7', '1-10', '0-10'];

// Function to strictly validate scale format
export function validateScaleFormat(scale: string, type: 'satisfaction' | 'loyalty'): boolean {
    return type === 'satisfaction' 
      ? VALID_SAT_SCALES.includes(scale as ScaleFormat)
      : VALID_LOY_SCALES.includes(scale as ScaleFormat);
}

// Function to extract and validate scale from header
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

// Function to find and validate both satisfaction and loyalty headers
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

// Function to validate data against scale ranges
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

// Function to validate all values in a row
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

// Function to validate all rows in dataset
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