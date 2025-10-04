import { DateHandlerResult } from './types';
import { getDaysInMonth, isLeapYear, getFormatSeparator, expandTwoDigitYear } from './helpers';

export const handleDateInput = (
  value: string,
  currentValue: string,
  dateFormat: string
): DateHandlerResult => {
  // Allow backspace/delete
  if (value.length < currentValue.length) {
    return { formattedValue: value, error: '' };
  }

  // Get separator from format and check if user typed any separator
  const formatSeparator = getFormatSeparator(dateFormat);
  const userTypedSeparator = /[/\-\.]/.test(value[value.length - 1]);

  // Clean up the input - prevent multiple separators in a row
  // First normalize all separators to the format separator
  let normalizedValue = value.replace(/[/\-\.]/g, formatSeparator);
  
  // Remove any duplicate separators
  while (normalizedValue.includes(formatSeparator + formatSeparator)) {
    normalizedValue = normalizedValue.replace(formatSeparator + formatSeparator, formatSeparator);
  }

  // Extract the current separator being used in the value
  const currentSeparator = normalizedValue.match(/[/\-\.]/)?.[0] || formatSeparator;

  // First, format the input based on the chosen date format
  let formattedValue = '';
  const numbers = normalizedValue.replace(/\D/g, '');
  
  // Handle different date formats
  if (dateFormat.toLowerCase().startsWith('dd')) {
    // DD/MM/YYYY format
    // Handle day
    if (numbers.length >= 1) {
      if (numbers.length === 1 && !userTypedSeparator) {
        formattedValue = numbers;
      } else {
        // Add separator if user typed one or we have two digits
        formattedValue = numbers.substring(0, 2).padStart(2, '0') + formatSeparator;
      }
    }

    // Handle month
    if (numbers.length > 2) {
      if (numbers.length === 3 && !userTypedSeparator) {
        formattedValue += numbers.substring(2, 3);
      } else {
        formattedValue += numbers.substring(2, 4).padStart(2, '0') + formatSeparator;
      }
    }

    // Handle year
    if (numbers.length > 4) {
      const yearDigits = numbers.substring(4, 8);
      formattedValue += yearDigits;
    }
  } else if (dateFormat.toLowerCase().startsWith('mm')) {
    // MM/DD/YYYY format
    // Handle month
    if (numbers.length >= 1) {
      if (numbers.length === 1 && !userTypedSeparator) {
        formattedValue = numbers;
      } else {
        // Add separator if user typed one or we have two digits
        formattedValue = numbers.substring(0, 2).padStart(2, '0') + formatSeparator;
      }
    }

    // Handle day
    if (numbers.length > 2) {
      if (numbers.length === 3 && !userTypedSeparator) {
        formattedValue += numbers.substring(2, 3);
      } else {
        formattedValue += numbers.substring(2, 4).padStart(2, '0') + formatSeparator;
      }
    }

    // Handle year
    if (numbers.length > 4) {
      const yearDigits = numbers.substring(4, 8);
      formattedValue += yearDigits;
    }
  } else if (dateFormat.toLowerCase().startsWith('yyyy')) {
    // YYYY-MM-DD format
    const parts = normalizedValue.split(currentSeparator);
    
    // Handle year part
    if (parts.length === 1) {
      // Only year part being entered
      const yearPart = numbers.substring(0, 4);
      
      // Automatically add separator after 4 digits
      if (numbers.length === 4) {
        formattedValue = yearPart + formatSeparator;
      } 
      // Handle when user types 1 or 2 digits followed by separator
      else if (numbers.length < 4 && userTypedSeparator) {
        // For 1-2 digits, add 20xx or 19xx prefix based on current year
        const fullYear = expandTwoDigitYear(yearPart);
        formattedValue = fullYear + formatSeparator;
      }
      // Handle when user types 3 digits
      else if (numbers.length === 3) {
        // Just show 3 digits, don't add separator yet
        formattedValue = yearPart;
      }
      // Handle other cases
      else {
        formattedValue = yearPart;
        
        // Add separator if user typed it or we have more digits
        if (userTypedSeparator || numbers.length > 4) {
          // Expand to 4 digits if needed
          if (yearPart.length < 4) {
            const fullYear = expandTwoDigitYear(yearPart);
            formattedValue = fullYear + formatSeparator;
          } else {
            formattedValue = yearPart + formatSeparator;
          }
          
          // Handle month part if present
          if (numbers.length > 4) {
            // Extract just the month digits
            const monthDigits = numbers.substring(4, 6);
            formattedValue += monthDigits;
            
            // Add second separator after complete month
            if (monthDigits.length === 2 || (monthDigits.length === 1 && userTypedSeparator)) {
              formattedValue += formatSeparator;
              
              // Add day part if present
              if (numbers.length > 6) {
                formattedValue += numbers.substring(6, 8);
              }
            }
          }
        }
      }
    } else if (parts.length >= 2) {
      // Year has been completed, now working on month/day
      formattedValue = parts[0] + formatSeparator;
      
      // Handle month part
      if (parts[1].length > 0) {
        const monthDigits = parts[1].replace(/\D/g, '');
        formattedValue += monthDigits;
        
        // Add separator after month if month is complete or user typed separator
        if (parts.length >= 3 || (userTypedSeparator && parts[1] === normalizedValue.split(currentSeparator)[1])) {
          formattedValue += formatSeparator;
          
          // Add day part if present
          if (parts.length >= 3 && parts[2].length > 0) {
            formattedValue += parts[2].replace(/\D/g, '');
          }
        }
      }
    }
  }

  // Handle separator typing
  if (userTypedSeparator) {
    const parts = formattedValue.split(formatSeparator);
    
    // Handle different formats
    if (dateFormat.toLowerCase().startsWith('yyyy')) {
      // YYYY-MM-DD format
      if (parts.length === 1 && parts[0].length > 0) {
        // Add separator after year
        parts[0] = parts[0].padStart(4, '0');
        formattedValue = parts[0] + formatSeparator;
      } else if (parts.length === 2 && parts[1].length > 0) {
        // Add separator after month
        formattedValue = parts[0] + formatSeparator + parts[1] + formatSeparator;
      }
    } else {
      // DD/MM/YYYY or MM/DD/YYYY format
      if (parts.length <= 2) {
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.length === 1) {
          parts[parts.length - 1] = lastPart.padStart(2, '0');
          formattedValue = parts.join(formatSeparator) + formatSeparator;
        }
      }
    }
  }

  // Use formatted value if we generated one, otherwise use normalized value
  const result = formattedValue || normalizedValue;

  // Validate the formatted value
  let error = '';
  const parts = result.split(formatSeparator);
  
  // Different validation based on date format
  if (dateFormat.toLowerCase().startsWith('dd')) {
    // DD/MM/YYYY format
    if (parts[0]?.length === 2) {
      const day = parseInt(parts[0]);
      if (day === 0) {
        error = 'Day must be greater than 0';
      } else if (day > 31) {
        error = 'Day cannot be greater than 31';
      }

      if (!error && parts[1]?.length === 2) {
        const month = parseInt(parts[1]);
        if (month === 0) {
          error = 'Month must be greater than 0';
        } else if (month > 12) {
          error = 'Month cannot be greater than 12';
        } else if (parts[2]?.length >= 4) {
          // If we have a complete year, we can do full date validation
          const year = parseInt(parts[2]);
          const daysInMonth = getDaysInMonth(month, year);
          
          if (day > daysInMonth) {
            if (month === 2 && day === 29) {
              error = `February ${year} is not a leap year and has 28 days`;
            } else {
              error = `${month === 2 ? 'February' : new Date(2020, month - 1, 1).toLocaleString('default', { month: 'long' })} has only ${daysInMonth} days`;
            }
          }
        } else if (parts[1] && month === 2 && day > 29) {
          error = 'February cannot have more than 29 days';
        }
      }
    }
  } else if (dateFormat.toLowerCase().startsWith('mm')) {
    // MM/DD/YYYY format
    if (parts[0]?.length === 2) {
      const month = parseInt(parts[0]);
      if (month === 0) {
        error = 'Month must be greater than 0';
      } else if (month > 12) {
        error = 'Month cannot be greater than 12';
      }

      if (!error && parts[1]?.length === 2) {
        const day = parseInt(parts[1]);
        if (day === 0) {
          error = 'Day must be greater than 0';
        } else if (day > 31) {
          error = 'Day cannot be greater than 31';
        } else if (parts[2]?.length >= 4) {
          // If we have a complete year, we can do full date validation
          const year = parseInt(parts[2]);
          const daysInMonth = getDaysInMonth(month, year);
          
          if (day > daysInMonth) {
            if (month === 2 && day === 29) {
              error = `February ${year} is not a leap year and has 28 days`;
            } else {
              error = `${month === 2 ? 'February' : new Date(2020, month - 1, 1).toLocaleString('default', { month: 'long' })} has only ${daysInMonth} days`;
            }
          }
        } else if (parts[0] && month === 2 && day > 29) {
          error = 'February cannot have more than 29 days';
        }
      }
    }
  } else if (dateFormat.toLowerCase().startsWith('yyyy')) {
    // YYYY-MM-DD format
    if (parts[0]?.length === 4) {
      const year = parseInt(parts[0]);
      
      if (parts[1]?.length === 2) {
        const month = parseInt(parts[1]);
        if (month === 0) {
          error = 'Month must be greater than 0';
        } else if (month > 12) {
          error = 'Month cannot be greater than 12';
        }

        if (!error && parts[2]?.length === 2) {
          const day = parseInt(parts[2]);
          if (day === 0) {
            error = 'Day must be greater than 0';
          } else if (day > 31) {
            error = 'Day cannot be greater than 31';
          } else {
            // Full date validation
            const daysInMonth = getDaysInMonth(month, year);
            
            if (day > daysInMonth) {
              if (month === 2 && day === 29) {
                error = `February ${year} is not a leap year and has 28 days`;
              } else {
                error = `${month === 2 ? 'February' : new Date(2020, month - 1, 1).toLocaleString('default', { month: 'long' })} has only ${daysInMonth} days`;
              }
            }
          }
        }
      }
    }
  }

  return { formattedValue: result, error };
};

export const handleDateBlur = (
  value: string,
  dateFormat: string
): DateHandlerResult => {
  if (!value) return { formattedValue: '', error: '' };

  const separator = getFormatSeparator(dateFormat);
  
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
  const formattedValue = formattedParts.join(separator);
  
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
    
  // Check if date is in the future - flag ANY future date
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
  
  const enteredDate = new Date(yearNum, monthNum - 1, dayNum);
  
  // Flag ANY future date, even if it's just 1 day in the future
  if (enteredDate > currentDate) {
    warning = 'Date is in the future';
  }
  
  // Flag dates more than 2 years in the past
  const currentYear = new Date().getFullYear();
  if (yearNum < currentYear - 2) {
    warning = 'Date is very far in the past (more than 2 years ago)';
  }
  
  if (warning) {
    return { formattedValue, error: '', warning };
  }
  }

  return { formattedValue, error: '' };
};