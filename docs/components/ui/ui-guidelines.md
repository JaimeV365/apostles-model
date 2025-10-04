# User Interface Guidelines

## Design Principles

### 1. Clarity
- Clear visual hierarchy
- Intuitive navigation
- Explicit feedback
- Consistent patterns

### 2. Efficiency
- Minimal clicks
- Quick access to features
- Efficient workflows
- Smart defaults

### 3. Consistency
- Unified color scheme
- Consistent spacing
- Standard patterns
- Predictable behavior

## Color System

### Primary Colors
```css
/* Primary Theme Colors */
--primary: #3b82f6;    /* Blue */
--secondary: #10b981;  /* Green */
--accent: #f59e0b;     /* Amber */
--error: #ef4444;      /* Red */
```

### Semantic Colors
```css
/* Semantic Usage */
--success: #10b981;    /* Success states */
--warning: #f59e0b;    /* Warning states */
--error: #ef4444;      /* Error states */
--info: #3b82f6;       /* Information states */
```

### Neutral Colors
```css
/* Neutral Palette */
--neutral-50: #f8fafc;
--neutral-100: #f1f5f9;
--neutral-200: #e2e8f0;
--neutral-300: #cbd5e1;
--neutral-400: #94a3b8;
--neutral-500: #64748b;
--neutral-600: #475569;
--neutral-700: #334155;
--neutral-800: #1e293b;
--neutral-900: #0f172a;
```

## Typography

### Font Stack
```css
/* Font Families */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Size Scale
```css
/* Type Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
```

## Spacing System

### Base Scale
```css
/* Spacing Scale */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
```

## Component Guidelines

### Buttons
```tsx
// Primary Button
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Primary Action
</button>

// Secondary Button
<button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
  Secondary Action
</button>

// Danger Button
<button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
  Dangerous Action
</button>
```

### Forms
```tsx
// Input Field
<input 
  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
  type="text"
/>

// Select
<select className="w-full px-3 py-2 border rounded appearance-none">
  <option>Option 1</option>
  <option>Option 2</option>
</select>

// Checkbox
<label className="flex items-center gap-2">
  <input type="checkbox" className="w-4 h-4 rounded" />
  <span>Label Text</span>
</label>
```

### Cards
```tsx
// Basic Card
<div className="p-4 bg-white rounded-lg shadow">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-gray-600">Card content goes here</p>
</div>

// Interactive Card
<div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
  <h3 className="text-lg font-semibold mb-2">Interactive Card</h3>
  <p className="text-gray-600">Card content goes here</p>
</div>
```

## Layout Patterns

### Grid System
```tsx
// Basic Grid
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-4">Sidebar</div>
  <div className="col-span-8">Main Content</div>
</div>

// Responsive Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Containers
```tsx
// Main Container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  Content
</div>

// Narrow Container
<div className="max-w-3xl mx-auto px-4">
  Narrow Content
</div>
```

## Interactive States

### Hover States
```css
/* Hover Effects */
.hover\:shadow-lg:hover {
  --tw-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}
```

### Focus States
```css
/* Focus Styles */
.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
}
```

### Active States
```css
/* Active Styles */
.active\:bg-blue-700:active {
  background-color: #1d4ed8;
}
```

## Animation Guidelines

### Transitions
```css
/* Standard Transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150