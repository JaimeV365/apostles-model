# Response Concentration - Technical Reference

## Overview

The Response Concentration system provides advanced visualization and analysis of data point patterns through a multi-component architecture. This documentation covers the complete technical implementation including the new tier sizing system.

## Architecture Components

### Core Files Structure
```
ResponseConcentrationSection/
├── index.tsx                    # Main section component
├── enhancedCombinations.ts      # Data processing with tier logic
├── tierSizes.ts                 # Centralized tier sizing constants
├── styles.css                   # Main section styles
└── TierToggle.css              # Tier toggle component styles

MiniPlot/
├── index.tsx                    # Plot visualization component
└── MiniPlot.css                # Plot-specific styles with tier classes

ResponseSettings/
├── index.tsx                    # Settings panel component
├── FrequencyThresholdSlider.tsx # Premium frequency control
├── TierToggle.tsx              # Multi-tier toggle component
├── types.ts                    # Type definitions
└── styles.css                  # Settings panel styles
```

## Tier Sizing System

### Centralized Size Constants

The `tierSizes.ts` file provides a single source of truth for tier sizing:

```typescript
export const TIER_SIZES = {
  tier1: 1,      // 100% - Full size (highest frequency)
  tier2: 0.9,    // 90% - Slightly smaller (medium frequency) 
  tier3: 0.85    // 85% - Smallest visible (lowest frequency)
} as const;

export type TierNumber = 1 | 2 | 3;

export const getTierSize = (tier: TierNumber): number => {
  switch (tier) {
    case 1: return TIER_SIZES.tier1;
    case 2: return TIER_SIZES.tier2;
    case 3: return TIER_SIZES.tier3;
    default: return TIER_SIZES.tier1;
  }
};
```

### Usage in Enhanced Combinations

The `enhancedCombinations.ts` uses the centralized sizing for the frequent responses list:

```typescript
import { getTierSize, type TierNumber } from './tierSizes';

// Visual properties assignment
const tierWithVisuals = tierCombinations.map(combo => ({
  ...combo,
  tier,
  opacity: tier === 1 ? 1 : tier === 2 ? 0.7 : 0.5,
  size: getTierSize(tier as TierNumber)  // Centralized sizing
}));
```

### CSS Implementation

The `MiniPlot.css` uses matching values with maintenance comments:

```css
/* 
 * Tier sizing values should match tierSizes.ts:
 * tier1: 1, tier2: 0.9, tier3: 0.85 
 */
.mini-plot-point--tier1 {
  opacity: 1;
  transform: translate(-50%, 50%) scale(1);
}

.mini-plot-point--tier2 {
  opacity: 0.7;
  transform: translate(-50%, 50%) scale(0.9);
}

.mini-plot-point--tier3 {
  opacity: 0.5;
  transform: translate(-50%, 50%) scale(0.85);
}

/* Hover states with proportional scaling */
.mini-plot-point--tier1:hover {
  transform: translate(-50%, 50%) scale(1.2);
}

.mini-plot-point--tier2:hover {
  transform: translate(-50%, 50%) scale(1.1);
}

.mini-plot-point--tier3:hover {
  transform: translate(-50%, 50%) scale(1.05);
}
```

## Enhanced Combinations Logic

### Frequency-Based Tier Assignment

The system uses actual frequency levels rather than percentage thresholds:

```typescript
const applyTierLogic = (
  combinations: CombinationWithTier[], 
  maxCount: number, 
  maxTiers: number
): CombinationWithTier[] => {
  // Get unique frequency levels and sort descending
  const uniqueFrequencies = Array.from(new Set(combinations.map(c => c.count)))
    .sort((a, b) => b - a);
  
  // Use actual frequencies as tier thresholds
  const tierThresholds = uniqueFrequencies.slice(0, 3);

  // Assign combinations to tiers by exact frequency match
  for (let tier = 1; tier <= maxTiers && tier <= tierThresholds.length; tier++) {
    const currentFrequency = tierThresholds[tier - 1];
    const tierCombinations = combinations.filter(combo => combo.count === currentFrequency);
    
    // Apply visual properties using centralized sizing
    const tierWithVisuals = tierCombinations.map(combo => ({
      ...combo,
      tier,
      opacity: tier === 1 ? 1 : tier === 2 ? 0.7 : 0.5,
      size: getTierSize(tier as TierNumber)
    }));
    
    result.push(...tierWithVisuals);
  }
  
  return result;
};
```

