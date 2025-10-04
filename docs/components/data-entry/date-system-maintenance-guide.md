# Date System Maintenance Guide

This document provides guidelines for maintaining and extending the date entry system.

## Directory Structure Review

Before making changes, familiarize yourself with the file structure:

```
src/components/data-entry/
├── forms/
│   ├── DataInput/
│   │   ├── components/
│   │   │   └── DateField.tsx      # Date field component
│   └── InputField.tsx             # Base input component
└── utils/
    └── date/
        ├── index.ts               # Main exports
        ├── dateInputHandler.ts    # Core date handling logic
        ├── blurHandler.ts         # Blur event handling
        ├── helpers.ts             # Helper functions
        ├── types.ts               # Type definitions
        └── formatHandlers/        # Format-specific handlers
            ├── ddmmyyyy.ts        # DD/MM/YYYY format
            ├── mmddyyyy.ts        # MM/DD/YYYY format
            └── yyyymmdd.ts        # YYYY-MM-DD format
```

## Common Maintenance Tasks

### 1. Adding a New Date Format

To add a new date format (e.g., `YYYY/DD/MM`):

1. **Add the format option to the `DATE_FORMATS` array in `DateField.tsx`**:
   ```typescript
   const DATE_FORMATS = [
     { value: 'dd/MM/yyyy', label: 'dd/mm/yyyy' },
     { value: 'MM/dd/yyyy', label: 'mm/dd/yyyy' },
     { value: 'yyyy-MM-dd', label: 'yyyy-mm-dd' },
     { value: 'yyyy/dd/MM', label: 'yyyy/dd/mm' }  // New format
   ];
   ```

2. **Create