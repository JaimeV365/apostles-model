import React from 'react';
import { InputFieldProps } from '../types';

const InputField: React.FC<InputFieldProps> = ({
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
  min,
  max,
  dropdownOptions,
  onDropdownSelect,
  onBlur,
  required = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  if (type === 'number' && dropdownOptions) {
    return (
      <div className="input-field-container">
        <select
          value={value || ''}
          onChange={(e) => {
            onChange(e.target.value);
            onDropdownSelect?.(e.target.value);
          }}
          className={`input-field ${error ? 'input-field--error' : ''}`}
          required={required}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {dropdownOptions.map((option: string) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <div className="error-message">{error}</div>}
      </div>
    );
  }

  return (
    <div className="input-field-container">
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={() => onBlur?.(value)}
        placeholder={placeholder}
        className={`input-field ${error ? 'input-field--error' : ''}`}
        min={min}
        max={max}
        required={required}
      />
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default InputField;