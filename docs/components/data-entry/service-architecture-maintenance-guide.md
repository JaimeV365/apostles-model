# Service Architecture Maintenance and Extension Guide

## Introduction

This guide provides instructions for maintaining and extending the service-oriented architecture in the Data Entry module. It covers key maintenance tasks, common issues, and best practices for extending the system.

## Maintenance Tasks

### Updating Service Implementations

When updating service implementations, follow these guidelines:

1. **Maintain API Contracts**: Ensure public method signatures remain consistent to avoid breaking dependent components.
2. **Update Tests First**: Write tests for new functionality before implementation.
3. **Document Changes**: Update comments and documentation immediately.
4. **Version Tracking**: Add change comments with dates and developer initials.

Example of properly documented service update:

```typescript
// FormatService.ts
/**
 * Returns supported date formats
 * @returns Array of supported date format options
 * @version 1.1 - 2023-03-15: Added yyyy/MM/dd format - JD
 */
getSupportedDateFormats: () => {
  return [
    { value: 'dd/MM/yyyy', label: 'dd/mm/yyyy' },
    { value: 'MM/dd/yyyy', label: 'mm/dd/yyyy' },
    { value: 'yyyy-MM-dd', label: 'yyyy-mm-dd' },
    { value: 'yyyy/MM/dd', label: 'yyyy/mm/dd' }  // Added in v1.1
  ];
}
```

### Adding New Services

To add a new service:

1. **Create Service File**: Create a new file in the `/services` directory.
2. **Follow Naming Convention**: Use the pattern `[ServiceName]Service.ts`.
3. **Implement Standard Interface**: Include proper TypeScript interfaces.
4. **Document Public API**: Add JSDoc comments to all public methods.
5. **Add Service Export**: Export the service in service index file if applicable.

## Extension Patterns

### Adding New Validation Rules

To add a new validation rule:

1. Add a new validation method to `ValidationService`:

```typescript
// ValidationService.ts
validateCustomField: (value: string, options?: CustomOptions): ValidationResult => {
  // Implement validation logic
  return { isValid: true/false, message: 'Error message if invalid' };
}
```

2. Update the `validateForm` method to use the new validation:

```typescript
validateForm: (formState, options) => {
  // Existing validations...
  
  // Add custom validation
  if (formState.customField) {
    const customResult = ValidationService.validateCustomField(
      formState.customField,
      options.customOptions
    );
    if (!customResult.isValid) {
      errors.customField = customResult.message;
      isValid = false;
    }
  }
  
  return { isValid, errors };
}
```

### Adding New Date Formats

To add a new date format:

1. Update the `getSupportedDateFormats` method in `FormatService`:

```typescript
getSupportedDateFormats: () => {
  return [
    // Existing formats...
    { value: 'new-format', label: 'New Format Display' }
  ];
}
```

2. Update the date format conversion logic:

```typescript
convertDateFormat: (dateStr, fromFormat, toFormat) => {
  // Existing format processing...
  
  // Add new format handling
  if (fromFormat === 'new-format' || toFormat === 'new-format') {
    // Implement conversion logic
  }
  
  // Return result
}
```

### Enhancing Duplicate Detection

To add new duplicate detection criteria:

1. Update the `checkForDuplicates` method in `DuplicateCheckService`:

```typescript
checkForDuplicates: (newDataPoint, options) => {
  // Existing duplicate detection...
  
  // Add new matching criteria
  const newFieldMatch = (normalizedExistingNewField === normalizedNewNewField);
  
  // Update return conditions to include new criteria
  const hasAnySubstantiveMatch = hasSubstantiveNameMatch || 
                                hasSubstantiveEmailMatch || 
                                hasSubstantiveNewFieldMatch;
  
  // Update reason detection to include new field
  if (newFieldMatches) {
    reason = 'new field';
  }
  
  // Return result
}
```

## Common Issues and Solutions

### Service Dependency Cycles

**Problem**: Circular dependencies between services.

**Solution**: 
1. Create utility functions shared by both services.
2. Use dependency injection pattern.
3. Restructure services to avoid circular dependencies.

### Performance Issues

**Problem**: Slow validation or duplicate detection with large datasets.

**Solutions**:

1. **Implement Caching**:
   ```typescript
   // Add a simple cache to frequently called methods
   const cache = new Map<string, any>();
   const cacheKey = `${param1}:${param2}`;
   
   if (cache.has(cacheKey)) {
     return cache.get(cacheKey);
   }
   
   // Compute result
   const result = computeExpensiveOperation();
   
   // Cache result
   cache.set(cacheKey, result);
   ```

2. **Optimize Algorithms**:
   - Use early returns for obvious cases
   - Use more efficient data structures
   - Batch processing for large datasets

### Inconsistent Service Usage

**Problem**: Different components use services inconsistently.

**Solution**: Create hooks that enforce consistent service usage:

```typescript
// useValidation.ts
export const useValidation = () => {
  // Standardized validation methods that use ValidationService
  return {
    validateField: (field, value, options) => {
      // Call appropriate ValidationService method based on field
    },
    
    validateForm: (formState, options) => {
      return ValidationService.validateForm(formState, options);
    }
  };
};
```

## Testing Services

### Unit Testing Services

Create comprehensive unit tests for each service:

