# Input Field Component Documentation

## Overview
The InputField component is a versatile form input wrapper that provides consistent styling, validation, error display, and dropdown functionality.

## Component Interface

### Props
```typescript
interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  type?: 'text' | 'number' | 'email' | 'date';
  min?: string;
  max?: string;
  label?: string;
  dropdownOptions?: string[];
  onDropdownSelect?: (value: string) => void;
  onBlur?: (value: string) => void;
  forceCloseDropdown?: boolean;
}
```

### Styles
```css
.input-field-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  width: fit-content;
}

.input-field {
  width: 100%;
  height: 42px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 16px;
  font-family: 'Lato', sans-serif;
}

.input-field--error {
  border-color: #dc2626;
}

.error-message {
  position: absolute;
  top: 100%;
  margin-top: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: bold;
  color: #dc2626;
  background-color: #fee2e2;
  border-radius: 4px;
  border: 1px solid #fca5a5;
  z-index: 15;
}
```

## Features

### Input Types
1. Text Input
   - Basic text entry
   - Error state styling
   - Placeholder support

2. Number Input with Dropdown
   - Numeric validation
   - Min/max constraints
   - Dropdown selection
   - Custom options

3. Email Input
   - Optional validation
   - Error messaging
   - Standard formatting

4. Date Input
   - Format validation
   - Auto-formatting
   - Error handling

### Error Handling
```typescript
// Error display
{error && (
  <div className="error-message">
    {error}
  </div>
)}

// Error styling
className={`input-field ${error ? 'input-field--error' : ''}`}
```

### Dropdown Implementation
```typescript
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
```

## Usage Examples

### Basic Text Input
```tsx
<InputField
  type="text"
  placeholder="Full Name"
  value={name}
  onChange={setName}
  error={errors.name}
/>
```

### Number Input with Dropdown
```tsx
<InputField
  type="number"
  placeholder="Satisfaction (1-5)"
  value={satisfaction}
  onChange={setSatisfaction}
  error={errors.satisfaction}
  min="1"
  max="5"
  dropdownOptions={['1', '2', '3', '4', '5']}
/>
```

### Email Input
```tsx
<InputField
  type="text"
  placeholder="Email"
  value={email}
  onChange={setEmail}
  error={errors.email}
/>
```

### Date Input
```tsx
<InputField
  type="text"
  value={date}
  onChange={handleDateChange}
  onBlur={handleDateBlur}
  placeholder={dateFormat.toLowerCase()}
  error={errors.date}
/>
```

## Behavior Specifications

### Focus Management
- Error states preserved on blur
- Dropdown closes on blur
- Value formatting on blur

### Validation Timing
- On change: Format validation
- On blur: Complete validation
- On submit: Full validation

### Error Priority
1. Required field errors
2. Format validation errors
3. Range validation errors
4. Custom validation errors

## Save this file to: `/docs/components/data-entry/input-field.md`