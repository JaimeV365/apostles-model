import React from 'react';

// Add the required prop to this interface
interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  type?: 'text' | 'number' | 'email' | 'date';
  min?: string;
  max?: string;
  dropdownOptions?: string[];
  onDropdownSelect?: (value: string) => void;
  onBlur?: (value: string) => void;
  required?: boolean;
}

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