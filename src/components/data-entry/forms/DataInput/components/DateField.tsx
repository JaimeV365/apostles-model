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
  hasExistingDates,
  onDateFormatChange
}) => {
  // Use dateFormat from formState if available, otherwise default to dd/MM/yyyy
  const [dateFormat, setDateFormat] = useState(formState.dateFormat || 'dd/MM/yyyy');
  const [internalError, setInternalError] = useState('');
  const [internalWarning, setInternalWarning] = useState('');
  
  // Get supported date formats from service
  const DATE_FORMATS = FormatService.getSupportedDateFormats();

  // When formState.dateFormat changes, update the dateFormat state
  useEffect(() => {
    if (formState.dateFormat && formState.dateFormat !== dateFormat) {
      console.log(`DateField: Updating format from ${dateFormat} to ${formState.dateFormat}`);
      setDateFormat(formState.dateFormat);
      // Also notify parent component
      onDateFormatChange?.(formState.dateFormat);
    }
  }, [formState.dateFormat, dateFormat, onDateFormatChange]);

  // Initial notification to parent about date format
  useEffect(() => {
    // When the component mounts, notify parent about the initial date format
    onDateFormatChange?.(dateFormat);
  }, [dateFormat, onDateFormatChange]);

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
    
    // First convert any existing date to the new format
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
    
    // Also update the dateFormat in the form state
    onInputChange('dateFormat', newFormat);
    
    // Notify parent component about the format change
    onDateFormatChange?.(newFormat);
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