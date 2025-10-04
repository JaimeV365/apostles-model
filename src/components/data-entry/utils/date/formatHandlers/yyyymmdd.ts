import { DateHandlerResult } from '../types';
import { getDaysInMonth, getFormatSeparator, expandTwoDigitYear } from '../helpers';

export const handleYYYYMMDDInput = (
  value: string,
  currentValue: string,
  dateFormat: string
): DateHandlerResult => {
  if (value.length < currentValue.length) {
    return { formattedValue: value, error: '' };
  }

  const formatSeparator = getFormatSeparator(dateFormat);
  
  // Detect what has changed since the last value
  const hasNewSeparator = 
    (value.split(/[/\-\.]/).length > currentValue.split(/[/\-\.]/).length) ||
    (value.endsWith(formatSeparator) && !currentValue.endsWith(formatSeparator));
  
  // Split input into parts for analysis
  const parts = value.split(/[/\-\.]/);
  let formattedValue = value;
  let error = '';
  let warning = '';
  
  // Get current year for validation
  const currentYear = new Date().getFullYear();
  
  // CASE 1: User just added a separator after year part (1- or 22- etc.)
  if (hasNewSeparator && parts.length === 2 && parts[1] === '') {
    const yearPart = parts[0];
    
    // Reject separator for 3-digit years
    if (yearPart.length === 3) {
      formattedValue = yearPart; // Remove the separator
      error = 'Year must be 2 or 4 digits';
    }
    // Auto-expand 1-2 digit years
    else if (yearPart.length === 1 || yearPart.length === 2) {
      const fullYear = expandTwoDigitYear(yearPart);
      formattedValue = fullYear + formatSeparator;
      
      // Check for unusual year
      const yearNum = parseInt(fullYear);
      
      if (yearNum < 1900) {
        warning = 'Date is very far in the past';
      } else if (yearNum > currentYear + 10) {
        warning = 'Date is very far in the future';
      }
    }
    // For 4-digit years, add warning for unusual years
    else if (yearPart.length === 4) {
      const yearNum = parseInt(yearPart);
      
      if (yearNum < 1900) {
        warning = 'Date is very far in the past';
      } else if (yearNum > currentYear + 10) {
        warning = 'Date is very far in the future';
      }
    }
  }
  
  // CASE 2: User just added a separator after month part (2001-1-)
  else if (hasNewSeparator && parts.length === 3 && parts[2] === '') {
    // Validate month first
    if (parts[1]) {
      const monthNum = parseInt(parts[1]);
      if (monthNum === 0) {
        error = 'Month must be greater than 0';
      } else if (monthNum > 12) {
        error = 'Month cannot be greater than 12';
      } else {
        // Auto-pad month to 2 digits
        if (parts[1].length === 1) {
          formattedValue = parts[0] + formatSeparator + parts[1].padStart(2, '0') + formatSeparator;
        }
      }
    }
    
    // Also check year for warnings
    if (!error && parts[0]) {
      const yearNum = parseInt(parts[0]);
      
      if (yearNum < 1900) {
        warning = 'Date is very far in the past';
      } else if (yearNum > currentYear + 10) {
        warning = 'Date is very far in the future';
      }
    }
  }
  
  // CASE 3: User is typing normally and has reached 4 digits for year
  else if (parts.length === 1 && parts[0].length === 4 && currentValue.length === 3) {
    // Check year for warnings before adding separator
    const yearNum = parseInt(parts[0]);
    
    if (yearNum < 1900) {
      warning = 'Date is very far in the past';
    } else if (yearNum > currentYear + 10) {
      warning = 'Date is very far in the future';
    }
    
    // Automatically add separator after exactly 4 digits
    formattedValue = parts[0] + formatSeparator;
  }
  
  // CASE 4: User just typed a second digit in the month part
  else if (parts.length === 2 && parts[1].length >= 1) {
    // Validate month immediately
    const monthNum = parseInt(parts[1]);
    if (monthNum === 0) {
      error = 'Month must be greater than 0';
    } else if (monthNum > 12) {
      error = 'Month cannot be greater than 12';
    }
    // If month is valid and has 2 digits, add separator
    else if (parts[1].length === 2 && 
            currentValue.split(/[/\-\.]/)[1]?.length === 1) {
      formattedValue = parts[0] + formatSeparator + parts[1] + formatSeparator;
    }
    
    // Also check year for warnings
    if (parts[0]) {
      const yearNum = parseInt(parts[0]);
      
      if (yearNum < 1900) {
        warning = 'Date is very far in the past';
      } else if (yearNum > currentYear + 10) {
        warning = 'Date is very far in the future';
      }
    }
  }
  
  // CASE 5: User is entering day (check for complete date)
  else if (parts.length === 3 && parts[2].length >= 1) {
    // Validate month and day
    const monthNum = parseInt(parts[1]);
    const dayNum = parseInt(parts[2]);
    const yearNum = parseInt(parts[0]);
    
    // Check month
    if (monthNum === 0) {
      error = 'Month must be greater than 0';
    } else if (monthNum > 12) {
      error = 'Month cannot be greater than 12';
    }
    // Check day
    else if (dayNum === 0) {
      error = 'Day must be greater than 0';
    } else if (dayNum > 31) {
      error = 'Day cannot be greater than 31';
    }
    // Check if day is valid for month
    else if (dayNum > 0 && monthNum > 0 && monthNum <= 12) {
      const daysInMonth = getDaysInMonth(monthNum, yearNum);
      if (dayNum > daysInMonth) {
        const monthName = new Date(2020, monthNum - 1, 1).toLocaleString('default', { month: 'long' });
        if (monthNum === 2) {
          error = getDaysInMonth(2, yearNum) === 29 
            ? 'February has 29 days in leap years' 
            : `February ${yearNum} is not a leap year and has 28 days`;
        } else {
          error = `${monthName} has only ${daysInMonth} days`;
        }
      }
    }
    
    // Also check if date is in future
    if (!error) {
      const currentDate = new Date();
      const enteredDate = new Date(yearNum, monthNum - 1, dayNum);
      
      if (enteredDate > currentDate) {
        warning = 'Date is in the future';
      }
      
      // Also check year
      if (yearNum < 1900) {
        warning = 'Date is very far in the past';
      } else if (yearNum > currentYear + 10) {
        warning = 'Date is very far in the future';
      }
    }
  }
  
  // Validate the result (this is a catch-all check)
  const validationParts = formattedValue.split(/[/\-\.]/);
  
  if (validationParts[0]?.length === 3) {
    error = 'Year must be 2 or 4 digits';
  }
  
  return { formattedValue, error, warning };
};