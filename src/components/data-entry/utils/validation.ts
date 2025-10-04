import { ScaleFormat } from '@/types/base';
import { ValidationResult } from '../types';

export const validateEmail = (email: string): ValidationResult => {
  if (!email) return { isValid: true }; // Optional field
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return {
    isValid: re.test(String(email).toLowerCase()),
    message: 'Please enter a valid email address'
  };
};

export const validateDate = (date: string): ValidationResult => {
  if (!date) return { isValid: true }; // Optional field
  const d = new Date(date);
  return {
    isValid: !isNaN(d.getTime()),
    message: 'Please enter a valid date'
  };
};

export const validateScales = (
  satisfaction: number,
  loyalty: number,
  satisfactionScale: ScaleFormat,
  loyaltyScale: ScaleFormat
): ValidationResult => {
  const maxSat = parseInt(satisfactionScale.split('-')[1]);
  const maxLoy = parseInt(loyaltyScale.split('-')[1]);

  if (satisfaction < 1 || satisfaction > maxSat) {
    return {
      isValid: false,
      message: `Satisfaction must be between 1 and ${maxSat}`
    };
  }

  if (loyalty < 1 || loyalty > maxLoy) {
    return {
      isValid: false,
      message: `Loyalty must be between 1 and ${maxLoy}`
    };
  }

  return { isValid: true };
};