# Apostles Model Brand Style Guide

## Colors

### Primary Colors
- Primary Green: #3a863e (Logo Green)
  - Used for: Primary buttons, success states, active states
- Secondary Green: #3a8540 (Logo Secondary Green)
  - Used for: Links, icons, accents
- Dark Grey: #333333 (Logo Dark Grey)
  - Used for: Primary text, headers

### Extended Color Palette
- Light Green: #4CAF50 
  - Used for: Apostles zone, success indicators
- Red: #dc2626 
  - Used for: Terrorists zone, error states
- Yellow: #F7B731 
  - Used for: Mercenaries zone, warning states
- Blue: #4682B4 
  - Used for: Hostages zone

### UI States
- Disabled: rgba(0, 0, 0, 0.38)
  - Used for: Disabled controls, premium feature indicators
- Hover: Darken base color by 10%
- Active: Darken base color by 15%
- Premium Lock Overlay: rgba(0, 0, 0, 0.5)

### Zone Colors
- Apostles Zone: rgba(76, 175, 80, 0.4)
- Terrorists Zone: rgba(244, 67, 54, 0.4)
- Near-apostles: rgba(76, 175, 80, 0.2)
- Zone Borders: Same as fill but opacity 0.5

## Typography

### Primary Font
```css
font-family: 'Lato', sans-serif;
```

#### Text Sizes
- H1: 24px (font-weight: 700)
- H2: 20px (font-weight: 600)
- H3: 16px (font-weight: 600)
- Body: 14px (font-weight: 400)
- Small: 12px (font-weight: 400)

#### Text Colors
- Primary Text: #333333
- Secondary Text: #6b7280
- Disabled Text: rgba(0, 0, 0, 0.38)

### Brand Font (Logo Only)
```css
font-family: 'Montserrat', sans-serif;
font-family: 'Jaro', sans-serif;
```

## Components

### Buttons
```css
/* Primary Button */
.button-primary {
  background-color: #3a863e;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
}

/* Secondary Button */
.button-secondary {
  background-color: white;
  color: #3a863e;
  border: 1px solid #3a863e;
  padding: 8px 16px;
  border-radius: 4px;
}

/* Disabled State */
.button-disabled {
  background-color: rgba(0, 0, 0, 0.12);
  color: rgba(0, 0, 0, 0.38);
}
```

### Premium Features
```css
/* Premium Feature Container */
.premium-feature {
  position: relative;
  opacity: 0.7;
}

/* Premium Lock Icon */
.premium-lock {
  position: absolute;
  top: 4px;
  right: 4px;
  color: #333333;
  font-size: 12px;
}
```

### Form Elements
```css
/* Input Fields */
.input-field {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
}

/* Dropdown */
.dropdown {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 8px 12px;
  background-color: white;
}
```

### Cards
```css
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
}
```

## Layout

### Spacing
```css
/* Standard Spacing Scale */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
```

### Grid
```css
/* Grid Container */
.grid-container {
  padding: 20px 40px;
}

/* Component Spacing */
.component-spacing {
  margin-bottom: 24px;
}
```

### Responsive Breakpoints
```css
/* Breakpoints */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

## Animation

### Transitions
```css
/* Standard Transitions */
--transition-standard: all 0.2s ease;
--transition-slow: all 0.3s ease;

/* Premium Feature Preview */
.premium-preview {
  animation: fadeOut 2s ease;
}
```

## Usage Guidelines

### Premium Features
1. Premium features should:
   - Show a lock icon
   - Have reduced opacity
   - Provide brief preview functionality
   - Show upgrade prompt after preview

### Accessibility
1. Color Contrast
   - Text on light backgrounds: #333333
   - Text on dark backgrounds: #FFFFFF
   - Interactive elements: Must meet WCAG 2.1 AA standards

2. Focus States
   - Visible focus ring
   - Consistent across components
   - High contrast with background

### Responsive Design
1. Mobile First
   - Stack controls vertically
   - Adjust padding and margins
   - Maintain touch target sizes

2. Desktop Enhancements
   - Use horizontal layouts
   - Show additional controls
   - Enable hover states