```typescript
// ValidationService.test.ts
describe('ValidationService', () => {
  describe('validateEmail', () => {
    it('should return valid for empty email (optional)', () => {
      const result = ValidationService.validateEmail('');
      expect(result.isValid).toBe(true);
    });
    
    it('should return invalid for malformed email', () => {
      const result = ValidationService.validateEmail('not-an-email');
      expect(result.isValid).toBe(false);
    });
    
    it('should return valid for correctly formatted email', () => {
      const result = ValidationService.validateEmail('user@example.com');
      expect(result.isValid).toBe(true);
    });
  });
  
  // Additional tests...
});
```

### Integration Testing Services

Test how services work together:

```typescript
// service-integration.test.ts
describe('Service Integration', () => {
  it('should validate and format data correctly', () => {
    // Setup test data
    const formState = { /* test data */ };
    
    // Use multiple services in sequence
    const validationResult = ValidationService.validateForm(formState, {
      context: 'create',
      satisfactionScale: '1-5',
      loyaltyScale: '1-5'
    });
    
    expect(validationResult.isValid).toBe(true);
    
    // Test that validated data works with other services
    const dataPoint = StateManagementService.formStateToDataPoint(formState);
    const duplicateResult = DuplicateCheckService.checkForDuplicates(
      dataPoint, { existingData: [] }
    );
    
    expect(duplicateResult.isDuplicate).toBe(false);
  });
});
```

## Debugging Strategies

### Service Tracing

Add tracing to debug service interactions:

```typescript
// Simple tracing wrapper
const withTracing = (service, methodName) => {
  const originalMethod = service[methodName];
  
  service[methodName] = (...args) => {
    console.log(`TRACE: ${service.constructor.name}.${methodName} called with:`, args);
    
    try {
      const result = originalMethod.apply(service, args);
      console.log(`TRACE: ${service.constructor.name}.${methodName} returned:`, result);
      return result;
    } catch (error) {
      console.error(`ERROR: ${service.constructor.name}.${methodName} threw:`, error);
      throw error;
    }
  };
  
  return service[methodName];
};

// Example usage
withTracing(ValidationService, 'validateEmail');
```

### Service Mocking

For easier debugging, create service mocks:

```typescript
// Mock ValidationService for testing or debugging
const mockValidationService = {
  validateEmail: jest.fn().mockReturnValue({ isValid: true }),
  validateForm: jest.fn().mockReturnValue({ isValid: true, errors: {} })
};

// Use in tests or debugging sessions
jest.mock('../services/ValidationService', () => mockValidationService);
```

## Best Practices

### Service Design Principles

1. **Single Responsibility**: Each service should have a single area of responsibility.
2. **Immutability**: Services should not mutate input parameters.
3. **Pure Functions**: Where possible, service methods should be pure functions.
4. **Error Handling**: Services should return errors rather than throwing exceptions.
5. **Consistency**: Follow consistent patterns across all services.

### Code Organization

Organize service-related code as follows:

```
src/components/data-entry/
├── services/
│   ├── ValidationService.ts
│   ├── FormatService.ts
│   ├── DuplicateCheckService.ts
│   ├── StateManagementService.ts
│   └── index.ts        # Export all services
├── hooks/
│   ├── useValidation.ts
│   ├── useDataFormat.ts
│   ├── useDuplicateCheck.ts
│   └── useStateManagement.ts
└── utils/
    ├── date/           # Utility functions used by services
    ├── formatting/
    └── validation/
```

### Coding Standards

Follow these standards when working with services:

1. **TypeScript Types**: Always define proper interfaces for inputs and outputs.
2. **Error Handling**: Return structured error objects rather than throwing exceptions.
3. **Immutability**: Avoid mutating input parameters.
4. **Documentation**: Document all public methods with JSDoc comments.
5. **Testing**: Maintain high test coverage for all services.

## Service Migration Guide

### From Utility Functions to Services

To migrate from utility functions to services:

1. **Identify Related Functions**: Group related utility functions.
2. **Create Service File**: Create a new service file.
3. **Move Functions**: Move and refactor functions into service methods.
4. **Add TypeScript Interfaces**: Define proper interfaces.
5. **Update Imports**: Update import statements in components.
6. **Create Hook**: Create a hook for component integration.
7. **Deprecate Old Utilities**: Mark old utilities as deprecated.

Example:

```typescript
// Before: Utility function
// utils/validation.js
export const validateEmail = (email) => { /* ... */ };

// After: Service method
// services/ValidationService.ts
export const ValidationService = {
  validateEmail: (email: string): ValidationResult => { /* ... */ }
};

// Hook for component usage
// hooks/useValidation.ts
export const useValidation = () => {
  return {
    validateEmail: ValidationService.validateEmail,
    // Other validations...
  };
};
```

## Conclusion

Maintaining a service-oriented architecture requires consistent application of patterns and principles. By following the guidelines in this document, you can ensure the system remains maintainable, extensible, and robust.

Services should be seen as the domain experts that encapsulate business logic, while UI components focus on presentation and user interaction. This separation allows for easier testing, maintenance, and future enhancements.

Remember the key principles:
- Single Responsibility
- Clear API Contracts
- Proper TypeScript Typing
- Comprehensive Testing
- Consistent Documentation
