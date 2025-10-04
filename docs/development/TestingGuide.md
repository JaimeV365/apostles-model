# Testing Guide

## Overview
This guide outlines the testing strategy and practices for the Apostles Model project.

## Test Structure

### Unit Tests Location
```
src/
├── components/
│   ├── __tests__/
│   │   ├── ComponentName.test.tsx
│   │   └── ...
├── utils/
│   ├── __tests__/
│   │   ├── utilityName.test.ts
│   │   └── ...
```

## Test Categories

### 1. Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName prop={value} />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    const handleChange = jest.fn();
    render(<ComponentName onChange={handleChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleChange).toHaveBeenCalled();
  });
});
```

### 2. Utility Tests
```typescript
describe('utilityName', () => {
  it('processes data correctly', () => {
    const input = { /* test data */ };
    const expected = { /* expected result */ };
    expect(utilityFunction(input)).toEqual(expected);
  });

  it('handles edge cases', () => {
    expect(utilityFunction(null)).toBeNull();
    expect(() => utilityFunction(undefined)).toThrow();
  });
});
```

### 3. Integration Tests
```typescript
describe('Integration', () => {
  it('components work together', () => {
    render(
      <ParentComponent>
        <ChildComponent />
      </ParentComponent>
    );
    // Test interaction between components
  });
});
```

## Test Utilities

### Custom Render
```typescript
const customRender = (ui: React.ReactElement, options = {}) => {
  return render(
    <TestProviders>{ui}</TestProviders>,
    options
  );
};
```

### Mock Functions
```typescript
const mockStorageManager = {
  saveState: jest.fn(),
  loadState: jest.fn(),
  clearState: jest.fn()
};

jest.mock('../utils/storageManager', () => ({
  storageManager: mockStorageManager
}));
```

## Testing Patterns

### 1. Component Testing
- Render testing
- Event handling
- State changes
- Prop validation
- Error states
- Loading states
- Edge cases

### 2. Data Entry Testing
```typescript
describe('DataEntry', () => {
  it('validates input correctly', () => {
    render(<DataInput />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'invalid' } });
    expect(screen.getByText('error message')).toBeInTheDocument();
  });
});
```

### 3. Visualization Testing
```typescript
describe('Visualization', () => {
  it('positions elements correctly', () => {
    const { container } = render(<QuadrantChart data={testData} />);
    const element = container.querySelector('.data-point');
    expect(element).toHaveStyle({
      left: '50%',
      bottom: '50%'
    });
  });
});
```

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Run specific test file
npm test ComponentName.test.tsx

# Run tests with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Coverage Requirements
- Minimum 80% coverage
- Critical paths 100%
- Edge cases covered
- Error paths tested

## Best Practices

### 1. Test Organization
- Clear descriptions
- Logical grouping
- Meaningful names
- Focused tests

### 2. Mocking
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

afterEach(() => {
  jest.resetAllMocks();
});
```

### 3. Async Testing
```typescript
it('handles async operations', async () => {
  render(<AsyncComponent />);
  await waitFor(() => {
    expect(screen.getByText('loaded')).toBeInTheDocument();
  });
});
```

## Testing Checklist
- [ ] Component renders correctly
- [ ] Props are validated
- [ ] Events are handled
- [ ] State updates work
- [ ] Edge cases covered
- [ ] Error handling tested
- [ ] Async operations verified
- [ ] Integration verified

## Performance Testing
- Render timing
- Update efficiency
- Memory usage
- Bundle size

## Accessibility Testing
- ARIA roles
- Keyboard navigation
- Screen reader
- Focus management

## Notes
- Keep tests focused
- Mock external dependencies
- Test edge cases
- Maintain test data
- Document test scenarios