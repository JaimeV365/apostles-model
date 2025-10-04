# Response Settings API Documentation

## Overview
The ResponseSettings component provides a comprehensive settings panel for customizing the Response Concentration section visualizations. It includes color customization, display options, and premium features like average position control.

## Location
```
/components/reporting/components/ResponseSettings/
├── index.tsx
├── styles.css
└── types.ts
```

## Component Interface

### Props
```typescript
interface ResponseSettingsProps {
  /** Current settings configuration */
  settings: ResponseConcentrationSettings;
  
  /** Callback for settings updates */
  onSettingsChange: (settings: ResponseConcentrationSettings) => void;
  
  /** Close panel callback */
  onClose: () => void;
  
  /** Premium feature access flag */
  isPremium: boolean;
}
```

### Settings Structure
```typescript
interface ResponseConcentrationSettings {
  miniPlot: {
    /** Use quadrant-based colors vs custom colors */
    useQuadrantColors: boolean;
    
    /** Custom color overrides */
    customColors: Record<string, string>;
    
    /** Premium: Show/hide average position reference */
    showAverageDot: boolean;
  };
  list: {
    /** Enable color coding in combinations list */
    useColorCoding: boolean;
    
    /** Maximum items to display in list */
    maxItems: number;
  };
  dial: {
    /** Minimum value for dial visualization */
    minValue: number;
    
    /** Maximum value for dial visualization */
    maxValue: number;
    
    /** Custom colors for dial components */
    customColors: {
      satisfaction: string;
      loyalty: string;
    };
  };
}
```

## Features

### Distribution Map Settings
- **Quadrant Colors Toggle**: Switch between automatic quadrant coloring and custom colors
- **Color Palette Selection**: 8-color palette with instant preview
- **Custom Hex Input**: Manual color specification with validation
- **Average Position Control** (Premium): Toggle visibility of average reference point

### Response List Settings
- **Color Coding Toggle**: Enable/disable color markers in the list
- **Maximum Items Control**: Slider to control list length (1-20 items)

### Response Intensity Settings
- **Value Range Controls**: Set minimum and maximum values for dial
- **Dual Color Customization**: Separate colors for satisfaction and loyalty
- **Real-time Preview**: Immediate visual feedback

## Usage Examples

### Basic Implementation
```tsx
import ResponseSettings from './components/ResponseSettings';
import { DEFAULT_SETTINGS } from './components/ResponseSettings/types';

const [settings, setSettings] = useState(DEFAULT_SETTINGS);
const [showSettings, setShowSettings] = useState(false);

<ResponseSettings
  settings={settings}
  onSettingsChange={setSettings}
  onClose={() => setShowSettings(false)}
  isPremium={isPremium}
/>
```

### Premium Feature Integration
```tsx
// Settings with premium features enabled
const premiumSettings = {
  ...DEFAULT_SETTINGS,
  miniPlot: {
    ...DEFAULT_SETTINGS.miniPlot,
    showAverageDot: true  // Premium feature
  }
};

<ResponseSettings
  settings={premiumSettings}
  onSettingsChange={handleSettingsChange}
  onClose={handleClose}
  isPremium={true}  // Enables premium controls
/>
```

### Custom Color Configuration
```tsx
// Settings with custom colors
const customizedSettings = {
  miniPlot: {
    useQuadrantColors: false,
    customColors: { default: '#3a863e' },
    showAverageDot: true
  },
  list: {
    useColorCoding: true,
    maxItems: 15
  },
  dial: {
    minValue: 0,
    maxValue: 100,
    customColors: {
      satisfaction: '#4CAF50',
      loyalty: '#2196F3'
    }
  }
};
```

## Color System

### Default Color Palette
```typescript
const colorPalette = [
  '#3a863e', // Brand green
  '#dc2626', // Red
  '#f59e0b', // Orange  
  '#4682b4', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#78716c', // Warm gray
  '#ffef00', // Yellow
];
```

### Color Picker Implementation
```tsx
<div className="color-picker">
  {colorPalette.map((color) => (
    <div
      key={color}
      className="color-swatch"
      style={{ backgroundColor: color }}
      onClick={() => handleColorChange(color)}
    />
  ))}
</div>
```

