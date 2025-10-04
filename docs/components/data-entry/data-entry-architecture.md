# Data Entry Module - Manual Entry Documentation

## Overview
The Manual Entry component is a core part of the Data Entry module, providing a form interface for users to enter customer satisfaction and loyalty data with robust validation, date handling, and error management.

## Component Architecture

### Directory Structure
```
src/components/data-entry/
├── forms/
│   ├── DataInput.tsx         # Main manual entry form
│   ├── DataInput.css        # Manual entry styles
│   ├── InputField.tsx       # Reusable input component
│   ├── ScaleSelector.tsx    # Scale dropdown component
├── utils/
│   ├── dateInputHandler.ts  # Date validation and formatting
│   ├── dateUtils.ts         # Date utility functions
│   ├── scaleManager.ts      # Scale management utilities
│   ├── storageManager.ts    # Data persistence
│   └── idCounter.ts         # Unique ID generation
├── types/
│   └── index.ts             # Shared type definitions
└── layout/
    ├── CardLayout.tsx       # Card wrapper component
    └── PageLayout.tsx       # Page layout component
```

### Component Hierarchy
```
DataEntryModule
└── CardLayout
    └── DataInput
        ├── InputField (ID)
        ├── InputField (Name)
        ├── InputField (Email)
        ├── ScaleSelector (Satisfaction)
        ├── InputField (Satisfaction Value)
        ├── ScaleSelector (Loyalty)
        ├── InputField (Loyalty Value)
        └── InputField (Date)
```

## Key Components

### InputField
- **Purpose**: Reusable input component with validation and error display
- **Key Features**:
  - Support for text, number, and date inputs
  - Error state styling
  - Dropdown option support
  - Custom validation
  - Blur event handling

### DataInput
- **Purpose**: Main form component for manual data entry
- **Key Features**:
  - Form validation
  - Scale management
  - Date handling
  - Error management
  - Editing support
  - Secret code handling

### ScaleSelector
- **Purpose**: Dropdown for selecting satisfaction/loyalty scales
- **Key Features**:
  - Scale locking
  - Scale range validation
  - Conditional options based on premium status

## Styling Architecture

### CSS Structure
- Component-specific styles (DataInput.css)
- Global theme variables (constants.ts)
- Shared card styles
- Responsive grid layout
- Error state styling

### Key Style Components
```css
.data-input__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  row-gap: 70px;
}

.input-field-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.error-message {
  color: #dc2626;
  font-size: 12px;
  font-weight: bold;
}
```

## Save this file to: `/docs/components/data-entry/architecture.md`