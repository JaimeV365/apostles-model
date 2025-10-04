import { ScaleFormat } from '@/types/base';

export interface ScaleSelectorProps {
  value: ScaleFormat;
  onChange: (value: ScaleFormat) => void;
  label: string;
  options: ScaleFormat[];
  disabled?: boolean;
  type: 'satisfaction' | 'loyalty';
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}