### Hex Input Validation
```typescript
const handleHexInput = (value: string, target: string) => {
  const cleanValue = value.replace(/[^0-9A-Fa-f]/g, '');
  if (cleanValue.length === 6) {
    handleSettingChange(target, '#' + cleanValue);
  }
};
```

## Settings Sections

### 1. Response Distribution Map
```tsx
<div className="settings-section">
  <h4>Response Distribution Map</h4>
  <div className="settings-group">
    {/* Quadrant colors toggle */}
    <label className="settings-checkbox">
      <input
        type="checkbox"
        checked={settings.miniPlot.useQuadrantColors}
        onChange={(e) => handleChange('miniPlot', 'useQuadrantColors', e.target.checked)}
      />
      Use quadrant colors
    </label>

    {/* Premium: Average position toggle */}
    {isPremium && (
      <label className="settings-checkbox">
        <input
          type="checkbox"
          checked={settings.miniPlot.showAverageDot}
          onChange={(e) => handleChange('miniPlot', 'showAverageDot', e.target.checked)}
        />
        Show average position
      </label>
    )}

    {/* Custom color selection */}
    {!settings.miniPlot.useQuadrantColors && (
      <div className="color-customization">
        <div className="color-palette">
          {/* Color swatches */}
        </div>
        <div className="custom-color-input">
          {/* Hex input */}
        </div>
      </div>
    )}
  </div>
</div>
```

### 2. Frequent Responses List
```tsx
<div className="settings-section">
  <h4>Frequent Responses</h4>
  <div className="settings-group">
    {/* Color coding toggle */}
    <label className="settings-checkbox">
      <input
        type="checkbox"
        checked={settings.list.useColorCoding}
        onChange={(e) => handleChange('list', 'useColorCoding', e.target.checked)}
      />
      Use color coding
    </label>

    {/* Maximum items slider */}
    <div className="settings-input">
      <label>Maximum items to show</label>
      <input
        type="range"
        min="1"
        max="20"
        value={settings.list.maxItems}
        onChange={(e) => handleChange('list', 'maxItems', parseInt(e.target.value))}
      />
      <span>{settings.list.maxItems}</span>
    </div>
  </div>
</div>
```

### 3. Response Intensity Dial
```tsx
<div className="settings-section">
  <h4>Response Intensity</h4>
  <div className="settings-group">
    {/* Min/Max value controls */}
    <div className="settings-row">
      <div className="settings-input">
        <label>Min Value</label>
        <input
          type="number"
          value={settings.dial.minValue}
          onChange={(e) => handleChange('dial', 'minValue', parseInt(e.target.value))}
        />
      </div>
      <div className="settings-input">
        <label>Max Value</label>
        <input
          type="number"
          value={settings.dial.maxValue}
          onChange={(e) => handleChange('dial', 'maxValue', parseInt(e.target.value))}
        />
      </div>
    </div>

    {/* Dual color customization */}
    <div className="dual-color-picker">
      <div>
        <label>Satisfaction</label>
        <div className="color-picker">
          {/* Color selection for satisfaction */}
        </div>
      </div>
      <div>
        <label>Loyalty</label>
        <div className="color-picker">
          {/* Color selection for loyalty */}
        </div>
      </div>
    </div>
  </div>
</div>
```

## State Management

### Settings Update Handler
```typescript
const handleSettingChange = (
  section: keyof ResponseConcentrationSettings,
  key: string,
  value: any
) => {
  const updatedSettings = {
    ...settings,
    [section]: {
      ...settings[section],
      [key]: value
    }
  };
  
  onSettingsChange(updatedSettings);
};
```

### Input State Management
```typescript
const [customHexInput, setCustomHexInput] = useState('');
const [satHexInput, setSatHexInput] = useState('');
const [loyHexInput, setLoyHexInput] = useState('');

// Hex input with validation
const handleHexChange = (value: string, setter: Function, target: string) => {
  const cleanValue = value.replace(/[^0-9A-Fa-f]/g, '');
  setter(cleanValue);
  
  if (cleanValue.length === 6) {
    handleSettingChange(target, '#' + cleanValue);
  }
};
```

## Styling System

### Main Panel Structure
```css
.response-settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 400px;
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1000;
}

.response-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}
```