## MiniPlot Implementation

### Dynamic Point Rendering

The MiniPlot component renders points with CSS class-based sizing:

```tsx
{combinations.map((combo, index) => {
  const x = (combo.satisfaction - satisfactionMin) / (satisfactionMax - satisfactionMin) * 100;
  const y = (combo.loyalty - loyaltyMin) / (loyaltyMax - loyaltyMin) * 100;
  const color = getPointColor(combo.satisfaction, combo.loyalty);

  // Build CSS classes including tier classes
  const pointClasses = [
    'mini-plot-point',
    combo.tier ? `mini-plot-point--tier${combo.tier}` : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      key={index}
      className={pointClasses}
      style={{
        left: `${x}%`,
        bottom: `${y}%`,
        backgroundColor: color
        // Note: width/height removed - controlled by CSS classes
      }}
      title={`Satisfaction: ${combo.satisfaction}, Loyalty: ${combo.loyalty} (${combo.count} responses)`}
    />
  );
})}
```

### Base Point Sizing

All plot points have a consistent base size defined in CSS:

```css
.mini-plot-point {
  position: absolute;
  width: 12px;    /* Fixed base size */
  height: 12px;   /* Fixed base size */
  transform: translate(-50%, 50%);
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}
```

## Available Tiers Calculation

### Smart Tier Detection

The system intelligently determines available tiers based on data:

```typescript
const getAvailableTiers = () => {
  if (!originalData || originalData.length === 0) return [];
  
  // Calculate combinations directly from raw data
  const combinationMap = new Map<string, number>();
  
  originalData.filter(d => !d.excluded).forEach(d => {
    const key = `${d.satisfaction}-${d.loyalty}`;
    combinationMap.set(key, (combinationMap.get(key) || 0) + 1);
  });
  
  // Filter by frequency threshold
  const frequencyThreshold = settings.miniPlot.frequencyThreshold || 2;
  const validCombinations = Array.from(combinationMap.values())
    .filter(count => count >= frequencyThreshold);
  
  const available = [];
  
  // Tier 1: Always available if we have data
  if (validCombinations.length > 0) {
    available.push(1);
  }
  
  // Tier 2: Available if we have multiple frequency levels
  const uniqueFrequencies = new Set(validCombinations);
  if (uniqueFrequencies.size >= 2) {
    available.push(2);
  }
  
  // Tier 3: Available if we have 3+ frequency levels
  if (uniqueFrequencies.size >= 3) {
    available.push(3);
  }
  
  return available;
};
```

## Premium Features Integration

### Frequency Threshold Control

The premium FrequencyThresholdSlider enforces minimum values:

```typescript
export const FrequencyThresholdSlider: React.FC<FrequencyThresholdSliderProps> = ({
  value,
  onChange,
  min = 2,  // Enforced minimum
  max = 10,
  disabled = false,
  inPremiumSection = false
}) => {
  // Ensure minimum value is enforced
  const effectiveMin = Math.max(min, 2);
  const effectiveValue = Math.max(value, effectiveMin);
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(parseInt(e.target.value), effectiveMin);
    onChange(newValue);
  };
  
  // Slider renders with enforced minimum
  return (
    <input
      type="range"
      min={effectiveMin}
      max={max}
      value={effectiveValue}
      onChange={handleSliderChange}
    />
  );
};
```

### Tier Toggle Component

