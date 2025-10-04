import { ScaleFormat } from '@/types/base';

export interface ScaleValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateScaleTransition = (
  newScale: ScaleFormat,
  currentScale: ScaleFormat,
  existingData: boolean
): ScaleValidationResult => {
  if (existingData) {
    return {
      isValid: false,
      error: 'Cannot change scales while data exists'
    };
  }

  const currentMax = parseInt(currentScale.split('-')[1]);
  const newMax = parseInt(newScale.split('-')[1]);

  if (newMax < currentMax) {
    return {
      isValid: false,
      error: `Cannot transition from scale ${currentScale} to ${newScale}`
    };
  }

  return { isValid: true };
};

export const validateScaleValue = (
  value: number,
  scale: ScaleFormat
): ScaleValidationResult => {
  const [min, max] = scale.split('-').map(Number);

  if (value < min || value > max) {
    return {
      isValid: false,
      error: `Value must be between ${min} and ${max}`
    };
  }

  return { isValid: true };
};