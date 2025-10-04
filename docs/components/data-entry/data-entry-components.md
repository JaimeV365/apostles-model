# Data Entry Components

## DataInput
Primary component for manual data entry.

### Component Structure
```typescript
interface DataInputProps {
  onSubmit: (data: DataPoint) => void;
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  existingIds: string[];
  editingData?: DataPoint;
  onCancelEdit: () => void;
  scalesLocked: boolean;
  showScales: boolean;
}
```

### Child Components

#### BasicInfoFields
- Purpose: Handles ID, Name, and Email input
- Key Features:
  - Secret code detection
  - Email validation
  - Duplicate ID checking

#### SatisfactionField & LoyaltyField
- Purpose: Manages scale selection and value input
- Features:
  - Scale locking
  - Value validation
  - Dynamic options based on scale

#### DateField
- Purpose: Date input with format selection
- Features:
  - Multiple date formats
  - Format locking
  - Date validation

#### FormActions
- Purpose: Form submission and cancellation
- Features:
  - Submit handling
  - Edit mode
  - Cancel functionality

## Styles Organization
- Component-specific styles in dedicated CSS files
- Shared styles in `styles.css`
- BEM naming convention
- Consistent use of theme variables

Save this file to: `/docs/data-entry/components/README.md`