The TierToggle component provides intelligent tier button states:

```typescript
export const TierToggle: React.FC<TierToggleProps> = ({
  showTiers,
  maxTiers,
  onShowTiersChange,
  onMaxTiersChange,
  disabled = false,
  availableTiers = [1, 2, 3]
}) => {
  const tierOptions = [
    { value: 1, label: 'Single Tier', description: 'Show only top frequency' },
    { value: 2, label: 'Two Tiers', description: 'Primary + secondary frequency' },
    { value: 3, label: 'Three Tiers', description: 'High, medium, low frequency' }
  ];

  return (
    <div className="tier-buttons">
      {tierOptions.map((option) => {
        const isAvailable = availableTiers.includes(option.value);
        const isDisabled = disabled || !isAvailable;
        
        return (
          <button
            key={option.value}
            className={`tier-button ${maxTiers === option.value ? 'active' : ''} ${!isAvailable ? 'unavailable' : ''}`}
            onClick={() => {
              if (isAvailable) {
                onShowTiersChange(true);  // Auto-enable tiers
                onMaxTiersChange(option.value);
              }
            }}
            disabled={isDisabled}
          >
            {/* Button content */}
          </button>
        );
      })}
    </div>
  );
};
```

## Reset Button State Management

### Dynamic Reset Button States

Reset buttons intelligently enable/disable based on changes from defaults:

```typescript
// Settings change detection
const distributionChanged = useMemo(() => 
  hasSettingsChanged(settings.miniPlot, DEFAULT_SETTINGS.miniPlot), 
  [settings.miniPlot]
);

const responsesChanged = useMemo(() => 
  hasSettingsChanged(settings.list, DEFAULT_SETTINGS.list), 
  [settings.list]
);

const intensityChanged = useMemo(() => 
  hasSettingsChanged(settings.dial, DEFAULT_SETTINGS.dial), 
  [settings.dial]
);

// Helper function
const hasSettingsChanged = (current: any, defaults: any): boolean => {
  return JSON.stringify(current) !== JSON.stringify(defaults);
};

// Reset button implementation
<button
  className={`filter-manage-button ${!distributionChanged ? 'disabled' : ''}`}
  onClick={() => onSettingsChange({
    ...settings,
    miniPlot: { ...DEFAULT_SETTINGS.miniPlot }
  })}
  disabled={!distributionChanged}
>
  Reset All
</button>
```

## Scale Format Support

### Multi-Scale Compatibility

The system supports various scale formats dynamically:

```typescript
// Dynamic scale parsing
const [satisfactionMin, satisfactionMax] = satisfactionScale.split('-').map(Number);
const [loyaltyMin, loyaltyMax] = loyaltyScale.split('-').map(Number);

// Position calculation for any scale range
const x = (combo.satisfaction - satisfactionMin) / (satisfactionMax - satisfactionMin) * 100;
const y = (combo.loyalty - loyaltyMin) / (loyaltyMax - loyaltyMin) * 100;

// Dynamic tick generation
{[...Array(loyaltyMax - loyaltyMin + 1)].map((_, i) => (
  <div key={i} className="mini-plot-tick">
    {loyaltyMin + i}
  </div>
))}
```

### Average Position Reference

Enhanced average position indicator with dynamic positioning:

```typescript
{averagePoint && showAverageDot && (
  <div
    className="mini-plot-point mini-plot-point--average"
    style={{
      left: `${((averagePoint.satisfaction - satisfactionMin) / (satisfactionMax - satisfactionMin)) * 100}%`,
      bottom: `${((averagePoint.loyalty - loyaltyMin) / (loyaltyMax - loyaltyMin)) * 100}%`,
    }}
    title={`Average: ${averagePoint.satisfaction.toFixed(1)}, ${averagePoint.loyalty.toFixed(1)}`}
  />
)}
```

## Type Definitions

### Enhanced Interfaces

