# Types System Architecture

## Overview
The Apostles Model application uses a hybrid type system that combines centralized core types with component-specific type definitions.

## Directory Structure
```
src/
├── types/                    # Application-wide types
│   ├── base.ts              # Core shared types
│   ├── historical.ts        # Historical analysis types
│   ├── index.ts             # Type exports
│   └── shared.ts            # Shared utility types
└── components/
    └── data-entry/          # Example component
        └── types/
            ├── index.ts     # Component-specific types
            └── storage.ts   # Storage-related types
```

## Type Organization

### Core Types (`/src/types/base.ts`)
- Contains fundamental types used across the application
- Includes `ScaleFormat`, `DataPoint`, and grid-related interfaces
- Should be imported using the `@/types/base` alias
- Example import: `import { ScaleFormat, DataPoint } from '@/types/base';`

### Component Types (`/src/components/[component]/types/`)
- Contains types specific to component functionality
- Imports core types from base.ts
- Exports component-specific interfaces
- Example: `/src/components/data-entry/types/index.ts`

## Import Patterns

### Correct Import Paths
```typescript
// For core types
import { ScaleFormat, DataPoint } from '@/types/base';

// For component types
import { InputFieldProps } from '../types';
```

### Type Dependencies
- Component types can depend on core types
- Core types should not depend on component types
- Component types should not depend on other component types

## Maintenance Guidelines

### Adding New Types
1. Determine scope:
   - Application-wide: Add to `/src/types/base.ts`
   - Component-specific: Add to component's types folder

2. Export pattern:
   - Core types: Add to `/src/types/index.ts`
   - Component types: Add to component's `types/index.ts`

### Modifying Existing Types
1. Impact assessment:
   - Check for type dependencies
   - Review component usage
   - Consider backwards compatibility

2. Update process:
   - Update type definition
   - Update dependent components
   - Update related documentation

### Component Type Creation
1. Create types directory:
```bash
mkdir src/components/[component]/types
```

2. Create index.ts:
```typescript
import { CoreType } from '@/types/base';

export interface ComponentType {
  // Type definition
}
```

## Best Practices

### Type Definition
- Use interfaces for objects
- Use type aliases for unions/primitives
- Include JSDoc comments
- Keep types focused and specific

### Import Management
- Use absolute imports for core types
- Use relative imports for component types
- Avoid circular dependencies
- Export all types through index files

### Documentation
- Document type purpose
- Include usage examples
- Note any constraints
- Keep documentation updated

## Examples

### Core Type Definition
```typescript
// /src/types/base.ts
export interface DataPoint {
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

### Component Type Definition
```typescript
// /src/components/data-entry/types/index.ts
import { ScaleFormat, DataPoint } from '@/types/base';

export interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  // Additional props...
}
```

Save this file to: `/docs/architecture/TypeSystem.md`