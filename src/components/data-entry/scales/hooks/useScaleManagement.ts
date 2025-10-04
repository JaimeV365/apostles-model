import { useState } from 'react';
import { ScaleFormat } from '@/types/base';
import { ValidationResult } from '../../types';

interface ScaleState {
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  isLocked: boolean;
}

interface UseScaleManagementProps {
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  isLocked: boolean;
}

export const useScaleManagement = ({
  satisfactionScale: initialSatisfactionScale,
  loyaltyScale: initialLoyaltyScale,
  isLocked: initialIsLocked
}: UseScaleManagementProps) => {
  const [scales, setScales] = useState<ScaleState>({
    satisfactionScale: initialSatisfactionScale,
    loyaltyScale: initialLoyaltyScale,
    isLocked: initialIsLocked
  });

  const updateScale = (
    value: ScaleFormat,
    type: 'satisfaction' | 'loyalty'
  ) => {
    if (scales.isLocked) return;

    setScales(prev => ({
      ...prev,
      [type === 'satisfaction' ? 'satisfactionScale' : 'loyaltyScale']: value
    }));
  };

  const validateScales = (
    satisfaction: number,
    loyalty: number
  ): ValidationResult => {
    const maxSat = parseInt(scales.satisfactionScale.split('-')[1]);
    const maxLoy = parseInt(scales.loyaltyScale.split('-')[1]);

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

  return {
    scales,
    updateScale,
    validateScales
  };
};