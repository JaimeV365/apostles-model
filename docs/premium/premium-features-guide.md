# Response Concentration Premium Features Guide

Save this file at: `/docs/premium/response-concentration.md`

## Overview
This guide details all premium features available in the Response Concentration section, their implementation, and how they're controlled through the settings panel.

## Premium Feature List

### 1. Distribution Map Features
- Custom color schemes
- Interactive tooltips
- Point size customization
- Click interactions

### 2. Frequent Response Features
- Color coding customization
- Adjustable item limits
- Enhanced formatting options
- Detailed statistics

### 3. Intensity Dial Features
- Custom color selection
- Range adjustments
- Enhanced animations
- Detailed tooltips

## Settings Panel

### Location and Access
- Top-right cogwheel icon
- Appears on hover when premium is active
- Slides in from right side
- Preserves state between sessions

### Customization Areas

#### 1. Response Distribution Map
```typescript
interface MiniPlotSettings {
  useQuadrantColors: boolean;
  customColors: {
    default?: string;
  };
}
```

Available Options:
- Toggle between quadrant and custom colors
- 8-color palette selection
- Custom hex color input
- Color preview

#### 2. Frequent Responses
```typescript
interface ListSettings {
  useColorCoding: boolean;
  maxItems: number;
}
```

Available Options:
- Toggle color coding
- Adjust maximum items (1-20)
- Format customization
- Enhanced statistics

#### 3. Response Intensity
```typescript
interface DialSettings {
  minValue: number;
  maxValue: number;
  customColors: {
    satisfaction: string;
    loyalty: string;
  };
}
```

Available Options:
- Custom range values
- Separate colors for each metric
- Enhanced animations
- Detailed tooltips

## Implementation Guide

### 1. Activation Check
```typescript
const isPremiumFeature = (feature: string): boolean => {
  return isPremium && activeEffects.has('premium');
};
```

### 2. Feature Toggling
```typescript
{isPremium && (
  <button
    className="settings-button"
    onClick={() => setShowSettings(true)}
  >
    <Settings size={20} />
  </button>
)}
```

### 3. Settings Persistence
```typescript
const persistSettings = (settings: ResponseConcentrationSettings) => {
  localStorage.setItem('response-concentration-settings', 
    JSON.stringify(settings)
  );
};
```

## Preview System

### 1. Time-Limited Previews
- 2-second duration for visual effects
- Smooth transition out
- Clear upgrade prompt

### 2. Feature-Limited Previews
- Basic functionality demonstration
- Premium features indicated
- Clear upgrade path

### 3. Sample-Limited Previews
- Limited dataset display
- Core functionality showcase
- Premium capabilities hint

## Settings Management

### 1. State Structure
```typescript
const [settings, setSettings] = useState<ResponseConcentrationSettings>({
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
});
```

### 2. Settings Updates
```typescript
const handleSettingChange = (
  section: keyof ResponseConcentrationSettings,
  key: string,
  value: any
) => {
  setSettings(prev => ({
    ...prev,
    [section]: {
      ...prev[section],
      [key]: value
    }
  }));
};
```

### 3. Persistence Strategy
- Local storage for settings
- Session management
- Migration handling

## Visual Indicators

### 1. Premium Status
- Green badge in header
- Enhanced UI elements
- Premium feature markers

### 2. Feature Availability
- Lock icons on premium features
- Hover tooltips
- Upgrade prompts

### 3. Settings Access
- Visible cogwheel icon
- Smooth hover effects
- Clear interaction states

## User Experience

### 1. Settings Panel
- Smooth transitions
- Logical grouping
- Clear labeling
- Instant feedback

### 2. Color Selection
- Visual color picker
- Hex code input
- Color preview
- Standard palette

### 3. Value Inputs
- Number validation
- Range constraints
- Clear feedback
- Default values

## Migration Handling

### 1. Settings Migration
```typescript
const migrateSettings = (oldSettings: any): ResponseConcentrationSettings => {
  return {
    ...DEFAULT_SETTINGS,
    ...oldSettings,
    dial: {
      ...DEFAULT_SETTINGS.dial,
      ...oldSettings?.dial
    }
  };
};
```

### 2. Version Compatibility
- Backward compatibility
- Safe defaults
- Error handling
- User notification

## Troubleshooting

### Common Issues
1. Settings not saving
   - Check localStorage access
   - Verify premium status
   - Clear cache if needed

2. Color not applying
   - Validate color format
   - Check premium status
   - Verify component update

3. Panel not showing
   - Confirm premium status
   - Check z-index issues
   - Verify click handlers

### Solutions
1. Settings Reset
```typescript
const resetSettings = () => {
  setSettings(DEFAULT_SETTINGS);
  localStorage.removeItem('response-concentration-settings');
};
```

2. Cache Clear
```typescript
const clearSettingsCache = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('response-concentration')) {
      localStorage.removeItem(key);
    }
  });
};
```

## Best Practices

### 1. Feature Implementation
- Clear premium indicators
- Smooth degradation
- Helpful messaging
- Consistent experience

### 2. Settings Management
- Validate all inputs
- Persist changes immediately
- Provide defaults
- Handle errors gracefully

### 3. User Interface
- Clear premium markers
- Intuitive controls
- Immediate feedback
- Helpful tooltips

## Testing Premium Features

### 1. Feature Verification
```typescript
describe('Premium Features', () => {
  it('shows settings panel when premium', () => {
    render(<ResponseConcentration isPremium={true} />);
    expect(screen.getByRole('button', { name: /settings/i }))
      .toBeInTheDocument();
  });
});
```

### 2. Settings Validation
```typescript
describe('Settings Panel', () => {
  it('persists custom colors', () => {
    const { rerender } = render(<ResponseConcentration {...props} />);
    fireEvent.change(screen.getByLabelText(/custom color/i), {
      target: { value: '#ff0000' }
    });
    rerender(<ResponseConcentration {...props} />);
    expect(screen.getByLabelText(/custom color/i)).toHaveValue('#ff0000');
  });
});
```

## Version History

### v1.1.0 (Current)
- Enhanced color picker
- Improved animations
- Better error handling
- Performance optimization

### v1.0.0
- Initial premium features
- Basic customization
- Standard preview system