// useDataInput.ts
// This hook connects form components with services

import { useState, useCallback, useEffect } from 'react';
import { DataInputProps, FormState } from '../types';
import ValidationService from '../../../services/ValidationService';
import StateManagementService from '../../../services/StateManagementService';

export const useDataInput = (props: DataInputProps) => {
  // Initialize form state using StateManagementService
  const initialFormState: FormState = StateManagementService.createInitialFormState({
    mode: props.editingData ? 'edit' : 'create',
    editingData: props.editingData
  });

  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  
  // Reset form state when editingData changes
  useEffect(() => {
    if (props.editingData) {
      // Use service to convert data point to form state
      const newFormState = StateManagementService.dataPointToFormState(props.editingData);
      setFormState(newFormState);
      setErrors({}); // Clear errors
    }
  }, [props.editingData]);

  const handleInputChange = useCallback((field: keyof FormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const resetForm = useCallback(() => {
    // Use service to get a clean initial state
    const cleanState = StateManagementService.createInitialFormState({
      mode: 'create'
    });
    setFormState(cleanState);
    setErrors({});
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent, executeSubmit = true) => {
    e.preventDefault();
    
    // Use ValidationService for form validation
    const validationOptions = {
      context: props.editingData ? 'edit' : 'create',
      originalId: props.editingData?.id,
      existingIds: props.existingIds,
      satisfactionScale: props.satisfactionScale,
      loyaltyScale: props.loyaltyScale
    };
    
    const { isValid, errors: validationErrors } = ValidationService.validateForm(
      formState,
      validationOptions
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
        formState.date
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
    resetForm
  };
};

// useDuplicateCheck.ts
// This hook integrates the DuplicateCheckService

import { useState } from 'react';
import { DataPoint } from '@/types/base';
import DuplicateCheckService from '../services/DuplicateCheckService';

export interface DuplicateData {
  existing: DataPoint;
  new: DataPoint;
}

export const useDuplicateCheck = (existingData: DataPoint[]) => {
  const [duplicateData, setDuplicateData] = useState<DuplicateData | null>(null);

  const checkForDuplicates = (newDataPoint: DataPoint, excludedId?: string) => {
    // Use the DuplicateCheckService to check for duplicates
    return DuplicateCheckService.checkForDuplicates(newDataPoint, {
      existingData,
      excludedId
    });
  };

  return {
    duplicateData,
    setDuplicateData,
    checkForDuplicates
  };
};

// useCSVValidation.ts
// This hook manages validation state for CSV imports

import { useState } from 'react';
import { ValidationErrorData, DuplicateReport, DateIssueReport } from '../types';

export const useCSVValidation = () => {
  const [error, setError] = useState<ValidationErrorData | null>(null);
  const [duplicateReport, setDuplicateReport] = useState<DuplicateReport | null>(null);
  const [dateIssuesReport, setDateIssuesReport] = useState<DateIssueReport | null>(null);
  const [dateWarningsReport, setDateWarningsReport] = useState<DateIssueReport | null>(null);
  
  const clearValidationState = () => {
    setError(null);
    setDuplicateReport(null);
    setDateIssuesReport(null);
    setDateWarningsReport(null);
  };

  // This ensures validation states are preserved for re-uploads
  const handleDuplicatesFound = (duplicates: DuplicateReport) => {
    setDuplicateReport(duplicates);
  };

  const handleDateIssues = (issues: DateIssueReport) => {
    setDateIssuesReport(issues);
  };

  const handleDateWarnings = (warnings: DateIssueReport) => {
    setDateWarningsReport(warnings);
  };

  return {
    error,
    setError,
    duplicateReport,
    setDuplicateReport: handleDuplicatesFound,
    dateIssuesReport,
    setDateIssuesReport: handleDateIssues,
    dateWarningsReport,
    setDateWarningsReport: handleDateWarnings,
    clearValidationState
  };
};

// Example component using services through hooks
// DateField.tsx

import React, { useState, useEffect } from 'react';
import InputField from '../../InputField';
import { handleDateInput, handleDateBlur } from '../../../utils/date';
import { DateFieldProps } from '../types';
import FormatService from '../../../services/FormatService';

export const DateField: React.FC<DateFieldProps> = ({
  formState,
  errors,
  onInputChange,
  isLocked,
  hasExistingDates
}) => {
  const [dateFormat, setDateFormat] = useState('dd/MM/yyyy');
  const [internalError, setInternalError] = useState('');
  const [internalWarning, setInternalWarning] = useState('');
  
  // Get supported date formats from FormatService
  const DATE_FORMATS = FormatService.getSupportedDateFormats();

  const handleDateChange = (value: string) => {
    const result = handleDateInput(value, formState.date, dateFormat);
    onInputChange('date', result.formattedValue);
    
    // Set error or warning, but not both
    if (result.error) {
      setInternalError(result.error);
      setInternalWarning('');
    } else {
      setInternalError('');
      setInternalWarning(result.warning || '');
    }
  };

  const handleBlur = (value: string) => {
    const result = handleDateBlur(value, dateFormat);
    onInputChange('date', result.formattedValue);
    
    // Set error or warning, but not both
    if (result.error) {
      setInternalError(result.error);
      setInternalWarning('');
    } else {
      setInternalError('');
      setInternalWarning(result.warning || '');
    }
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value;
    
    // Use FormatService to convert date between formats
    if (formState.date) {
      const result = FormatService.convertDateFormat(formState.date, dateFormat, newFormat);
      
      if (result.isValid) {
        onInputChange('date', result.converted);
      } else {
        // If conversion failed, show error but still change the format
        setInternalError(result.error || 'Failed to convert date format');
      }
    }
    
    // Then update the format
    setDateFormat(newFormat);
  };

  return (
    <div className="date-field">
      <div className="date-input-container">
        <div className="date-input-wrapper">
          <InputField
            type="text"
            placeholder={dateFormat.toLowerCase()}
            value={formState.date}
            onChange={handleDateChange}
            onBlur={handleBlur}
            error={internalError || errors.date}
          />
          {internalWarning && !internalError && (
            <div className="warning-message">
              {internalWarning}
            </div>
          )}
        </div>
        <div className="date-format-container">
          <select
            value={dateFormat}
            onChange={handleFormatChange}
            className="date-format-select"
            disabled={hasExistingDates}
          >
            {DATE_FORMATS.map(format => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
          {hasExistingDates && (
            <div className="validation-message">
              Date format is locked<br />while data with dates exists
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// DataInput component (main form) using multiple services
// This example shows how the main form component integrates with services

import React, { useState, useEffect } from 'react';
import CardLayout from '../../layout/CardLayout';
import { BasicInfoFields } from './components/BasicInfoFields';
import { SatisfactionField } from './components/SatisfactionField';
import { LoyaltyField } from './components/LoyaltyField';
import { DateField } from './components/DateField';
import { FormActions } from './components/FormActions';
import { useDataInput } from './hooks/useDataInput';
import { useDuplicateCheck } from '../../hooks/useDuplicateCheck';
import DuplicateHandler from '../../components/DuplicateHandler';
import type { DataInputProps } from './types';
import type { DataPoint } from '@/types/base';
import StateManagementService from '../../services/StateManagementService';

const DataInput: React.FC<DataInputProps> = (props) => {
  const {
    formState,
    errors,
    handleInputChange,
    handleSubmit: originalSubmit,
    resetForm
  } = useDataInput(props);

  // Cast data to proper type
  const dataPoints = (props.data || []) as DataPoint[];
  const [skipNextDuplicateCheck, setSkipNextDuplicateCheck] = useState(false);
  
  // Use duplicate check service through hook
  const { checkForDuplicates, duplicateData, setDuplicateData } = useDuplicateCheck(dataPoints);
  
  // Use StateManagementService to determine if dates exist
  const hasExistingDates = StateManagementService.shouldLockDateFormat(
    props.data || [], 
    !!props.editingData, 
    props.editingData?.id
  );
  
  // Handle form submission with duplicate check
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // First do standard validation using the existing handleSubmit function
    const validationResult = originalSubmit(e, false);
    
    if (validationResult?.isValid) {
      // Convert form state to data point using StateManagementService
      const newDataPoint = StateManagementService.formStateToDataPoint({
        ...formState,
        // Ensure satisfaction and loyalty are numbers
        satisfaction: formState.satisfaction.toString(),
        loyalty: formState.loyalty.toString()
      });
      
      // Skip duplicate check if editing or if flag is set
      if (props.editingData || skipNextDuplicateCheck) {
        if (skipNextDuplicateCheck) {
          setSkipNextDuplicateCheck(false);
        }
        
        // Submit directly without duplicate check
        props.onSubmit(
          formState.id,
          formState.name,
          formState.email,
          Number(formState.satisfaction),
          Number(formState.loyalty),
          formState.date
        );
        
        if (!props.editingData) {
          resetForm();
        }
        
        return;
      }
      
      // Check for duplicates using service through hook
      const editingId = props.editingData ? props.editingData.id : undefined;
      const { isDuplicate, duplicate } = checkForDuplicates(newDataPoint, editingId);

      if (isDuplicate && duplicate) {
        // Show duplicate handler
        setDuplicateData({
          existing: duplicate,
          new: newDataPoint
        });
      } else {
        // Not a duplicate, submit normally
        props.onSubmit(
          formState.id,
          formState.name,
          formState.email,
          Number(formState.satisfaction),
          Number(formState.loyalty),
          formState.date
        );
        
        if (!props.editingData) {
          resetForm();
        }
      }
    }
  };

  // Handle duplicate resolution actions
  const handleDuplicateSkip = () => {
    setDuplicateData(null);
  };

  const handleDuplicateAdd = () => {
    if (duplicateData) {
      // Submit anyway, bypassing duplicate check
      setSkipNextDuplicateCheck(true);
      props.onSubmit(
        duplicateData.new.id,
        duplicateData.new.name,
        duplicateData.new.email || '',
        duplicateData.new.satisfaction,
        duplicateData.new.loyalty,
        duplicateData.new.date || ''
      );
      setDuplicateData(null);
      
      if (!props.editingData) {
        resetForm();
      }
    }
  };

  const handleDuplicateEdit = () => {
    // Keep the form data but close the modal
    setDuplicateData(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="data-input" noValidate>
        <CardLayout title="Manual Entry">
          <div className="form-instructions">
            Fields marked with <span className="required-field">*</span> are required
          </div>
          
          <div className="data-input__grid">
            <BasicInfoFields
              formState={formState}
              errors={errors}
              onInputChange={handleInputChange}
              onSecretCode={props.onSecretCode}
            />
            <SatisfactionField
              formState={formState}
              errors={errors}
              onInputChange={handleInputChange}
              scale={props.satisfactionScale}
              showScales={props.showScales}
              scalesLocked={props.scalesLocked}
              onScaleUpdate={props.onScaleUpdate}
            />
            <LoyaltyField
              formState={formState}
              errors={errors}
              onInputChange={handleInputChange}
              scale={props.loyaltyScale}
              showScales={props.showScales}
              scalesLocked={props.scalesLocked}
              onScaleUpdate={props.onScaleUpdate}
            />
            <DateField
              formState={formState}
              errors={errors}
              onInputChange={handleInputChange}
              isLocked={props.scalesLocked}
              hasExistingDates={hasExistingDates}
            />
            <FormActions
              isEditing={!!props.editingData}
              onCancel={props.onCancelEdit}
            />
          </div>
        </CardLayout>
      </form>

      {/* Duplicate Handler Dialog */}
      {duplicateData && (
        <DuplicateHandler
          isOpen={!!duplicateData}
          onClose={handleDuplicateSkip}
          existingEntry={duplicateData.existing}
          newEntry={duplicateData.new}
          onSkip={handleDuplicateSkip}
          onAdd={handleDuplicateAdd}
          onEdit={handleDuplicateEdit}
        />
      )}
    </>
  );
};