# Types System Quick Reference

## Type Locations

### Core Types
- `@/types/base` - Core application types
- `@/types/historical` - Historical analysis types
- `@/types/shared` - Shared utility types

### Component Types
- `../types` - Component-specific types (relative to component)

## Common Imports

```typescript
// Core types
import { ScaleFormat, DataPoint } from '@/types/base';

// Component types
import { InputFieldProps } from '../types';

// Multiple types
import { 
  DataEntryModuleProps,
  UploadHistoryItem,
  HeaderScales 
} from '../types';
```

## Type Hierarchy

1. Base Types (Most fundamental)
   - ScaleFormat
   - DataPoint
   - Position
   - GridDimensions

2. Component Types (Build on base types)
   - InputFieldProps
   - DataEntryModuleProps
   - ValidationError

## Quick Tips

1. New Types:
   - Global scope → `/src/types/base.ts`
   - Component scope → `/component/types/index.ts`

2. Type Updates:
   - Update definition
   - Update exports
   - Update imports
   - Test compilation

3. Common Issues:
   - "Cannot find module" → Check import path
   - "Not a module" → Add export statement
   - Type conflicts → Check for duplicates

Save this file to: `/docs/quickref/TypeSystem.md`