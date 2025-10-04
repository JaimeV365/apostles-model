# Response Concentration Testing Guide

Save this file at: `/docs/testing/response-concentration.md`

## Overview
This guide provides comprehensive testing strategies and examples for the Response Concentration section, including unit tests, integration tests, and end-to-end testing approaches.

## Test File Structure
```
src/
└── components/
    └── reporting/
        └── components/
            └── ResponseConcentration/
                └── __tests__/
                    ├── ResponseConcentrationSection.test.tsx
                    ├── MiniPlot.test.tsx
                    ├── CombinationDial.test.tsx
                    └── ResponseSettings.test.tsx
```

## Test Setup

### Required Dependencies
```json
{
  "@testing-library/react": "^13.0.0",
  "@testing-library/jest-dom": "^5.16.0",
  "@testing-library/user-event": "^14.0.0",
  "jest": "^29.0.0"
}
```

### Common Test Utilities
```typescript
// testUtils.ts
import { render } from '@testing-library/react';

const mockReport = {
  statistics: {
    satisfaction: {
      distribution: { 1: 10, 2: 21, 3: 19, 4: 30, 5: 20 },
      average: 3.29,
      mode: 4,
      max: 5,
      min: 1
    },
    loyalty: {
      distribution: { 1: 7, 2: 18, 3: 7, 4: 16, 5: 7, 6: 17, 7: 7, 8: 7, 9: 7, 10: 7 },
      average: 5.03,
      mode: 2,
      max: 10,
      min: 1
    }
  },
  totalEntries: 100,
  // ... other required properties
};

const mockSettings = {
  miniPlot: {
    useQuadrantColors: true,
    customColors: {}
  },
  list: {
    useColorCoding: true,
    maxItems: 10
  },
  dial: {
    minValue: 0,
    maxValue: 100,
    customColors: {
      satisfaction: '#3a863e',
      loyalty: '#4682b4'
    }
  }
};

const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <>{children}</>
    ),
    ...options
  });
};

export { mockReport, mockSettings, renderWithProviders };
```

## Unit Tests

### Response Concentration Section
```typescript
// ResponseConcentrationSection.test.tsx
import { screen, fireEvent } from '@testing-library/react';
import { ResponseConcentrationSection } from '../index';
import { mockReport, mockSettings, renderWithProviders } from './testUtils';

describe('ResponseConcentrationSection', () => {
  const defaultProps = {
    report: mockReport,
    settings: mockSettings,
    onSettingsChange: jest.fn(),
    isPremium: false
  };

  it('renders main components', () => {
    renderWithProviders(<ResponseConcentrationSection {...defaultProps} />);
    expect(screen.getByText('Response Distribution Map')).toBeInTheDocument();
    expect(screen.getByText('Frequent Responses')).toBeInTheDocument();
    expect(screen.getByText('Response Intensity')).toBeInTheDocument();
  });

  it('shows settings button when premium', () => {
    renderWithProviders(
      <ResponseConcentrationSection {...defaultProps} isPremium={true} />
    );
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });

  it('opens settings panel on button click', () => {
    renderWithProviders(
      <ResponseConcentrationSection {...defaultProps} isPremium={true} />
    );
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByText('Response Concentration Settings')).toBeInTheDocument();
  });
});
```

### MiniPlot Component
```typescript
// MiniPlot.test.tsx
describe('MiniPlot', () => {
  const defaultProps = {
    combinations: mockReport.mostCommonCombos,
    satisfactionScale: '1-5',
    loyaltyScale: '1-10',
    useQuadrantColors: true
  };

  it('renders data points correctly', () => {
    renderWithProviders(<MiniPlot {...defaultProps} />);
    const points = screen.getAllByRole('img');
    expect(points).toHaveLength(defaultProps.combinations.length);
  });

  it('applies custom colors when specified', () => {
    const customColor = '#ff0000';
    renderWithProviders(
      <MiniPlot 
        {...defaultProps}
        useQuadrantColors={false}
        customColors={{ default: customColor }}
      />
    );
    const point = screen.getAllByRole('img')[0];
    expect(point).toHaveStyle({ backgroundColor: customColor });
  });
});
```

### Combination Dial
```typescript
// CombinationDial.test.tsx
describe('CombinationDial', () => {
  const defaultProps = {
    statistics: mockReport.statistics,
    totalEntries: mockReport.totalEntries,
    isPremium: false
  };

  it('renders correct percentages', () => {
    renderWithProviders(<CombinationDial {...defaultProps} />);
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('18%')).toBeInTheDocument();
  });

  it('applies custom colors when premium', () => {
    const customColors = {
      satisfaction: '#ff0000',
      loyalty: '#00ff00'
    };
    renderWithProviders(
      <CombinationDial 
        {...defaultProps}
        isPremium={true}
        customColors={customColors}
      />
    );
    const satisfactionDial = screen.getByTestId('satisfaction-dial');
    expect(satisfactionDial).toHaveStyle({ fill: customColors.satisfaction });
  });
});
```

