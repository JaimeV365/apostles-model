import { ScaleFormat } from '@/types/base';
import { HeaderScales } from '../types';

export interface HeaderProcessingResult {
  satisfactionHeader: string | null;
  loyaltyHeader: string | null;
  scales: HeaderScales;
  isValid: boolean;
  errors: string[];
}

export interface ScaleDetectionResult {
  definitive: ScaleFormat | null;
  possibleScales: ScaleFormat[];
  needsUserInput: boolean;
  dataRange: { min: number; max: number };
}

export interface EnhancedHeaderProcessingResult extends HeaderProcessingResult {
  scaleDetection?: {
    satisfaction?: ScaleDetectionResult;
    loyalty?: ScaleDetectionResult;
  };
  needsUserConfirmation: boolean;
}

/**
 * Normalizes a header string for comparison
 * Removes special characters, trims whitespace, and converts to lowercase
 */
export const normalizeHeader = (header: string): string => {
  return header.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
};

/**
 * Identifies satisfaction header variants
 */
export const isSatisfactionHeader = (header: string): boolean => {
  // First check the most common pattern directly on the original header
  if (header.match(/^Satisfaction[:|-]/i) || header === 'Satisfaction' || 
      header.match(/^Sat[:|-]/i) || header === 'Sat' || 
      header.match(/^CSAT[:|-]/i) || header === 'CSAT') {
    return true;
  }
  
  // Fall back to the normalized check for other cases
  const normalized = normalizeHeader(header);
  return normalized === 'satisfaction' || 
         normalized === 'sat' || 
         normalized === 'csat';
};

/**
 * Identifies loyalty header variants
 */
export const isLoyaltyHeader = (header: string): boolean => {
  // First check the most common pattern directly on the original header
  if (header.match(/^Loyalty[:|-]/i) || header === 'Loyalty' || header === 'NPS' || header.match(/^Loy[:|-]/i) || header === 'Loy') {
    return true;
  }
  
  // Fall back to the normalized check for other cases
  const normalized = normalizeHeader(header);
  return normalized === 'loyalty' || 
         normalized === 'loy' || 
         normalized === 'nps';
};

/**
 * Extracts scale from header
 * Supports formats like "Satisfaction:1-5", "Satisfaction-1-5", "Sat(1-5)", etc.
 */
export const extractScaleFromHeader = (header: string): ScaleFormat | null => {
  // Try to find scale pattern with colon (Satisfaction:1-5)
  const colonMatch = header.match(/[:](\d+[-]\d+)/);
  if (colonMatch && colonMatch[1]) {
    return colonMatch[1] as ScaleFormat;
  }
  
  // Try to find scale pattern with hyphen (Satisfaction-1-5)
  const hyphenMatch = header.match(/[-](\d+[-]\d+)/);
  if (hyphenMatch && hyphenMatch[1]) {
    return hyphenMatch[1] as ScaleFormat;
  }
  
  // Try to match just a number after colon (Satisfaction:5)
  const colonNumberMatch = header.match(/[:](\d+)$/);
  if (colonNumberMatch && colonNumberMatch[1]) {
    return `1-${colonNumberMatch[1]}` as ScaleFormat;
  }
  
  // Try to match just a number after hyphen (Satisfaction-5)
  const hyphenNumberMatch = header.match(/[-](\d+)$/);
  if (hyphenNumberMatch && hyphenNumberMatch[1]) {
    // Special handling for loyalty scale with -10 suffix
    const maxValue = parseInt(hyphenNumberMatch[1]);
    if (maxValue === 10 && normalizeHeader(header).includes('loy')) {
      // Return null to trigger enhanced detection with actual data
      return null;
    }
    return `1-${hyphenNumberMatch[1]}` as ScaleFormat;
  }
  
  // Special case for NPS (default to 0-10)
  if (normalizeHeader(header) === 'nps') {
    return '0-10';
  }
  
  return null;
};

/**
 * Validates if the extracted scale is allowed
 */
export const validateScale = (scale: string | null, type: 'satisfaction' | 'loyalty'): boolean => {
  if (!scale) return false;
  
  // Valid scales
  const satisfactionScales: ScaleFormat[] = ['1-3', '1-5', '1-7'];
  const loyaltyScales: ScaleFormat[] = ['1-5', '1-7', '1-10', '0-10'];
  
  return type === 'satisfaction' 
    ? satisfactionScales.includes(scale as ScaleFormat)
    : loyaltyScales.includes(scale as ScaleFormat);
};

/**
 * Get default scale based on type
 */