```typescript
interface CombinationWithTier extends Combination {
  tier?: number;    // 1 = highest frequency, 2 = secondary, 3 = tertiary
  opacity?: number; // For visual differentiation between tiers
  size?: number;    // For visual size differentiation (from tierSizes.ts)
}

interface EnhancedCombinationOptions {
  frequencyThreshold?: number; // Custom minimum frequency (≥2)
  showTiers?: boolean;         // Enable multi-tier visualization
  maxTiers?: number;          // Number of tiers to show (1-3)
  isPremium?: boolean;        // Premium feature access
}

interface ResponseSettingsProps {
  settings: ResponseConcentrationSettings;
  onSettingsChange: (settings: ResponseConcentrationSettings) => void;
  onClose: () => void;
  isPremium: boolean;
  availableTiers?: number[];          // Dynamic tier availability
  activeSection?: string;
  frequencyFilterEnabled?: boolean;
  frequencyThreshold?: number;
  onFrequencyFilterEnabledChange?: (enabled: boolean) => void;
  onFrequencyThresholdChange?: (threshold: number) => void;
}
```

## Maintenance Guidelines

### When Updating Tier Sizes

1. **Update tierSizes.ts constants** - Single source of truth
2. **Update CSS comments** - Keep documentation in sync  
3. **Verify both systems** - Plot visualization and frequent responses list
4. **Test all tier combinations** - Ensure consistent visual hierarchy

### File Dependencies

```
tierSizes.ts
├── enhancedCombinations.ts (imports getTierSize)
├── MiniPlot.css (manual sync via comments)
└── [Future components requiring tier sizing]
```

### Common Issues

1. **Inconsistent sizing between plot and list** - Usually CSS class specificity or missing tier classes
2. **Tier buttons not activating** - Check availableTiers calculation logic
3. **Reset buttons always active** - Verify DEFAULT_SETTINGS import and comparison logic
4. **Frequency slider allowing value 1** - Ensure effectiveMin enforcement

## Performance Considerations

### Debounced Updates

```typescript
// Real-time update with debouncing for large datasets
useEffect(() => {
  if (originalData && originalData.length > 0) {
    const debouncedUpdate = debounce(() => {
      const newCombinations = getEnhancedCombinationsWithSettings(originalData);
      setFilteredData(newCombinations);
    }, 300);
    
    debouncedUpdate();
    
    return () => debouncedUpdate.cancel();
  }
}, [originalData, settings.miniPlot.frequencyThreshold, settings.miniPlot.showTiers, settings.miniPlot.maxTiers]);
```

### Memory Management

```typescript
// Limit combinations per tier to avoid performance issues
const maxPerTier = tier === 1 ? 6 : tier === 2 ? 4 : 3;
if (result.length >= maxPerTier * tier) {
  break;
}

// Overall result limit
return result.slice(0, Math.min(15, combinations.length));
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2023-09-01 | Initial implementation |
| 1.1.0 | 2023-10-15 | Added premium color customization |
| 1.2.0 | 2024-01-20 | Enhanced tooltips and hover effects |
| 2.0.0 | 2025-01-14 | Multi-tier visualization, average position reference |
| 2.1.0 | 2025-01-22 | **Centralized tier sizing system, enhanced frequency controls** |

## Latest Updates (v2.1.0)

### New Features
- **Centralized tier sizing** via `tierSizes.ts`
- **Enhanced frequency threshold** with minimum value enforcement (≥2)
- **Intelligent tier availability** based on actual data
- **Smart reset button states** that activate only when changes are made
- **Improved CSS class-based sizing** removing inline style conflicts

### Breaking Changes
- Removed inline size calculations from MiniPlot component
- FrequencyThresholdSlider now enforces minimum value of 2
- TierToggle automatically enables showTiers when tier buttons are clicked

### Migration Notes
- Existing tier sizing logic automatically migrated to use centralized constants
- CSS and JavaScript tier sizes now consistently maintained
- No breaking changes to public APIs