### Response Settings
```typescript
// ResponseSettings.test.tsx
describe('ResponseSettings', () => {
  const defaultProps = {
    settings: mockSettings,
    onSettingsChange: jest.fn(),
    onClose: jest.fn(),
    isPremium: true
  };

  it('updates settings on input change', () => {
    renderWithProviders(<ResponseSettings {...defaultProps} />);
    
    const maxItemsInput = screen.getByLabelText(/maximum items/i);
    fireEvent.change(maxItemsInput, { target: { value: '15' } });
    
    expect(defaultProps.onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        list: expect.objectContaining({ maxItems: 15 })
      })
    );
  });

  it('closes panel when clicking close button', () => {
    renderWithProviders(<ResponseSettings {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
```

## Integration Tests

### Feature Integration
```typescript
// integration.test.tsx
describe('Response Concentration Integration', () => {
  it('updates visualization when settings change', async () => {
    const { rerender } = renderWithProviders(
      <ResponseConcentration report={mockReport} isPremium={true} />
    );

    // Open settings
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));

    // Change color
    const colorInput = screen.getByLabelText(/custom hex/i);
    fireEvent.change(colorInput, { target: { value: 'ff0000' } });

    // Verify update
    const points = await screen.findAllByRole('img');
    expect(points[0]).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('persists settings between renders', () => {
    const { unmount } = renderWithProviders(
      <ResponseConcentration report={mockReport} isPremium={true} />
    );

    // Change setting
    fireEvent.click(screen.getByLabelText(/use color coding/i));

    // Unmount and remount
    unmount();
    renderWithProviders(
      <ResponseConcentration report={mockReport} isPremium={true} />
    );

    // Verify persistence
    expect(screen.getByLabelText(/use color coding/i)).not.toBeChecked();
  });
});
```

## Performance Tests

### Render Performance
```typescript
// performance.test.tsx
describe('Response Concentration Performance', () => {
  it('renders efficiently with large datasets', () => {
    const start = performance.now();
    renderWithProviders(
      <ResponseConcentration report={largeDatasetMock} />
    );
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it('handles rapid setting changes', () => {
    const { rerender } = renderWithProviders(
      <ResponseConcentration report={mockReport} isPremium={true} />
    );

    const start = performance.now();
    for (let i = 0; i < 10; i++) {
      rerender(
        <ResponseConcentration
          report={mockReport}
          isPremium={true}
          settings={{ ...mockSettings, list: { maxItems: i } }}
        />
      );
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
```

## Visual Regression Tests

### Snapshot Testing
```typescript
// visual.test.tsx
describe('Response Concentration Visual', () => {
  it('matches snapshot for standard view', () => {
    const { container } = renderWithProviders(
      <ResponseConcentration report={mockReport} />
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot for premium view', () => {
    const { container } = renderWithProviders(
      <ResponseConcentration report={mockReport} isPremium={true} />
    );
    expect(container).toMatchSnapshot();
  });
});
```

## Error Handling Tests

### Error Cases
```typescript
// error.test.tsx
describe('Response Concentration Error Handling', () => {
  it('handles invalid settings gracefully', () => {
    const invalidSettings = {
      ...mockSettings,
      dial: { ...mockSettings.dial, minValue: 'invalid' }
    };
    
    renderWithProviders(
      <ResponseConcentration
        report={mockReport}
        settings={invalidSettings as any}
      />
    );
    
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('recovers from storage errors', () => {
    localStorage.setItem('response-concentration-settings', 'invalid-json');
    
    renderWithProviders(
      <ResponseConcentration report={mockReport} />
    );
    
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });
});
```

## Best Practices

### Testing Guidelines
1. Test real user interactions
2. Verify visual and functional requirements
3. Test error cases and edge conditions
4. Check performance with large datasets
5. Verify premium feature access

### Test Organization
1. Group related tests
2. Use descriptive test names
3. Share common setup
4. Clean up after tests
5. Use appropriate matchers

### Coverage Goals
1. 100% of core functionality
2. All user interactions
3. Premium feature transitions
4. Error handling paths
5. Performance thresholds

## Test Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:visual": "jest -u",
    "test:perf": "jest performance.test.tsx"
  }
}
```

## CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```