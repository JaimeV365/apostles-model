import { ScaleFormat } from '@/types/base';
import { FormState } from '../forms/DataInput/types';
import { handleDateBlur } from '../utils/date';

export type ValidationContext = 'create' | 'edit' | 'import';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface ValidationOptions {
  context: ValidationContext;
  originalId?: string;  // For edit context
  existingIds?: string[];
  satisfactionScale?: ScaleFormat;
  loyaltyScale?: ScaleFormat;
  dateFormat?: string; // Add date format to validation options
}

export const ValidationService = {
  validateId: (id: string, options: ValidationOptions): ValidationResult => {
    // Skip validation if ID is empty (system will generate one)
    if (!id) return { isValid: true };
    
    // Different validation logic based on context
    if (options.context === 'edit' && id === options.originalId) {
      // Allow own ID during editing
      return { isValid: true };
    }
    
    // Check for duplicates against existing IDs
    if (options.existingIds?.includes(id)) {
      return { 
        isValid: false, 
        message: 'This ID already exists' 
      };
    }
    
    return { isValid: true };
  },
  
  validateEmail: (email: string): ValidationResult => {
    // Optional field
    if (!email) return { isValid: true };
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        message: 'Please enter a valid email address'
      };
    }
    
    return { isValid: true };
  },
  
  validateSatisfaction: (value: string, scale: ScaleFormat): ValidationResult => {
    if (!value) {
      return {
        isValid: false,
        message: 'Satisfaction score is required'
      };
    }
    
    const satValue = Number(value);
    const [min, max] = scale.split('-');
    
    if (isNaN(satValue) || satValue < Number(min) || satValue > Number(max)) {
      return {
        isValid: false,
        message: `Value must be between ${min} and ${max}`
      };
    }
    
    return { isValid: true };
  },
  
  validateLoyalty: (value: string, scale: ScaleFormat): ValidationResult => {
    if (!value) {
      return {
        isValid: false,
        message: 'Loyalty score is required'
      };
    }
    
    const loyValue = Number(value);
    const [min, max] = scale.split('-');
    
    if (isNaN(loyValue) || loyValue < Number(min) || loyValue > Number(max)) {
      return {
        isValid: false,
        message: `Value must be between ${min} and ${max}`
      };
    }
    
    return { isValid: true };
  },
  
  validateDate: (date: string, dateFormat: string): ValidationResult => {
    // Date is optional
    if (!date) return { isValid: true };
    
    // Use the existing date validation but with the current format
    const dateResult = handleDateBlur(date, dateFormat);
    
    if (dateResult.error) {
      return {
        isValid: false,
        message: dateResult.error
      };
    }
    
    // Make sure warnings are consistent across all date formats
    // This will check for future dates, past dates, etc.
    let warning = dateResult.warning;
    
    // If no warning was provided but we should have one, add it here
    if (!warning) {
      // Convert the date to a standard format for comparison
      const dateParts = date.split(/[-\/\.]/);
      let day, month, year;
      
      if (dateFormat.startsWith('dd')) {
        [day, month, year] = dateParts;
      } else if (dateFormat.startsWith('MM')) {
        [month, day, year] = dateParts;
      } else if (dateFormat.startsWith('yyyy')) {
        [year, month, day] = dateParts;
      }
      
      if (day && month && year) {
        // Check for future dates
        const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset time for comparison
        
        if (dateObj > currentDate) {
          warning = 'Date is in the future';
        } else if (dateObj.getFullYear() < currentDate.getFullYear() - 2) {
          warning = 'Date is very far in the past (more than 2 years ago)';
        }
      }
    }
    
    return { 
      isValid: true,
      message: warning // Pass warning as a message if exists
    };
  },
  
  validateForm: (
    formState: FormState,
    options: ValidationOptions
  ): { 
    isValid: boolean; 
    errors: Partial<Record<keyof FormState, string>> 
  } => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    let isValid = true;
    
    // ID validation
    const idResult = ValidationService.validateId(formState.id, options);
    if (!idResult.isValid) {
      errors.id = idResult.message;
      isValid = false;
    }
    
    // Email validation
    const emailResult = ValidationService.validateEmail(formState.email);
    if (!emailResult.isValid) {
      errors.email = emailResult.message;
      isValid = false;
    }
    
    // Satisfaction validation
    if (options.satisfactionScale) {
      const satResult = ValidationService.validateSatisfaction(
        formState.satisfaction, 
        options.satisfactionScale
      );
      if (!satResult.isValid) {
        errors.satisfaction = satResult.message;
        isValid = false;
      }
    }
    
    // Loyalty validation
    if (options.loyaltyScale) {
      const loyResult = ValidationService.validateLoyalty(
        formState.loyalty, 
        options.loyaltyScale
      );
      if (!loyResult.isValid) {
        errors.loyalty = loyResult.message;
        isValid = false;
      }
    }
    
    // Date validation if provided
    if (formState.date) {
      // Use the provided dateFormat if available, otherwise use a default
      const dateFormat = options.dateFormat || 'dd/MM/yyyy';
      const dateResult = ValidationService.validateDate(formState.date, dateFormat);
      if (!dateResult.isValid) {
        errors.date = dateResult.message;
        isValid = false;
      }
    }
    
    return { isValid, errors };
  }
};

export default ValidationService;