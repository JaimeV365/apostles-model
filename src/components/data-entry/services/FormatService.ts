import { 
  // getFormatSeparator,
  // handleDateBlur
} from '../utils/date';
  
  export interface DateConversionResult {
    converted: string;
    isValid: boolean;
    error?: string;
  }
  
  // Internal implementation of parseDateString since it's not exported from utils/date
  const parseDateString = (dateStr: string, format: string): { 
    isValid: boolean; 
    error?: string; 
    day?: number; 
    month?: number; 
    year?: number; 
  } => {
    // Normalize separators to '/'
    const normalizedDate = dateStr.replace(/[-.]/, '/');
    const parts = normalizedDate.split('/');
    
    if (parts.length !== 3) {
      return { 
        isValid: false, 
        error: `Date "${dateStr}" does not have three parts (day, month, year)` 
      };
    }
    
    let day, month, year;
    
    // Extract values based on format
    if (format.startsWith('dd')) {
      [day, month, year] = parts.map(p => parseInt(p.trim()));
    } else if (format.startsWith('MM')) {
      [month, day, year] = parts.map(p => parseInt(p.trim()));
    } else if (format.startsWith('yyyy')) {
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
    
    return { isValid: true, day, month, year };
  };
  
  // Internal implementation of formatDate
  const formatDate = (day: number, month: number, year: number, format: string): string => {
    const paddedDay = String(day).padStart(2, '0');
    const paddedMonth = String(month).padStart(2, '0');
    
    if (format.startsWith('dd')) {
      return `${paddedDay}/${paddedMonth}/${year}`;
    } else if (format.startsWith('MM')) {
      return `${paddedMonth}/${paddedDay}/${year}`;
    } else if (format.startsWith('yyyy')) {
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
    
    // Default format
    return `${paddedDay}/${paddedMonth}/${year}`;
  };
  
  export const FormatService = {
    // Convert a date string between different formats
    convertDateFormat: (
      dateStr: string, 
      fromFormat: string, 
      toFormat: string
    ): DateConversionResult => {
      if (!dateStr || dateStr.trim() === '') {
        return { converted: '', isValid: true };
      }
      
      // For identical formats, no conversion needed
      if (fromFormat === toFormat) {
        return { converted: dateStr, isValid: true };
      }
      
      // Validate the date in its current format first
      const parseResult = parseDateString(dateStr, fromFormat);
      
      if (!parseResult.isValid) {
        return {
          converted: dateStr,
          isValid: false,
          error: parseResult.error || 'Invalid date format'
        };
      }
      
      // If valid, convert to the new format using the extracted day, month, year values
      const formattedDate = formatDate(
        parseResult.day!, 
        parseResult.month!, 
        parseResult.year!,
        toFormat
      );
      
      return {
        converted: formattedDate,
        isValid: true
      };
    },
    
    // Get a list of supported date formats
    getSupportedDateFormats: () => {
      return [
        { value: 'dd/MM/yyyy', label: 'dd/mm/yyyy' },
        { value: 'MM/dd/yyyy', label: 'mm/dd/yyyy' },
        { value: 'yyyy-MM-dd', label: 'yyyy-mm-dd' }
      ];
    },
    
    // Format name (capitalize first letter of each word)
    formatName: (name: string): string => {
      if (!name) return '';
      
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  };
  
  export default FormatService;