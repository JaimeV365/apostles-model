# DataInput Component

## Overview
The DataInput component handles manual data entry for the Apostles Model, providing form controls for individual data point entry and editing.

## Features
- Manual data entry
- Data validation
- Scale management
- Error handling
- Edit functionality
- Secret code support
- Form controls
- Field validation

## Interface
```typescript
interface DataInputProps {
  /** Data submission handler */
  onSubmit: (id: string, name: string, satisfaction: number, loyalty: number) => void;
  
  /** Current satisfaction scale */
  satisfactionScale: ScaleFormat;
  
  /** Current loyalty scale */
  loyaltyScale: ScaleFormat;
  
  /** Existing IDs for validation */
  existingIds: string[];
  
  /** Data being edited */
  editingData: { 
    id: string; 
    name: string; 
    satisfaction: number; 
    loyalty: number; 
  } | null;
  
  /** Edit cancel handler */
  onCancelEdit: () => void;
  
  /** Scale lock status */
  scalesLocked: boolean;
  
  /** Show scale controls */
  showScales: boolean;
  
  /** Scale lock reason */
  lockReason?: string;
  
  /** Secret code handler */
  onSecretCode?: (code: string) => void;
}
```

## Usage Example
```tsx
<DataInput
  onSubmit={handleSubmit}
  satisfactionScale="1-5"
  loyaltyScale="1-5"
  existingIds={currentIds}
  editingData={null}
  onCancelEdit={handleCancel}
  scalesLocked={hasData}
  showScales={true}
/>
```

## Form Validation

### Validation Rules
```typescript
interface ValidationRules {
  id: {
    unique: boolean;
    format: RegExp;
  };
  name: {
    required: boolean;
    email?: boolean;
  };
  satisfaction: {
    min: number;
    max: number;
  };
  loyalty: {
    min: number;
    max: number;
  };
}
```

### Error Handling
```typescript
interface ValidationErrors {
  id?: string;
  name?: string;
  satisfaction?: string;
  loyalty?: string;
}
```

## Secret Code Handling
```typescript
const isSecretCode = (value: string): boolean => {
  return value.startsWith('XP-') || value.startsWith('TM-');
};
```

## Form State Management
- Field values
- Error states
- Edit mode
- Scale locking
- Form reset

## Accessibility
- ARIA labels
- Error messages
- Focus management
- Keyboard navigation

## Layout
```css
.data-input__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.data-input__button-container {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
```

## Related Components
- InputField
- ScaleSelector
- CardLayout
- NotificationSystem

## Notes
- Scale validation
- ID uniqueness
- Email validation
- Name formatting
- Field constraints