export const getDefaultScale = (type: 'satisfaction' | 'loyalty'): ScaleFormat => {
  return type === 'satisfaction' ? '1-5' : '1-5';
};

/**
 * Enhanced scale detection that analyzes actual data to determine possible scales
 */
export const detectPossibleScales = (
  header: string, 
  columnData: number[]
): ScaleDetectionResult => {
  console.log(`🔍 Detecting scales for header: "${header}"`);
  console.log(`📊 Column data:`, columnData);
  
  // Extract potential max value from header
  const hyphenNumberMatch = header.match(/[-](\d+)$/);
  
  if (!hyphenNumberMatch || columnData.length === 0) {
    console.log(`❌ No header match or empty data`);
    return { 
      definitive: null, 
      possibleScales: [], 
      needsUserInput: false,
      dataRange: { min: 0, max: 0 }
    };
  }
  
  const maxFromHeader = parseInt(hyphenNumberMatch[1]);
  const actualMin = Math.min(...columnData.filter(n => !isNaN(n)));
  const actualMax = Math.max(...columnData.filter(n => !isNaN(n)));
  
  const dataRange = { min: actualMin, max: actualMax };
  
  console.log(`📈 Analysis: header max=${maxFromHeader}, data min=${actualMin}, data max=${actualMax}`);
  
  // Case 1: Data contains 0 → definitely 0-X scale
  if (actualMin === 0) {
    console.log(`✅ Detected 0-${maxFromHeader} scale due to 0 value in data`);
    return { 
      definitive: `0-${maxFromHeader}` as ScaleFormat, 
      possibleScales: [], 
      needsUserInput: false,
      dataRange
    };
  }
  
  // Case 2: Data starts at 1, max matches header → could be either scale
  if (actualMin === 1 && maxFromHeader === 10) {
    return {
      definitive: null,
      possibleScales: [`1-${maxFromHeader}`, `0-${maxFromHeader}`] as ScaleFormat[],
      needsUserInput: true,
      dataRange
    };
  }
  
  // Case 3: Data starts above 1 → probably 1-X but ask to be sure for loyalty
if (actualMin > 1 && maxFromHeader === 10) {
  return {
    definitive: null,
    possibleScales: [`1-${maxFromHeader}`, `0-${maxFromHeader}`] as ScaleFormat[],
    needsUserInput: true,
    dataRange
  };
}
  
  // Default case: use traditional 1-X scale
  return { 
    definitive: `1-${maxFromHeader}` as ScaleFormat, 
    possibleScales: [], 
    needsUserInput: false,
    dataRange
  };
};

/**
 * Process CSV headers to detect and validate scales
 */
export const processHeaders = (headers: string[]): HeaderProcessingResult => {
  const result: HeaderProcessingResult = {
    satisfactionHeader: null,
    loyaltyHeader: null,
    scales: {
      satisfaction: '1-5',
      loyalty: '1-5'
    },
    isValid: true,
    errors: []
  };
  
  // Find satisfaction header
  const satisfactionHeaders = headers.filter(h => isSatisfactionHeader(h));
  if (satisfactionHeaders.length === 0) {
    result.errors.push('Missing satisfaction column (Expected "Satisfaction", "Sat", or "CSAT")');
    result.isValid = false;
  } else if (satisfactionHeaders.length > 1) {
    result.errors.push('Multiple satisfaction columns found. Please include only one.');
    result.isValid = false;
  } else {
    result.satisfactionHeader = satisfactionHeaders[0];
    const scale = extractScaleFromHeader(satisfactionHeaders[0]);
    
    if (scale && validateScale(scale, 'satisfaction')) {
      result.scales.satisfaction = scale;
    } else if (scale) {
      result.errors.push(`Invalid satisfaction scale: ${scale}. Allowed scales are: 1-3, 1-5, 1-7`);
      result.isValid = false;
    } else {
      // If no scale found, use default but add a warning
      result.errors.push(`No scale found in satisfaction header. Using default scale (1-5).`);
      result.scales.satisfaction = getDefaultScale('satisfaction');
    }
  }
  
  // Find loyalty header
  const loyaltyHeaders = headers.filter(h => isLoyaltyHeader(h));
  if (loyaltyHeaders.length === 0) {
    result.errors.push('Missing loyalty column (Expected "Loyalty", "Loy", or "NPS")');
    result.isValid = false;
  } else if (loyaltyHeaders.length > 1) {
    result.errors.push('Multiple loyalty columns found. Please include only one.');
    result.isValid = false;
  } else {
    result.loyaltyHeader = loyaltyHeaders[0];
    const scale = extractScaleFromHeader(loyaltyHeaders[0]);
    
    if (scale && validateScale(scale, 'loyalty')) {
      result.scales.loyalty = scale;
    } else if (scale) {
      result.errors.push(`Invalid loyalty scale: ${scale}. Allowed scales are: 1-5, 1-7, 1-10, 0-10`);
      result.isValid = false;
    } else if (normalizeHeader(loyaltyHeaders[0]) === 'nps') {
      // Special case for NPS
      result.scales.loyalty = '0-10';
    } else {
      // If no scale found, use default but add a warning
      // Don't mark as invalid if this is a Loy-10 header that should trigger enhanced detection
      if (normalizeHeader(loyaltyHeaders[0]).includes('loy') && loyaltyHeaders[0].includes('10')) {
        result.errors.push(`Scale detection deferred for enhanced analysis of "${loyaltyHeaders[0]}" header.`);
        result.scales.loyalty = getDefaultScale('loyalty'); // Temporary default
      } else {
        result.errors.push(`No scale found in loyalty header. Using default scale (1-5).`);
        result.scales.loyalty = getDefaultScale('loyalty');
      }
    }
  }
  
  return result;
};



