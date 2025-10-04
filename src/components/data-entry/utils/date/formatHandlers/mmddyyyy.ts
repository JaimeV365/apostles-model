import { DateHandlerResult } from '../types';
import { getDaysInMonth, getFormatSeparator } from '../helpers';

export const handleMMDDYYYYInput = (
  value: string,
  currentValue: string,
  dateFormat: string
): DateHandlerResult => {
  if (value.length < currentValue.length) {
    return { formattedValue: value, error: '' };
  }

  const formatSeparator = getFormatSeparator(dateFormat);
  const userTypedSeparator = /[/\-\.]/.test(value[value.length - 1]);
  const numbers = value.replace(/\D/g, '');
  
  let formattedValue = '';
  let error = '';

  // Handle month
  if (numbers.length >= 1) {
    if (numbers.length === 1 && !userTypedSeparator) {
      formattedValue = numbers;
    } else {
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

  // Validate the formatted value
  const parts = formattedValue.split(formatSeparator);
  
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

  return { formattedValue, error };
};