### Settings Sections
```css
.settings-section {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.settings-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

### Color Picker Styling
```css
.color-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 0.25rem;
  width: fit-content;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.2s ease;
}

.color-swatch:hover {
  transform: scale(1.1);
  border-color: #374151;
}
```

### Input Controls
```css
.settings-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.settings-input {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.settings-input label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.settings-input input[type="range"] {
  width: 100%;
}

.settings-input input[type="number"] {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}
```

## Premium Features

### Feature Gating
```typescript
// Premium feature conditional rendering
{isPremium && (
  <label className="settings-checkbox">
    <input
      type="checkbox"
      checked={settings.miniPlot.showAverageDot}
      onChange={(e) => handleSettingChange('miniPlot', 'showAverageDot', e.target.checked)}
    />
    Show average position
  </label>
)}
```

### Premium Indicators
```css
.premium-feature {
  position: relative;
}

.premium-feature::after {
  content: "Premium";
  position: absolute;
  top: -8px;
  right: 0;
  background: linear-gradient(45deg, #3a863e, #4CAF50);
  color: white;
  font-size: 0.625rem;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 600;
}
```

## Accessibility Features

### Keyboard Navigation
```tsx
<div
  className="color-swatch"
  tabIndex={0}
  role="button"
  aria-label={`Select ${color} color`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleColorSelect(color);
    }
  }}
  onClick={() => handleColorSelect(color)}
/>
```

### Screen Reader Support
```tsx
<input
  type="range"
  min="1"
  max="20"
  value={settings.list.maxItems}
  aria-label="Maximum items to show in list"
  aria-describedby="max-items-help"
  onChange={handleMaxItemsChange}
/>
<div id="max-items-help" className="sr-only">
  Controls how many combination items are displayed in the list
</div>
```

## Integration Examples

### With Parent Component
```tsx
const ResponseConcentrationSection = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowPanel(true)}
        className="settings-button"
      >
        <Menu size={20} />
      </button>

      {showPanel && (
        <ResponseSettings
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowPanel(false)}
          isPremium={isPremium}
        />
      )}
    </>
  );
};
```

### Settings Persistence
```typescript
// Local storage integration
const usePersistedSettings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('responseConcentrationSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const updateSettings = (newSettings: ResponseConcentrationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('responseConcentrationSettings', JSON.stringify(newSettings));
  };

  return [settings, updateSettings];
};
```

## Testing Guidelines

### Unit Tests
```typescript
describe('ResponseSettings', () => {
  it('renders all setting sections', () => {
    render(<ResponseSettings {...defaultProps} />);
    
    expect(screen.getByText('Response Distribution Map')).toBeInTheDocument();
    expect(screen.getByText('Frequent Responses')).toBeInTheDocument();
    expect(screen.getByText('Response Intensity')).toBeInTheDocument();
  });

  it('shows premium features when isPremium is true', () => {
    render(<ResponseSettings {...defaultProps} isPremium={true} />);
    
    expect(screen.getByText('Show average position')).toBeInTheDocument();
  });

  it('calls onSettingsChange when settings are updated', () => {
    const mockOnChange = jest.fn();
    render(<ResponseSettings {...defaultProps} onSettingsChange={mockOnChange} />);
    
    fireEvent.click(screen.getByLabelText('Use quadrant colors'));
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        miniPlot: expect.objectContaining({
          useQuadrantColors: false
        })
      })
    );
  });
});
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2023-09-01 | Initial implementation |
| 1.1.0 | 2023-10-15 | Added color customization |
| 1.2.0 | 2024-01-20 | Enhanced dial settings |
| 2.0.0 | 2025-01-14 | **Major Update**: Added average position control, enhanced UI |

## Best Practices

### Performance
- Debounce rapid setting changes
- Use controlled components for all inputs
- Minimize re-renders with proper memoization

### User Experience
- Provide immediate visual feedback
- Group related settings logically
- Use progressive disclosure for advanced options

### Accessibility
- Ensure all controls are keyboard accessible
- Provide proper ARIA labels and descriptions
- Maintain sufficient color contrast

### Code Organization
- Keep settings logic separate from UI components
- Use TypeScript for type safety
- Implement proper error boundaries