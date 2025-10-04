# Premium Features Guide

## Overview
This document outlines the premium features available in the Apostles Model application, their implementation, and preview behavior.

## Premium Feature List

### 1. Frequency Visualization
- **Feature**: Shows larger dots for overlapping data points
- **Preview Behavior**: 
  - Duration: 2 seconds
  - Shows full functionality
  - Reverts to standard visualization
- **Visual Indicator**: Lock icon on frequency toggle

### 2. Advanced Filtering
- **Feature**: Multiple column filtering
- **Preview Behavior**:
  - Shows first filter only
  - Additional filters show lock icon
  - Duration: Until filter change

### 3. Data Point Clustering
- **Feature**: Automatic point grouping
- **Preview Behavior**:
  - Shows sample clustering
  - Limited to 3 points
  - Duration: 2 seconds

## Implementation Guidelines

### Visual States
```css
/* Premium Feature Container */
.premium-feature {
  position: relative;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

/* Lock Icon */
.premium-feature::after {
  content: '🔒';
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
}

/* Preview State */
.premium-preview {
  opacity: 1;
  animation: fadeOut 2s ease;
}
```

### Preview Behavior
```typescript
interface PreviewConfig {
  duration: number;        // Preview duration in ms
  sampleSize: number;      // Number of items in preview
  showUpgrade: boolean;    // Show upgrade prompt after
}

const PREVIEW_CONFIGS: Record<string, PreviewConfig> = {
  frequency: {
    duration: 2000,
    sampleSize: Infinity,
    showUpgrade: true
  },
  filtering: {
    duration: null,    // Until filter change
    sampleSize: 1,     // One filter only
    showUpgrade: true
  },
  clustering: {
    duration: 2000,
    sampleSize: 3,
    showUpgrade: true
  }
};
```

### Feature Management
```typescript
const handlePremiumFeature = (feature: string) => {
  const config = PREVIEW_CONFIGS[feature];
  
  // Enable preview
  enableFeature(feature);
  
  // Handle preview timeout
  if (config.duration) {
    setTimeout(() => {
      disableFeature(feature);
      if (config.showUpgrade) {
        showUpgradePrompt();
      }
    }, config.duration);
  }
};
```

## Preview Types

### Time-Limited Preview
- Full functionality
- Fixed duration (typically 2 seconds)
- Smooth transition out
- Upgrade prompt after

### Sample-Limited Preview
- Limited functionality
- Restricted sample size
- Lock icon on restricted elements
- Upgrade prompt on restriction

### Feature-Limited Preview
- Basic functionality only
- Advanced features locked
- Visual indication of locked features
- Upgrade prompt on locked feature click

## UI Guidelines

### Premium Feature Indicators
1. Lock Icon
   - Visible on hover
   - Consistent position
   - Clear visibility

2. Opacity States
   - Normal: 0.7
   - Hover: 0.8
   - Preview: 1.0

3. Transitions
   - Smooth opacity changes
   - Fade effects for previews
   - Clear visual feedback

### Upgrade Prompts
```typescript
interface UpgradePrompt {
  title: string;
  message: string;
  feature: string;
  action: () => void;
}

const showUpgradePrompt = (feature: string) => {
  notifications.show({
    title: `Upgrade to Access ${feature}`,
    message: `This is a premium feature. Upgrade to unlock full ${feature} functionality.`,
    type: 'info',
    duration: 5000,
    action: {
      label: 'Learn More',
      onClick: () => showUpgradeInfo()
    }
  });
};
```

## Implementation Notes

### Adding New Premium Features
1. Define preview behavior
2. Set up visual indicators
3. Implement preview limits
4. Add upgrade prompts
5. Document restrictions

### Preview Management
- Track preview states
- Prevent preview spam
- Clear transitions
- Consistent timing
- Clear user feedback

### User Experience
- Clear premium indicators
- Informative previews
- Non-intrusive prompts
- Smooth transitions
- Helpful messaging

## Best Practices
- Consistent visual language
- Clear preview boundaries
- Informative restrictions
- Smooth degradation
- Helpful upgrade paths
