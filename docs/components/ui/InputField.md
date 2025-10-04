# InputField Component

## Overview
The InputField component provides a standardized input control with support for various types, validation, and dropdown functionality.

## Interface
```typescript
interface InputFieldProps {
  /** Current input value */
  value: string;
  
  /** Value change handler */
  onChange: (value: string) => void;
  
  /** Input placeholder */
  placeholder: string;
  
  /** Error message */
  error?: string;
  
  /** Input type */
  type?: 'text' | 'number';
  
  /** Minimum value for number inputs */
  min?: number;
  
  /** Maximum value for number inputs */
  max?: number;
  
  /** Dropdown options */
  dropdownOptions?: string[];
  
  /** Dropdown selection handler */
  onDropdownSelect?: (value: string) => void;
  
  /** Force dropdown close */
  forceCloseDropdown?: boolean;
}
```

## Features
- Text/number input
- Dropdown support
- Error handling
- Validation
- Custom styling
- Accessibility

## Usage Examples

### Basic Text Input
```tsx
<InputField
  value={text}
  onChange={setText}
  placeholder="Enter text"
/>
```

### Number Input with Range
```tsx
<InputField
  type="number"
  value={number}
  onChange={setNumber}
  min={1}
  max={5}
  placeholder="Enter number"
/>
```

### With Dropdown
```tsx
<InputField
  value={selected}
  onChange={setSelected}
  dropdownOptions={options}
  onDropdownSelect={handleSelect}
/>
```

## Validation
- Range checking
- Required fields
- Custom validation
- Error display

## Styling
```typescript
const INPUT_STYLES = {
  container: {
    position: 'relative',
    width: '100%'
  },
  
  field: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  
  error: {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '4px'
  }
};
```

## Behavior
- Focus handling
- Blur events
- Error states
- Dropdown toggle
- Clear functionality

## Accessibility
- ARIA labels
- Error announcements
- Keyboard navigation
- Focus management

## Event Handling
```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  onChange(e.target.value);
};

const handleDropdownSelect = (value: string) => {
  onChange(value);
  onDropdownSelect?.(value);
};
```

## Edge Cases
- Empty values
- Invalid inputs
- Boundary values
- Long content

## Performance
- Controlled updates
- Debouncing
- Event optimization
- Render efficiency

## Related Components
- Form components
- Validation system
- Error display
- Dropdown menu