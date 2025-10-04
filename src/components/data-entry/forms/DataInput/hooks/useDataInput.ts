import { useState, useCallback, useEffect } from 'react';
import { DataInputProps, FormState } from '../types';
import { validateForm } from './useFormValidation';
// import StateManagementService from '../../../services/StateManagementService';

export const useDataInput = (props: DataInputProps) => {
  // Get initial form state directly to avoid type issues
  const initialFormState: FormState = {
    id: props.editingData?.id || '',
    name: props.editingData?.name || '',
    email: props.editingData?.email || '',
    satisfaction: props.editingData?.satisfaction?.toString() || '',
    loyalty: props.editingData?.loyalty?.toString() || '',
    date: props.editingData?.date || '',
    dateFormat: props.editingData?.dateFormat || 'dd/MM/yyyy' // Include dateFormat
  };

  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [dateFormat, setDateFormat] = useState<string>(formState.dateFormat || 'dd/MM/yyyy');
  
  // Reset form state when editingData changes
  useEffect(() => {
    if (props.editingData) {
      console.log("Editing data changed, updating form state:", props.editingData);
      // Create form state directly to avoid type issues
      setFormState({
        id: props.editingData.id || '',
        name: props.editingData.name || '',
        email: props.editingData.email || '',
        satisfaction: props.editingData.satisfaction?.toString() || '',
        loyalty: props.editingData.loyalty?.toString() || '',
        date: props.editingData.date || '',
        dateFormat: props.editingData.dateFormat || dateFormat // Use existing format or default
      });
      
      // Also update our dateFormat state if the editing data contains dateFormat
      if (props.editingData.dateFormat) {
        console.log(`Updating dateFormat from ${dateFormat} to ${props.editingData.dateFormat}`);
        setDateFormat(props.editingData.dateFormat);
      }
      
      setErrors({}); // Clear errors
    }
  }, [props.editingData, dateFormat]);

  const handleInputChange = useCallback((field: keyof FormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    
    // Update dateFormat state if that's what changed
    if (field === 'dateFormat') {
      console.log(`handleInputChange: dateFormat changed to ${value}`);
      setDateFormat(value);
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormState({
      id: '',
      name: '',
      email: '',
      satisfaction: '',
      loyalty: '',
      date: '',
      dateFormat: 'dd/MM/yyyy' // Reset to default format
    });
    setErrors({});
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent, executeSubmit = true) => {
    e.preventDefault();
    
    // Determine the validation context
    const context = props.editingData ? 'edit' : 'create';
    const originalId = props.editingData?.id;
    
    const { isValid, errors: validationErrors } = validateForm(
      formState,
      props.satisfactionScale,
      props.loyaltyScale,
      props.existingIds,
      context,
      originalId,
      formState.dateFormat // Pass the current date format to validation
    );
    
    if (!isValid) {
      setErrors(validationErrors);
      return { isValid: false };
    }

    if (executeSubmit) {
      props.onSubmit(
        formState.id,
        formState.name,
        formState.email,
        Number(formState.satisfaction),
        Number(formState.loyalty),
        formState.date,
        formState.dateFormat || 'dd/MM/yyyy' // Pass date format to the submission handler
      );
      
      // Only reset the form if this wasn't an edit operation
      if (!props.editingData) {
        resetForm();
      }
      
      props.onDataSubmitted?.();
    }
    
    return { isValid: true };
  }, [formState, props, resetForm]);

  return {
    formState,
    errors,
    handleInputChange,
    handleSubmit,
    resetForm,
    setDateFormat
  };
};