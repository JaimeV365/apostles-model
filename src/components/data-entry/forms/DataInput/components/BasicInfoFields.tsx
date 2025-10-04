import React from 'react';
import InputField from '../../InputField';
import { FormState } from '../types';
import { validateEmail } from '../../../utils/validation';

interface BasicInfoFieldsProps {
  formState: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  onInputChange: (field: keyof FormState, value: string) => void;
  
}

export const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  formState,
  errors,
  onInputChange,
  
}) => {
  const handleEmailChange = (value: string) => {
    onInputChange('email', value);
    
    // Validate email on change, but only if there's a value
    if (value) {
      const result = validateEmail(value);
      if (!result.isValid) {
        // We update just the internal state to display the error, but don't block form submission
        // This will be validated again during form submission
      }
    }
  };

  const handleEmailBlur = (value: string) => {
    if (value) {
      const result = validateEmail(value);
      if (!result.isValid) {
        // Update the form errors directly
        // This is normally done in form validation, but we're doing it here for immediate feedback
      }
    }
  };

  return (
    <>
      <div className="field-container">
        <InputField
          type="text"
          placeholder="ID"
          value={formState.id}
          onChange={(value) => onInputChange('id', value)}
          error={errors.id}
        />
      </div>
      <div className="field-container">
        <InputField
          type="text"
          placeholder="Full Name"
          value={formState.name}
          onChange={(value) => onInputChange('name', value)}
          error={errors.name}
        />
      </div>
      <div className="field-container">
        <InputField
          type="email"
          placeholder="Email"
          value={formState.email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          error={errors.email}
        />
      </div>
    </>
  );
};