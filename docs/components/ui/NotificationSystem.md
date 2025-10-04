# NotificationSystem Component

## Overview
The NotificationSystem provides a centralized notification management system with support for different types of notifications and automatic dismissal.

## Interface
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}
```

## Features
- Multiple notification types
- Auto-dismissal
- Custom durations
- Animation support
- Stack management
- Error handling

## Usage Example
```tsx
// Provider setup
<NotificationProvider>
  <App />
</NotificationProvider>

// Using notifications
const { showNotification } = useNotification();

showNotification({
  title: 'Success',
  message: 'Operation completed',
  type: 'success'
});
```

## Styling
```css
.notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

## Duration Management
```typescript
const getDuration = (type: NotificationType): number => {
  switch (type) {
    case 'success': return 5000;
    case 'warning': return 10000;
    case 'error': return 0; // Stays until dismissed
    default: return 8000;
  }
};
```

## Animation States
- Entry animation
- Exit animation
- Hover pause
- Stack shifting

## Accessibility
- ARIA roles
- Focus management
- Screen reader
- Keyboard control

## Best Practices
- Clear messages
- Appropriate timing
- Consistent styling
- Error handling
- Stack management