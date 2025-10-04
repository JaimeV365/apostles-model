// ValidationService.ts
// This service centralizes all validation logic

import { ScaleFormat } from '@/types/base';
import { FormState } from '../forms/DataInput/types';

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
    
    return { isValid, errors };
  }
};

export default ValidationService;

// FormatService.ts
// This service handles formatting and conversion operations

import { 
  getFormatSeparator,
  handleDateBlur
} from '../utils/date';

export interface DateConversionResult {
  converted: string;
  isValid: boolean;
  error?: string;
}

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
    
    // Normalize separators to '/'
    const normalizedDate = dateStr.replace(/[-\.]/g, '/');
    const parts = normalizedDate.split('/');
    
    if (parts.length !== 3) {
      return { 
        converted: dateStr, 
        isValid: false, 
        error: 'Invalid date format' 
      };
    }
    
    let day, month, year;
    
    // Extract values based on source format
    if (fromFormat.startsWith('dd')) {
      [day, month, year] = parts.map(p => parseInt(p.trim()));
    } else if (fromFormat.startsWith('MM')) {
      [month, day, year] = parts.map(p => parseInt(p.trim()));
    } else if (fromFormat.startsWith('yyyy')) {
      [year, month, day] = parts.map(p => parseInt(p.trim()));
    } else {
      // Default to dd/mm/yyyy if format is unknown
      [day, month, year] = parts.map(p => parseInt(p.trim()));
    }
    
    // Basic validation
    if (isNaN(day) || day < 1 || day > 31) {
      return { 
        converted: dateStr, 
        isValid: false, 
        error: `Invalid day ${day}` 
      };
    }
    
    if (isNaN(month) || month < 1 || month > 12) {
      return { 
        converted: dateStr, 
        isValid: false, 
        error: `Invalid month ${month}` 
      };
    }
    
    if (isNaN(year)) {
      return { 
        converted: dateStr, 
        isValid: false, 
        error: `Invalid year ${year}` 
      };
    }
    
    // Format according to target format
    const paddedDay = String(day).padStart(2, '0');
    const paddedMonth = String(month).padStart(2, '0');
    
    let formattedDate = '';
    if (toFormat.startsWith('dd')) {
      formattedDate = `${paddedDay}/${paddedMonth}/${year}`;
    } else if (toFormat.startsWith('MM')) {
      formattedDate = `${paddedMonth}/${paddedDay}/${year}`;
    } else if (toFormat.startsWith('yyyy')) {
      formattedDate = `${year}-${paddedMonth}-${paddedDay}`;
    } else {
      // Default to dd/mm/yyyy
      formattedDate = `${paddedDay}/${paddedMonth}/${year}`;
    }
    
    // Replace separators with the ones from the target format
    const targetSeparator = getFormatSeparator(toFormat);
    formattedDate = formattedDate.replace(/[\/\-\.]/g, targetSeparator);
    
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

// DuplicateCheckService.ts
// This service detects potential duplicates in data

import { DataPoint } from '@/types/base';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicate?: DataPoint;
  reason?: string;
}

export interface DuplicateCheckOptions {
  existingData: DataPoint[];
  excludedId?: string; // ID to exclude from comparison (e.g., currently editing)
}

