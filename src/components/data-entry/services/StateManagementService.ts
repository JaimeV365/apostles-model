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