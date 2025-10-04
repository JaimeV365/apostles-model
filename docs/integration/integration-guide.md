# Response Concentration Integration Guide

Save this file at: `/docs/integration/response-concentration.md`

## Overview
This guide explains how to integrate and use the Response Concentration section in the Apostles Model application, including setup, configuration, and best practices.

## Basic Integration

### Required Imports
```typescript
import { ResponseConcentrationSection } from '@/components/reporting/components/ResponseConcentration';
import type { ResponseConcentrationSettings } from '@/components/reporting/types';
```

### Minimal Setup
```typescript
function DataReport() {
  const [settings, setSettings] = useState<ResponseConcentrationSettings>(DEFAULT_SETTINGS);

  return (
    <ResponseConcentrationSection
      report={report}
      settings={settings}
      onSettingsChange={setSettings}
      isPremium={isPremium}
    />
  );
}
```

## Component Integration

### In DataReport Component
```typescript
// DataReport/index.tsx
import React, { useState } from 'react';
import ResponseConcentrationSection from '../ResponseConcentrationSection';
import { DEFAULT_SETTINGS } from '../ResponseSettings/types';

export const DataReport: React.FC<DataReportProps> = ({
  report,
  isPremium
}) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  return (
    <div className="report-section">
      <ResponseConcentrationSection
        report={report}
        settings={settings}
        onSettingsChange={setSettings}
        isPremium={isPremium}
      />
    </div>
  );
};
```

### Settings Management
```typescript
// Settings persistence
useEffect(() => {
  if (settings) {
    localStorage.setItem('response-concentration-settings', 
      JSON.stringify(settings)
    );
  }
}, [settings]);

// Settings recovery
useEffect(() => {
  const savedSettings = localStorage.getItem('response-concentration-settings');
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
    } catch (e) {
      console.error('Error loading settings:', e);
      setSettings(DEFAULT_SETTINGS);
    }
  }
}, []);
```

## Premium Feature Integration

### Premium Check Component
```typescript
const PremiumFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isPremium = useIsPremium();  // Your premium check hook
  
  if (!isPremium) {
    return (
      <div className="premium-locked">
        <Lock size={16} />
        {children}
      </div>
    );
  }
  
  return <>{children}</>;
};
```

### Premium Feature Usage
```typescript
<PremiumFeature>
  <button
    className="settings-button"
    onClick={() => setShowSettings(true)}
  >
    <Settings size={20} />
  </button>
</PremiumFeature>
```

## Styling Integration

### Required CSS Imports
```typescript
import '@/components/reporting/components/ResponseConcentration/styles.css';
```

### Style Customization
```css
/* Override default styles */
.response-concentration-grid {
  /* Your custom styles */
}

.settings-button {
  /* Your custom styles */
}
```

## Event Handling

### Settings Changes
```typescript
const handleSettingsChange = (newSettings: ResponseConcentrationSettings) => {
  setSettings(newSettings);
  // Additional handling if needed
  onSettingsUpdate?.(newSettings);
};
```

### Premium Events
```typescript
const handlePremiumFeature = () => {
  if (!isPremium) {
    showPremiumUpgradePrompt();
    return;
  }
  
  // Handle premium feature
};
```

## Data Integration

### Data Preparation
```typescript
const prepareReportData = (rawData: any): DataReport => {
  return {
    statistics: {
      satisfaction: calculateStatistics(rawData.satisfaction),
      loyalty: calculateStatistics(rawData.loyalty)
    },
    totalEntries: rawData.length,
    // ... other transformations
  };
};
```

### Data Updates
```typescript
useEffect(() => {
  const transformedData = prepareReportData(rawData);
  setReport(transformedData);
}, [rawData]);
```

## Error Handling

### Component Error Boundary
```typescript
class ResponseConcentrationErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Response Concentration Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### Usage with Error Boundary
```typescript
<ResponseConcentrationErrorBoundary>
  <ResponseConcentrationSection {...props} />
</ResponseConcentrationErrorBoundary>
```

## Performance Optimization

### Memoization
```typescript
const MemoizedResponseConcentration = React.memo(
  ResponseConcentrationSection,
  (prevProps, nextProps) => {
    return (
      prevProps.report === nextProps.report &&
      prevProps.settings === nextProps.settings &&
      prevProps.isPremium === nextProps.isPremium
    );
  }
);
```

### Lazy Loading
```typescript
const ResponseConcentration = React.lazy(() => 
  import('@/components/reporting/components/ResponseConcentration')
);

// Usage
<Suspense fallback={<Loading />}>
  <ResponseConcentration {...props} />
</Suspense>
```

## Testing Integration

### Component Testing
```typescript
describe('Response Concentration Integration', () => {
  it('integrates with DataReport', () => {
    render(<DataReport report={mockReport} />);
    expect(screen.getByText('Response Distribution Map')).toBeInTheDocument();
  });
});
```

### Premium Feature Testing
```typescript
it('handles premium features correctly', () => {
  render(
    <ResponseConcentration
      report={mockReport}
      isPremium={true}
    />
  );
  
  const settingsButton = screen.getByRole('button', { name: /settings/i });
  expect(settingsButton).toBeInTheDocument();
});
```

## Security Considerations

### Data Validation
```typescript
const validateReportData = (data: unknown): data is DataReport => {
  // Your validation logic
  return true;
};

// Usage
if (!validateReportData(incomingData)) {
  throw new Error('Invalid report data');
}
```

### Premium Access Control
```typescript
const validatePremiumAccess = () => {
  // Your premium validation logic
  return true;
};

// Usage
if (!validatePremiumAccess()) {
  return <PremiumRestrictedView />;
}
```

## Accessibility Integration

### ARIA Labels
```typescript
<div
  role="region"
  aria-label="Response Concentration"
  aria-describedby="response-concentration-description"
>
  <ResponseConcentrationSection {...props} />
</div>
```

### Keyboard Navigation
```typescript
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    setShowSettings(false);
  }
};

useEffect(() => {
  document.addEventListener('keydown', handleKeyPress);
  return () => document.removeEventListener('keydown', handleKeyPress);
}, []);
```

## Troubleshooting

### Common Issues
1. Settings not persisting
   - Check localStorage access
   - Verify settings format
   - Clear corrupted data

2. Premium features not showing
   - Verify premium status
   - Check feature flags
   - Clear cache if needed

3. Performance issues
   - Use memoization
   - Implement lazy loading
   - Optimize renders

### Debug Mode
```typescript
const DEBUG = process.env.NODE_ENV === 'development';

// Usage
if (DEBUG) {
  console.log('Response Concentration Debug:', {
    settings,
    report,
    isPremium
  });
}
```

## Best Practices

### 1. State Management
- Use appropriate state management
- Implement proper persistence
- Handle state updates efficiently

### 2. Error Handling
- Implement error boundaries
- Validate all inputs
- Provide fallback UI

### 3. Performance
- Optimize render cycles
- Use lazy loading
- Implement caching

### 4. Accessibility
- Include ARIA labels
- Support keyboard navigation
- Maintain focus management

## Version Compatibility

### Requirements
- React 18 or higher
- TypeScript 4.8 or higher
- Modern browser support
- Required dependencies installed

### Recommended Tools
- ESLint for code quality
- Prettier for formatting
- Jest for testing
- React Testing Library

## Support

### Documentation
- Component API reference
- Type definitions
- Integration examples
- Troubleshooting guide

### Updates
- Regular version checks
- Security updates
- Feature enhancements
- Bug fixes
