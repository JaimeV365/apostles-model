# Data Entry Types

## Core Types

### DataPoint
```typescript
interface DataPoint {
  id: string;
  name: string;
  email?: string;
  satisfaction: number;
  loyalty: number;
  date?: string;
  group: string;
  excluded?: boolean;
}
```

### Scale Types
```typescript
type ScaleFormat = '1-5' | '1-7' | '1-10';

interface ScaleState {
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  isLocked: boolean;
}
```

### Form Types
```typescript
interface FormState {
  id: string;
  name: string;
  email: string;
  satisfaction: string;
  loyalty: string;
  date: string;
}

interface FormErrors {
  [key: string]: string;
}
```

### Component Props
- DataInputProps
- SatisfactionFieldProps
- LoyaltyFieldProps
- DateFieldProps
- FormActionsProps

### Validation Types
```typescript
interface ValidationResult {
  isValid: boolean;
  message?: string;
}
```

Save this file to: `/docs/data-entry/types/README.md`