export const DuplicateCheckService = {
  checkForDuplicates: (
    newDataPoint: DataPoint,
    options: DuplicateCheckOptions
  ): DuplicateCheckResult => {
    const { existingData, excludedId } = options;
    
    // Normalize new data point values
    const normalizedNewName = newDataPoint.name?.trim() || '';
    const normalizedNewEmail = newDataPoint.email?.trim().toLowerCase() || '';
    const normalizedNewDate = newDataPoint.date?.trim() || '';
    
    const duplicate = existingData.find(existing => {
      // Skip comparing to self when editing (using ID)
      if (excludedId && existing.id === excludedId) return false;
      
      // Different ID check (if same ID and not excluded, it's a duplicate)
      if (existing.id === newDataPoint.id) return true;
      
      // Normalize existing values
      const normalizedExistingName = existing.name?.trim() || '';
      const normalizedExistingEmail = existing.email?.trim().toLowerCase() || '';
      const normalizedExistingDate = existing.date?.trim() || '';

      // First condition: Satisfaction and loyalty values must match
      const valueMatch = existing.satisfaction === newDataPoint.satisfaction && 
                        existing.loyalty === newDataPoint.loyalty;
      
      if (!valueMatch) return false;  // If values don't match, it's not a duplicate

      // Field matching conditions
      // Name field matching condition
      const nameMatch = (normalizedExistingName === '' && normalizedNewName === '') || 
                       (normalizedExistingName !== '' && normalizedNewName !== '' && 
                        normalizedExistingName === normalizedNewName);
      
      // Email field matching condition
      const emailMatch = (normalizedExistingEmail === '' && normalizedNewEmail === '') || 
                        (normalizedExistingEmail !== '' && normalizedNewEmail !== '' && 
                         normalizedExistingEmail === normalizedNewEmail);
      
      // Date field matching condition
      const dateMatch = (normalizedExistingDate === '' && normalizedNewDate === '') || 
                       (normalizedExistingDate !== '' && normalizedNewDate !== '' && 
                        normalizedExistingDate === normalizedNewDate);
      
      // Check if there's at least one substantive match (non-empty values that match)
      const hasSubstantiveNameMatch = normalizedExistingName !== '' && 
                                     normalizedNewName !== '' && 
                                     normalizedExistingName === normalizedNewName;
                                  
      const hasSubstantiveEmailMatch = normalizedExistingEmail !== '' && 
                                      normalizedNewEmail !== '' && 
                                      normalizedExistingEmail === normalizedNewEmail;
                                  
      const hasSubstantiveDateMatch = normalizedExistingDate !== '' && 
                                     normalizedNewDate !== '' && 
                                     normalizedExistingDate === normalizedNewDate;
      
      const hasAnySubstantiveMatch = hasSubstantiveNameMatch || 
                                    hasSubstantiveEmailMatch || 
                                    hasSubstantiveDateMatch;
      
      // It's a duplicate if there's at least one substantive match AND all fields match our criteria
      return hasAnySubstantiveMatch && nameMatch && emailMatch && dateMatch;
    });

    if (duplicate) {
      let reason = '';
      
      // Find the reason for duplication (which field actually had non-empty matching values)
      const normalizedExistingName = duplicate.name?.trim() || '';
      const normalizedExistingEmail = duplicate.email?.trim().toLowerCase() || '';
      const normalizedExistingDate = duplicate.date?.trim() || '';
      
      if (normalizedExistingEmail !== '' && normalizedNewEmail !== '' && 
          normalizedExistingEmail === normalizedNewEmail) {
        reason = 'email';
      } else if (normalizedExistingName !== '' && normalizedNewName !== '' && 
                normalizedExistingName === normalizedNewName) {
        reason = 'name';
      } else if (normalizedExistingDate !== '' && normalizedNewDate !== '' && 
                normalizedExistingDate === normalizedNewDate) {
        reason = 'date';
      } else if (duplicate.id === newDataPoint.id) {
        reason = 'id';
      } else {
        // Fallback
        reason = 'matching data values'; 
      }
      
      return {
        isDuplicate: true,
        duplicate,
        reason
      };
    }

    return { isDuplicate: false };
  }
};

export default DuplicateCheckService;

// StateManagementService.ts
// This service manages application state and transitions

import { DataPoint, ScaleFormat } from '@/types/base';
import { FormState } from '../forms/DataInput/types';

export type EntryMode = 'create' | 'edit' | 'import';

export interface StateContext {
  mode: EntryMode;
  editingData?: DataPoint | null;
  formState: FormState;
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  shouldLockScales: boolean;
  originalDateFormat?: string;
}

export const StateManagementService = {
  // Create initial form state based on context
  createInitialFormState: (context: Partial<StateContext>): FormState => {
    if (context.mode === 'edit' && context.editingData) {
      // If editing, populate with existing data
      return {
        id: context.editingData.id || '',
        name: context.editingData.name || '',
        email: context.editingData.email || '',
        satisfaction: context.editingData.satisfaction?.toString() || '',
        loyalty: context.editingData.loyalty?.toString() || '',
        date: context.editingData.date || ''
      };
    } else {
      // Default empty state for creation
      return {
        id: '',
        name: '',
        email: '',
        satisfaction: '',
        loyalty: '',
        date: ''
      };
    }
  },
  
  // Determine if scales should be locked
  shouldLockScales: (data: DataPoint[], isEditing: boolean, editingId?: string): boolean => {
    // When editing the only entry, don't lock scales
    if (isEditing && data.length === 1 && data[0].id === editingId) {
      return false;
    }
    
    // Otherwise, lock if there's any data
    return data.length > 0;
  },
  
  // Determine if date format should be locked
  shouldLockDateFormat: (data: DataPoint[], isEditing: boolean, editingId?: string): boolean => {
    // Check if there are dates in the existing data
    const hasOtherDates = data.some(item => {
      // Skip the item being edited
      if (isEditing && item.id === editingId) return false;
      // Check if it has a non-empty date
      return item.date && item.date.trim() !== '';
    });
    
    return hasOtherDates;
  },
  
  // Convert data point to form state
  dataPointToFormState: (dataPoint: DataPoint): FormState => {
    return {
      id: dataPoint.id || '',
      name: dataPoint.name || '',
      email: dataPoint.email || '',
      satisfaction: dataPoint.satisfaction?.toString() || '',
      loyalty: dataPoint.loyalty?.toString() || '',
      date: dataPoint.date || ''
    };
  },
  
  // Convert form state to data point
  formStateToDataPoint: (formState: FormState): DataPoint => {
    return {
      id: formState.id || '',
      name: formState.name,
      email: formState.email || undefined,
      satisfaction: Number(formState.satisfaction),
      loyalty: Number(formState.loyalty),
      date: formState.date || undefined,
      group: 'default', // This will be calculated elsewhere
      excluded: false
    };
  }
};

export default StateManagementService;