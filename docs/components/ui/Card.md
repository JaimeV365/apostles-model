# Card Component System

## Overview
The Card component system provides a consistent card-based layout structure with header, content, and title subcomponents.

## Components

### Card
```typescript
interface CardProps {
  children: ReactNode;
  className?: string;
}
```

### CardHeader
```typescript
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}
```

### CardTitle
```typescript
interface CardTitleProps {
  children: ReactNode;
  className?: string;
}
```

### CardContent
```typescript
interface CardContentProps {
  children: ReactNode;
  className?: string;
}
```

## Usage Example
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

## Styling
- Uses Tailwind CSS
- Shadow variants
- Border handling
- Responsive design

## Best Practices
- Content organization
- Spacing consistency
- Header usage
- Nesting rules