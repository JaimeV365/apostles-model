# Component API Documentation Template

## ComponentName

### Import
```typescript
import { ComponentName } from '@/components/path/to/component';
```

### Props Interface
```typescript
interface ComponentNameProps {
  /**
   * Description of prop1
   * @default defaultValue
   */
  prop1: string;

  /**
   * Description of prop2
   * @optional
   */
  prop2?: number;
}
```

### Basic Usage
```tsx
<ComponentName
  prop1="value"
  prop2={42}
/>
```

### Advanced Usage
```tsx
<ComponentName
  prop1="value"
  prop2={42}
  onEvent={(data) => handleData(data)}
>
  {/* Optional children content */}
</ComponentName>