/**
 * Check if a row appears to be a metadata row (containing REQUIRED/Optional tags)
 */
export const isMetadataRow = (row: Record<string, any>): boolean => {
  const values = Object.values(row)
    .filter(v => v !== null && v !== undefined)
    .map(v => String(v).trim().toUpperCase());
  
  const metadataTerms = ['OPTIONAL', 'REQUIRED'];
  
  // If any value contains metadata terms, it's a metadata row
  return values.some(v => metadataTerms.includes(v));
};

/**
 * Generate a template header row based on specified scales
 */
export const generateTemplateHeader = (
  satisfactionScale: ScaleFormat, 
  loyaltyScale: ScaleFormat
): string => {
  return `ID,Name,Email,Satisfaction:${satisfactionScale},Loyalty:${loyaltyScale},Date,Country,TrueLoyalist,NumPurchases,NumComplaints`;
};

/**
 * Generate metadata row for template
 */
export const generateTemplateMetadata = (): string => {
  return `optional,optional,optional,REQUIRED,REQUIRED,optional,optional,optional,optional,optional`;
};

/**
 * Enhanced header processing with smart scale detection
 */
export const processHeadersWithDataAnalysis = (
  headers: string[], 
  dataRows: any[]
): EnhancedHeaderProcessingResult => {
  // Start with basic header processing
  const basicResult = processHeaders(headers);
  
  const enhancedResult: EnhancedHeaderProcessingResult = {
    ...basicResult,
    scaleDetection: {},
    needsUserConfirmation: false
  };
  
  // Continue with enhanced processing even if basic processing had issues
  // The enhanced analysis can fix scale detection problems
  console.log("Basic processing result:", basicResult);
  
  // Analyze satisfaction column if found
  if (basicResult.satisfactionHeader) {
    const satisfactionData = dataRows
      .map(row => parseFloat(row[basicResult.satisfactionHeader!]))
      .filter(n => !isNaN(n));
    
    const satDetection = detectPossibleScales(basicResult.satisfactionHeader, satisfactionData);
    enhancedResult.scaleDetection!.satisfaction = satDetection;
    
    if (satDetection.needsUserInput) {
      enhancedResult.needsUserConfirmation = true;
    } else if (satDetection.definitive) {
      enhancedResult.scales.satisfaction = satDetection.definitive;
    }
  }
  
  // Analyze loyalty column if found
  if (basicResult.loyaltyHeader) {
    const loyaltyData = dataRows
      .map(row => parseFloat(row[basicResult.loyaltyHeader!]))
      .filter(n => !isNaN(n));
    
    const loyDetection = detectPossibleScales(basicResult.loyaltyHeader, loyaltyData);
    enhancedResult.scaleDetection!.loyalty = loyDetection;
    
    if (loyDetection.needsUserInput) {
      enhancedResult.needsUserConfirmation = true;
    } else if (loyDetection.definitive) {
      enhancedResult.scales.loyalty = loyDetection.definitive;
    }
  }
  
  return enhancedResult;
};

/**
 * Helper function to apply user-confirmed scales
 */
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

/**
 * Get user-friendly description for scale formats
 */
export const getScaleDescription = (scale: ScaleFormat): string => {
  if (scale.startsWith('0-')) return '(NPS-style: 0=lowest)';
  if (scale.startsWith('1-')) return '(Traditional: 1=lowest)';
  return '';
};