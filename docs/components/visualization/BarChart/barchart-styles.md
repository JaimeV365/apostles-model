# BarChart Styles Documentation

## Core Structure
```css
/* Main container */
.bar-chart-container {
  position: relative;
  width: 100%;
  height: 200px;
  padding: 20px 10px 25px;
  background: white;
  box-sizing: border-box;
  overflow: visible;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Chart wrapper */
.bar-chart-wrapper {
  position: relative;
  height: 100%;
  margin-left: 3.5rem;
}
```

## Bar Elements
```css
/* Bar container */
.bar-chart-bar-container {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 0 2px;
}

/* Individual bar */
.bar-chart-bar {
  width: 100%;
  max-width: 30px;
  background-color: #3a863e;
  transition: all 0.2s ease;
  min-height: 1px;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

/* Bar value */
.bar-chart-value {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: white;
  font-weight: 500;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
```

## Interactive Elements

### Settings Panel
```css
.bar-chart-settings-panel {
  position: absolute;
  top: -8px;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  padding: 16px;
  min-width: 280px;
  z-index: 40;
}

.bar-chart-settings-group {
  padding: 0.75rem 0;
}

.bar-chart-settings-option {
  display: flex;
  gap: 2rem;
  margin-bottom: 0.5rem;
}
```

### Color Customization
```css
.bar-chart-color-customization {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #E5E7EB;
}

.color-swatch {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.25rem;
  border: 1px solid #E5E7EB;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.selected {
  border: 2px solid #374151;
}

.color-swatch.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Premium Features

### Selected Bar State
```css
.bar-chart-bar.selected-bar {
  border: 2px solid #3a863e;
  box-shadow: 0 0 0 2px rgba(58, 134, 62, 0.3);
}
```

### Settings Controls
```css
.bar-chart-control-button {
  padding: 0.35rem;
  border-radius: 0.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #3a863e;
}

.bar-chart-control-button:hover {
  background-color: #F3F4F6;
}
```

## Grid System
```css
.bar-chart-grid {
  position: absolute;
  inset: 0 0 25px 0;
  pointer-events: none;
}

.bar-chart-grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #F3F4F6;
}
```

## Scale and Labels
```css
.bar-chart-scale {
  position: absolute;
  top: 0;
  bottom: 25px;
  left: -3.5rem;
  width: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.bar-chart-legend {
  text-align: center;
  margin-bottom: 1rem;
}

.bar-chart-title {
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}
```

## Tooltips
```css
.bar-chart-tooltip {
  position: absolute;
  bottom: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 50;
  border: 1px solid #E5E7EB;
}
```

## Responsive Design

### Mini Variant
```css
/* Adjustments for mini chart type */
.bar-chart-container.mini {
  height: 150px;
  padding: 15px 8px 20px;
}

.bar-chart-container.mini .bar-chart-bar {
  max-width: 20px;
}
```

### Mobile Adaptations
```css
@media (max-width: 640px) {
  .bar-chart-container {
    padding: 15px 5px 20px;
  }

  .bar-chart-wrapper {
    margin-left: 2.5rem;
  }

  .bar-chart-bar {
    max-width: 25px;
  }
}
```

## Style Dependencies
- Brand colors from `styles/constants.ts`
- Base styles from `App.css`
- Shared UI components styles

## Guidelines for Modifications

### Adding New Styles
1. Follow BEM naming convention
2. Use existing color variables
3. Maintain responsive design
4. Test cross-browser compatibility

### Premium Feature Styling
1. Use consistent visual language
2. Clear state indicators
3. Smooth transitions
4. Accessible interactions

### Performance Considerations
1. Use CSS transforms where possible
2. Minimize repaints
3. Efficient selectors
4. Optimized animations