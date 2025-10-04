# Error Handling System Documentation

## Overview
The Data Entry module implements a comprehensive error handling system that manages validation, display, and state management of errors across all input types.

## Error State Management

### Error Structure
```typescript
interface Errors {
  [key: string]: string;  // Field name to error message mapping
}

const [errors, setErrors] = useState<{ [key: string]: string }>({});
```

### Error Updates
```typescript
// Adding errors
setErrors(prev => ({ ...prev, fieldName: errorMessage }));

// Clearing specific errors
setErrors(prev => {
  const { fieldName, ...rest } = prev;
  return rest;
});

// Clearing all errors
setErrors({});
```

## Validation Types

### 1. Email Validation
```typescript
const validateEmail = (email: string) => {
  if (!email) return { isValid: true, message: '' };  // Optional field
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return { 
    isValid: re.test(String(email).toLowerCase()),
    message: 'Please enter a valid email address'
  };
};
```

### 2. Scale Validation
```typescript
// Scale range validation
const maxSat = parseInt(satisfactionScale.split('-')[1]);
const maxLoy = parseInt(loyaltyScale.split('-')[1]);

if (satValue < 1 || satValue > maxSat) {
  newErrors.satisfaction = `Value must be between 1 and ${maxSat}`;
}

if (loyValue < 1 || loyValue > maxLoy) {
  newErrors.loyalty = `Value must be between 1 and ${maxLoy}`;
}
```

### 3. Date Validation
- Format validation
- Range validation
- Completeness validation
- Leap year validation

## Error Display

### Visual Indicators
```css
.input-field--error {
  border-color: #dc2626;
}

.error-message {
  color: #dc2626;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
}
```

### Error Message Positioning
```css
.error-message {
  position: absolute;
  top: 100%;
  margin-top: 4px;
  z-index: 15;
  width: 100%;
}
```

## Validation Timing

### Real-time Validation
- Date format as you type
- Scale range on input
- Email format on change

### Blur Validation
- Date completeness
- Year auto-completion
- Format normalization

### Submit Validation
- All fields validated
- Cross-field validation
- Scale compatibility

## Error Recovery

### User Actions
1. Clear invalid input
2. Enter correct format
3. Select from valid options
4. Cancel edit mode

### System Actions
1. Preserve valid parts
2. Auto-format where possible
3. Clear related errors
4. Restore previous state

## Example Implementation

### Form Submission
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const newErrors: { [key: string]: string } = {};

  //