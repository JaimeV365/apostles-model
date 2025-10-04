# ResponseSettings Component API Documentation

Save this file at: `/docs/components/reporting/ResponseSettings/API.md`

## Overview
The ResponseSettings component provides a configurable settings panel for the Response Concentration section. It manages customization options for all visualizations including color schemes, display preferences, and value ranges.

## Location
```
/components/reporting/components/ResponseSettings/
├── index.tsx
├── styles.css
└── types.ts
```

## Props Interface
```typescript
interface ResponseSettingsProps {
  /** Current settings configuration */
  settings: ResponseConcentrationSettings;
  
  /** Callback for settings changes */
  onSettingsChange: (settings: ResponseConcentrationSettings) => void;
  
  /** Panel close handler */
  onClose: () => void;
  
  /** Premium mode flag */
  isPremium: boolean;
}

interface ResponseConcentrationSettings {
  miniPlot: {
    useQuadrantColors: boolean;
    customColors: Record<string, string>;
  };
  list: {
    useColorCoding: boolean;
    maxItems: number;
  };
  dial: {
    minValue: number;
    maxValue: number;
    customColors: {
      satisfaction: string;
      loyalty: string;
    };
  };
}
```

## Color Palette Configuration
```typescript
const colorPalette = [
  '#3a863e', // Brand green
  '#dc2626', // Red
  '#f59e0b', // Yellow/Orange
  '#4682b4', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#78716c', // Warm gray
  '#ffef00', // Yellow
];
```

## Component Structure

### Main Panel Layout
```tsx
<div className="response-settings-panel">
  <div className="response-settings-header">
    <h3>Response Concentration Settings</h3>
    <button onClick={onClose} className="response-settings-close">
      <X size={20} />
    </button>
  </div>

  {/* Distribution Map Settings */}
  <div className="settings-section">
    <h4>Response Distribution Map</h4>
    {/* Settings content */}
  </div>

  {/* Frequent Responses Settings */}
  <div className="settings-section">
    <h4>Frequent Responses</h4>
    {/* Settings content */}
  </div>

  {/* Response Intensity Settings */}
  <div className="settings-section">
    <h4>Response Intensity</h4>
    {/* Settings content */}
  </div>
</div>
```

## Core Styles

### Panel Layout
```css
.response-settings-panel {
  position: fixed;
  top: 10rem;
  right: 0;
  bottom: 0;
  width: 280px;
  background: white;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  overflow-y: auto;
  z-index: 50;
}

.response-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
```

### Color Picker Styles
```css
.color-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 0.15rem;
  width: fit-content;
}

.color-swatch {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: transform 0.2s ease;
}
```

## Settings Sections

### 1. Distribution Map Settings
```tsx
<div className="settings-section">
  <h4>Response Distribution Map</h4>
  <div className="settings-group">
    <label className="settings-checkbox">
      <input
        type="checkbox"
        checked={settings.miniPlot.useQuadrantColors}
        onChange={(e) => handleSettingChange('miniPlot', 'useQuadrantColors', e.target.checked)}
      />
      Use quadrant colors
    </label>
    
    {!settings.miniPlot.useQuadrantColors && (
      <ColorPicker
        colors={colorPalette}
        selected={settings.miniPlot.customColors.default}
        onChange={(color) => handleSettingChange(
          'miniPlot',
          'customColors',
          { default: color }
        )}
      />
    )}
  </div>
</div>
```

### 2. Frequent Responses Settings
```tsx
<div className="settings-section">
  <h4>Frequent Responses</h4>
  <div className="settings-group">
    <label className="settings-checkbox">
      <input
        type="checkbox"
        checked={settings.list.useColorCoding}
        onChange={(e) => handleSettingChange('list', 'useColorCoding', e.target.checked)}
      />
      Use color coding
    </label>

    <div className="settings-input">
      <label>Maximum items to show</label>
      <input
        type="number"
        min={1}
        max={20}
        value={settings.list.maxItems}
        onChange={(e) => handleSettingChange('list', 'maxItems', parseInt(e.target.value))}
      />
    </div>
  </div>
</div>
```

