import { DateHandlerResult } from './types';
import { isLeapYear, getDaysInMonth, expandTwoDigitYear, getFormatSeparator } from './helpers';

export const handleDateBlur = (
  value: string,
  dateFormat: string
): DateHandlerResult => {
  if (!value) return { formattedValue: '', error: '' };

  const formatSeparator = getFormatSeparator(dateFormat);
  const parts = value.split(/[/\-\.]/);  // Split by any separator
  
  // Handle incomplete date
  if (parts.length < 3 || parts.some(p => !p)) {
    return {
      formattedValue: value,
      error: 'Please enter a complete date'
    };
  }
  
  let day, month, year, yearIndex;
  
  // Extract parts based on format
  if (dateFormat.toLowerCase().startsWith('dd')) {
    // DD/MM/YYYY format
    day = parts[0];
    month = parts[1];
    year = parts[2];
    yearIndex = 2;
  } else if (dateFormat.toLowerCase().startsWith('mm')) {
    // MM/DD/YYYY format
    month = parts[0];
    day = parts[1];
    year = parts[2];
    yearIndex = 2;
  } else if (dateFormat.toLowerCase().startsWith('yyyy')) {
    // YYYY-MM-DD format
    year = parts[0];
    month = parts[1];
    day = parts[2];
    yearIndex = 0;
  } else {
    return { formattedValue: value, error: 'Unknown date format' };
  }
  
  // Ensure all parts are properly formatted
  const formattedParts = [...parts];
  
  // Handle 2-digit years
  if (formattedParts[yearIndex].length === 1 || formattedParts[yearIndex].length === 2) {
    formattedParts[yearIndex] = expandTwoDigitYear(formattedParts[yearIndex]);
  } else if (formattedParts[yearIndex].length === 3) {
    // Invalid year length
    return {
      formattedValue: value,
      error: 'Year must be 2 or 4 digits'
    };
  }
  
  // Ensure month and day are 2 digits
  if (dateFormat.toLowerCase().startsWith('dd')) {
    formattedParts[0] = parts[0].padStart(2, '0'); // day
    formattedParts[1] = parts[1].padStart(2, '0'); // month
  } else if (dateFormat.toLowerCase().startsWith('mm')) {
    formattedParts[0] = parts[0].padStart(2, '0'); // month
    formattedParts[1] = parts[1].padStart(2, '0'); // day
  } else if (dateFormat.toLowerCase().startsWith('yyyy')) {
    formattedParts[1] = parts[1].padStart(2, '0'); // month
    formattedParts[2] = parts[2].padStart(2, '0'); // day
  }
  
  // Build the formatted value
  const formattedValue = formattedParts.join(formatSeparator);
  
  // Final validation check
  const dayNum = parseInt(formattedParts[dateFormat.toLowerCase().startsWith('dd') ? 0 : 
                         dateFormat.toLowerCase().startsWith('mm') ? 1 : 2]);
  const monthNum = parseInt(formattedParts[dateFormat.toLowerCase().startsWith('dd') ? 1 : 
                           dateFormat.toLowerCase().startsWith('mm') ? 0 : 1]);
  const yearNum = parseInt(formattedParts[yearIndex]);
  
  // Check for valid date
  if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
    const daysInMonth = getDaysInMonth(monthNum, yearNum);
    
    if (dayNum > daysInMonth) {
      const monthName = new Date(2020, monthNum - 1, 1).toLocaleString('default', { month: 'long' });
      
      if (monthNum === 2) {
        return {
          formattedValue,
          error: isLeapYear(yearNum) ? 
            'February has 29 days in leap years' : 
            `February ${yearNum} is not a leap year and has 28 days`
        };
      } else {
        return {
          formattedValue,
          error: `${monthName} has only ${daysInMonth} days`
        };
      }
    }
    
    // Add warnings for unusual dates
    let warning = '';
    
    // Check if date is in the future
    const currentDate = new Date();
    const enteredDate = new Date(yearNum, monthNum - 1, dayNum);
    
    if (enteredDate > currentDate) {
      warning = 'Date is in the future';
    }
    
    // Check if year is unusual (too far in past or future)
    const currentYear = new Date().getFullYear();
    if (yearNum < 1900) {
      warning = 'Date is very far in the past';
    } else if (yearNum > currentYear + 10) {
      warning = 'Date is very far in the future';
    }
    
    if (warning) {
      return { formattedValue, error: '', warning };
    }
  }

  return { formattedValue, error: '' };
};