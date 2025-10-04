import { FormState } from '../types';
import { ScaleFormat } from '@/types/base';
import ValidationService, { ValidationContext } from '../../../services/ValidationService';

export const validateForm = (
  formState: FormState,
  satisfactionScale: ScaleFormat,
  loyaltyScale: ScaleFormat,
  existingIds: string[],
  context: ValidationContext = 'create',
  originalId?: string,
  dateFormat?: string // Add date format parameter
): { isValid: boolean; errors: Partial<Record<keyof FormState, string>> } => {
  
  // Use the ValidationService to validate the entire form
  return ValidationService.validateForm(formState, {
    context,
    originalId,
    existingIds,
    satisfactionScale,
    loyaltyScale,
    dateFormat
  });
};