### 3. Response Intensity Settings
```tsx
<div className="settings-section">
  <h4>Response Intensity</h4>
  <div className="settings-group">
    <div className="settings-row">
      <div className="settings-input">
        <label>Min value</label>
        <input
          type="number"
          value={settings.dial.minValue}
          onChange={(e) => handleSettingChange('dial', 'minValue', parseInt(e.target.value))}
        />
      </div>
      <div className="settings-input">
        <label>Max value</label>
        <input
          type="number"
          value={settings.dial.maxValue}
          onChange={(e) => handleSettingChange('dial', 'maxValue', parseInt(e.target.value))}
        />
      </div>
    </div>

    <div className="color-customizations-container">
      <ColorPicker
        label="Satisfaction"
        colors={colorPalette}
        selected={settings.dial.customColors.satisfaction}
        onChange={(color) => handleColorChange('satisfaction', color)}
      />
      
      <ColorPicker
        label="Loyalty"
        colors={colorPalette}
        selected={settings.dial.customColors.loyalty}
        onChange={(color) => handleColorChange('loyalty', color)}
      />
    </div>
  </div>
</div>
```

## Event Handling

### Settings Changes
```typescript
const handleSettingChange = (
  section: keyof ResponseConcentrationSettings,
  key: string,
  value: any
) => {
  onSettingsChange({
    ...settings,
    [section]: {
      ...settings[section],
      [key]: value
    }
  });
};
```

### Color Changes
```typescript
const handleColorChange = (metric: 'satisfaction' | 'loyalty', color: string) => {
  handleSettingChange(
    'dial',
    'customColors',
    {
      ...settings.dial.customColors,
      [metric]: color
    }
  );
};
```

## Form Elements

### Checkboxes
```css
.settings-checkbox input[type="checkbox"] {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #3a863e;
  border-radius: 4px;
  cursor: pointer;
}

.settings-checkbox input[type="checkbox"]:checked {
  background-color: #3a863e;
  position: relative;
}

.settings-checkbox input[type="checkbox"]:checked::after {
  content: "✓";
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
}
```

### Number Inputs
```css
.settings-input input[type="number"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #E5E7EB;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}
```

## Accessibility

### Keyboard Navigation
- Tab order follows logical flow
- Focus indicators for all interactive elements
- Escape key closes panel

### ARIA Labels
```tsx
<button 
  onClick={onClose}
  className="response-settings-close"
  aria-label="Close settings panel"
>
  <X size={20} />
</button>
```

### Color Contrast
- Text meets WCAG 2.1 AA standards
- Visual feedback for interactive elements
- Clear focus states

## Error Handling

### Input Validation
```typescript
const validateNumberInput = (value: number, min: number, max: number): number => {
  if (isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
};
```

### Error States
```css
.settings-input.error input {
  border-color: #dc2626;
}

.error-message {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
```

## Testing Guidelines

### Unit Tests
```typescript
describe('ResponseSettings', () => {
  it('updates settings on checkbox change', () => {
    const onSettingsChange = jest.fn();
    render(<ResponseSettings {...props} onSettingsChange={onSettingsChange} />);
    
    fireEvent.click(screen.getByLabelText('Use quadrant colors'));
    expect(onSettingsChange).toHaveBeenCalledWith(expect.objectContaining({
      miniPlot: { useQuadrantColors: false }
    }));
  });
});
```

### Integration Tests
- Test with Response Concentration section
- Verify settings persistence
- Check color application across components

## Performance Considerations

### State Updates
- Batch related changes
- Debounce rapid updates
- Memoize complex calculations

### DOM Optimization
- Minimize DOM manipulation
- Use CSS transitions
- Efficient event handling

## Version History

### Current (1.1.0)
- Enhanced color picker layout
- Improved accessibility
- Bug fixes

### Previous (1.0.0)
- Initial implementation
- Basic settings support
- Standard styling

## Dependencies
- React
- lucide-react (for icons)
- CSS Modules
