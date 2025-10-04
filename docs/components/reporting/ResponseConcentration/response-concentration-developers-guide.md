# Response Concentration - Developer's Guide

## Quick Start

The Response Concentration system provides intelligent analysis of repeated satisfaction/loyalty score combinations with advanced tier visualization and premium controls.

## Core Concepts

### Data Processing Flow

```typescript
Original Data → Enhanced Combinations → Tier Assignment → Visual Rendering
     ↓                    ↓                   ↓              ↓
Raw DataPoints → getEnhancedCombinations → applyTierLogic → MiniPlot + List
```

### Tier System Overview

The system uses **actual frequency levels** rather than percentage-based thresholds:

```typescript
// Example data: 2,3 x 4 times, 1,5 x 3 times, 4,4 x 2 times
// Results in:
// Tier 1: combinations with frequency 4 (highest)
// Tier 2: combinations with frequency 3 (medium)  
// Tier 3: combinations with frequency 2 (lowest)
```

## Implementation Guide

### Basic Setup

```tsx
import { ResponseConcentrationSection } from './components/ResponseConcentrationSection';
import { DEFAULT_SETTINGS } from './components/ResponseSettings/types';

const MyComponent = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  
  return (
    <ResponseConcentrationSection
      report={dataReport}
      settings={settings}
      onSettingsChange={setSettings}
      isPremium={userIsPremium}
      originalData={rawDataPoints}  // Required for real-time updates
    />
  );
};
```

### Enhanced Combinations Processing

#### Core Algorithm

```typescript
import { getEnhancedCombinations } from './enhancedCombinations';

const processData = (data: DataPoint[]) => {
  const combinations = getEnhancedCombinations(data, {
    frequencyThreshold: 2,    // Minimum occurrences (≥2 enforced)
    showTiers: true,          // Enable multi-tier visualization
    maxTiers: 3,             // Show up to 3 tiers
    isPremium: true          // Premium feature access
  });
  
  return combinations;
};
```

#### Frequency-Based Logic

```typescript
const getEnhancedCombinations = (data: any[], options = {}) => {
  // 1. Count combination frequencies
  const combinationMap = new Map<string, { count: number, satisfaction: number, loyalty: number }>();
  
  data.filter(d => !d.excluded).forEach(d => {
    const key = `${d.satisfaction}-${d.loyalty}`;
    if (!combinationMap.has(key)) {
      combinationMap.set(key, { count: 1, satisfaction: d.satisfaction, loyalty: d.loyalty });
    } else {
      const current = combinationMap.get(key)!;
      current.count++;
    }
  });

  // 2. Convert and sort by frequency
  const allCombinations = Array.from(combinationMap.values())
    .map(combo => ({
      satisfaction: combo.satisfaction,
      loyalty: combo.loyalty,
      count: combo.count,
      percentage: (combo.count / data.filter(d => !d.excluded).length) * 100
    }))
    .sort((a, b) => b.count - a.count);

  // 3. Apply frequency threshold filter
  const filteredCombinations = allCombinations.filter(combo => 
    combo.count >= frequencyThreshold
  );

  // 4. Apply tier logic if premium and enabled
  if (isPremium && showTiers && filteredCombinations.length > 0) {
    return applyTierLogic(filteredCombinations, maxCount, maxTiers);
  }

  // 5. Standard filtering for non-premium
  return standardFiltering(filteredCombinations, maxCount, frequencyThreshold);
};
```

### Tier Sizing System

#### Centralized Constants

```typescript
// tierSizes.ts - Single source of truth
export const TIER_SIZES = {
  tier1: 1,      // 100% - Full size
  tier2: 0.9,    // 90% - Slightly smaller  
  tier3: 0.85    // 85% - Smallest visible
} as const;

export const getTierSize = (tier: TierNumber): number => {
  switch (tier) {
    case 1: return TIER_SIZES.tier1;
    case 2: return TIER_SIZES.tier2;
    case 3: return TIER_SIZES.tier3;
    default: return TIER_SIZES.tier1;
  }
};
```

#### Implementation in Enhanced Combinations

```typescript
import { getTierSize, type TierNumber } from './tierSizes';

const applyTierLogic = (combinations, maxCount, maxTiers) => {
  // Use actual frequency levels as tier thresholds
  const uniqueFrequencies = Array.from(new Set(combinations.map(c => c.count)))
    .sort((a, b) => b - a);
  const tierThresholds = uniqueFrequencies.slice(0, 3);

  // Assign tiers based on exact frequency matches
  for (let tier = 1; tier <= maxTiers && tier <= tierThresholds.length; tier++) {
    const currentFrequency = tierThresholds[tier - 1];
    const tierCombinations = combinations.filter(combo => combo.count === currentFrequency);

    // Apply visual properties using centralized sizing
    const tierWithVisuals = tierCombinations.map(combo => ({
      ...combo,
      tier,
      opacity: tier === 1 ? 1 : tier === 2 ? 0.7 : 0.5,
      size: getTierSize(tier as TierNumber)  // Centralized sizing
    }));

    result.push(...tierWithVisuals);
  }

  return result;
};
```

#### CSS Implementation

```css
/* 
 * Tier sizing values should match tierSizes.ts:
 * tier1: 1, tier2: 0.9, tier3: 0.85 
 */
.mini-plot-point {
  width: 12px;    /* Base size for all points */
  height: 12px;
  /* ... other styles ... */
}

.mini-plot-point--tier1 {
  opacity: 1;
  transform: translate(-50%, 50%) scale(1);     /* 100% */
}

.mini-plot-point--tier2 {
  opacity: 0.7;
  transform: translate(-50%, 50%) scale(0.9);   /* 90% */
}

.mini-plot-point--tier3 {
  opacity: 0.5;
  transform: translate(-50%, 50%) scale(0.85);  /* 85% */
}
```

### Scale Format Support

#### Dynamic Scale Parsing

```typescript
// MiniPlot component - handles any "min-max" format
const MiniPlot = ({ satisfactionScale, loyaltyScale, combinations }) => {
  const [satisfactionMin, satisfactionMax] = satisfactionScale.split('-').map(Number);
  const [loyaltyMin, loyaltyMax] = loyaltyScale.split('-').map(Number);

  // Dynamic tick generation
  const yTicks = [...Array(loyaltyMax - loyaltyMin + 1)].map((_, i) => (
    <div key={i} className="mini-plot-tick">
      {loyaltyMin + i}
    </div>
  ));

  const xTicks = [...Array(satisfactionMax - satisfactionMin + 1)].map((_, i) => (
    <div key={i} className="mini-plot-tick">
      {satisfactionMin + i}
    </div>
  ));

  // Position calculation for any scale range
  const renderPoints = () => combinations.map((combo, index) => {
    const x = (combo.satisfaction - satisfactionMin) / (satisfactionMax - satisfactionMin) * 100;
    const y = (combo.loyalty - loyaltyMin) / (loyaltyMax - loyaltyMin) * 100;
    
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
          backgroundColor: getPointColor(combo.satisfaction, combo.loyalty)
          // Note: No width/height - controlled by CSS classes
        }}
      />
    );
  });

  return (
    <div className="mini-plot">
      <div className="mini-plot-y-axis">{yTicks}</div>
      <div className="mini-plot-area">{renderPoints()}</div>
      <div className="mini-plot-x-axis">{xTicks}</div>
    </div>
  );
};
```

### Average Position Reference

#### Implementation Pattern

```typescript
// Average position calculation and rendering
const MiniPlot = ({ averagePoint, showAverageDot, satisfactionScale, loyaltyScale }) => {
  const [satisfactionMin, satisfactionMax] = satisfactionScale.split('-').map(Number);
  const [loyaltyMin, loyaltyMax] = loyaltyScale.split('-').map(Number);

  return (
    <div className="mini-plot-area">
      {/* Average Point */}
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
      
      {/* Data Points */}
      {/* ... other points ... */}
    </div>
  );
};
```

#### CSS Styling

```css
.mini-plot-point--average {
  width: 8px;
  height: 8px;
  background-color: white;
  border: 2px solid #dc2626;
  filter: drop-shadow(0 0 3px rgba(220, 38, 38, 0.6));
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.2);
  z-index: 10;
}
```

## Premium Features Implementation

### Frequency Threshold Slider

#### Enhanced Control with Minimum Enforcement

```typescript
export const FrequencyThresholdSlider: React.FC<FrequencyThresholdSliderProps> = ({
  value,
  onChange,
  min = 2,
  max = 10,
  disabled = false
}) => {
  // Enforce minimum value of 2 (combinations need multiple occurrences)
  const effectiveMin = Math.max(min, 2);
  const effectiveValue = Math.max(value, effectiveMin);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(parseInt(e.target.value), effectiveMin);
    onChange(newValue);
  };

  const getSliderBackground = () => {
    const percentage = ((effectiveValue - effectiveMin) / (max - effectiveMin)) * 100;
    return `linear-gradient(to right, #3a863e 0%, #3a863e ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
  };

  return (
    <div className="frequency-threshold-slider">
      <div className="slider-header">
        <label>Show combinations appearing</label>
        <span>{effectiveValue}+ times</span>
      </div>
      
      <input
        type="range"
        min={effectiveMin}
        max={max}
        value={effectiveValue}
        onChange={handleSliderChange}
        disabled={disabled}
        style={{ background: getSliderBackground() }}
      />
      
      <div className="slider-ticks">
        {Array.from({ length: max - effectiveMin + 1 }, (_, i) => (
          <div key={i + effectiveMin} className={`tick ${effectiveValue === i + effectiveMin ? 'active' : ''}`}>
            {i + effectiveMin}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Tier Toggle Component

#### Smart Tier Button States

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
    <div className={`tier-toggle ${disabled ? 'disabled' : ''}`}>
      <div className="tier-header">
        <label className="tier-checkbox">
          <input
            type="checkbox"
            checked={showTiers}
            onChange={(e) => onShowTiersChange(e.target.checked)}
            disabled={disabled}
          />
          Multi-tier visualization
        </label>
      </div>
      
      {showTiers && (
        <div className="tier-options">
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
                      onShowTiersChange(true);  // Auto-enable tiers when clicking buttons
                      onMaxTiersChange(option.value);
                    }
                  }}
                  disabled={isDisabled}
                  title={isAvailable ? option.description : `No data available for ${option.label.toLowerCase()}`}
                >
                  <div className="tier-button-content">
                    <span className="tier-number">{option.value}</span>
                    <span className="tier-label">{option.label}</span>
                  </div>
                  {/* Visual preview dots */}
                  <div className="tier-preview">
                    {Array.from({ length: option.value }, (_, i) => (
                      <div 
                        key={i}
                        className={`tier-dot tier-${i + 1}`}
                        style={{
                          opacity: 1 - (i * 0.3),
                          transform: `scale(${1 - (i * 0.2)})`
                        }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
```

### Available Tiers Calculation

#### Smart Detection Based on Data

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

## Reset Button State Management

### Dynamic State Detection

```typescript
import { DEFAULT_SETTINGS } from './types';

// Helper function to detect changes
const hasSettingsChanged = (current: any, defaults: any): boolean => {
  return JSON.stringify(current) !== JSON.stringify(defaults);
};

// Component implementation
const ResponseSettings = ({ settings, onSettingsChange }) => {
  // Check if current settings differ from defaults
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

  return (
    <>
      {/* Distribution section reset */}
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

      {/* Responses section reset */}
      <button
        className={`filter-manage-button ${!responsesChanged ? 'disabled' : ''}`}
        onClick={() => onSettingsChange({
          ...settings,
          list: { ...DEFAULT_SETTINGS.list }
        })}
        disabled={!responsesChanged}
      >
        Reset All
      </button>

      {/* Intensity section reset */}
      <button
        className={`filter-manage-button ${!intensityChanged ? 'disabled' : ''}`}
        onClick={() => onSettingsChange({
          ...settings,
          dial: { ...DEFAULT_SETTINGS.dial }
        })}
        disabled={!intensityChanged}
      >
        Reset All
      </button>
    </>
  );
};
```

### Reset Button CSS

```css
.filter-manage-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #9ca3af;
  border-color: #e5e7eb;
}

.filter-manage-button.disabled:hover {
  background-color: transparent;
  border-color: #e5e7eb;
}
```

## Real-time Updates Implementation

### Debounced Processing for Performance

```typescript
const ResponseConcentrationSection = ({ originalData, settings }) => {
  const [filteredData, setFilteredData] = useState<CombinationWithTier[]>([]);

  // Real-time update effect with debouncing
  useEffect(() => {
    if (originalData && originalData.length > 0) {
      // Use debouncing for large datasets
      const debouncedUpdate = debounce(() => {
        const newCombinations = getEnhancedCombinationsWithSettings(originalData);
        setFilteredData(newCombinations);
        console.log("Updated filteredData with settings:", newCombinations);
      }, 300);

      debouncedUpdate();

      return () => debouncedUpdate.cancel();
    }
  }, [originalData, settings.miniPlot.frequencyThreshold, settings.miniPlot.showTiers, settings.miniPlot.maxTiers]);

  // Helper function that applies current settings
  const getEnhancedCombinationsWithSettings = (data: any[]): CombinationWithTier[] => {
    if (!data || data.length === 0) return [];
    
    return getEnhancedCombinations(data, {
      frequencyThreshold: settings.miniPlot.frequencyThreshold || 2,
      showTiers: settings.miniPlot.showTiers || false,
      maxTiers: settings.miniPlot.maxTiers || 2,
      isPremium
    });
  };

  return (
    <div className="response-concentration-grid">
      <div className="miniplot-container">
        <MiniPlot 
          combinations={filteredData}
          satisfactionScale={report.satisfactionScale}
          loyaltyScale={report.loyaltyScale}
          useQuadrantColors={settings.miniPlot.useQuadrantColors}
          customColors={settings.miniPlot.customColors}
          averagePoint={{
            satisfaction: report.statistics.satisfaction.average,
            loyalty: report.statistics.loyalty.average
          }}
          showAverageDot={settings.miniPlot.showAverageDot}
        />
      </div>
      
      <div className="combinations-list">
        {filteredData.map((combo, index) => (
          <li key={index} className="combination-item" style={{ opacity: combo.opacity || 1 }}>
            <span 
              className="combination-marker"
              style={{ 
                backgroundColor: getPointColor(combo.satisfaction, combo.loyalty),
                transform: `scale(${combo.size || 1})`  // Uses centralized sizing
              }} 
            />
            {/* ... rest of item content ... */}
          </li>
        ))}
      </div>
    </div>
  );
};
```

## Common Development Tasks

### Adding New Tier Sizes

1. **Update tierSizes.ts:**
```typescript
export const TIER_SIZES = {
  tier1: 1,
  tier2: 0.9,
  tier3: 0.85,
  tier4: 0.8    // New tier
} as const;

export type TierNumber = 1 | 2 | 3 | 4;  // Update type
```

2. **Update CSS comments:**
```css
/* 
 * Tier sizing values should match tierSizes.ts:
 * tier1: 1, tier2: 0.9, tier3: 0.85, tier4: 0.8
 */
.mini-plot-point--tier4 {
  opacity: 0.4;
  transform: translate(-50%, 50%) scale(0.8);
}
```

3. **Update getTierSize function:**
```typescript
export const getTierSize = (tier: TierNumber): number => {
  switch (tier) {
    case 1: return TIER_SIZES.tier1;
    case 2: return TIER_SIZES.tier2;
    case 3: return TIER_SIZES.tier3;
    case 4: return TIER_SIZES.tier4;
    default: return TIER_SIZES.tier1;
  }
};
```

### Extending Scale Support

#### Adding New Scale Formats

```typescript
// Scale validation and parsing
const parseScale = (scale: string): { min: number; max: number } => {
  const scalePattern = /^(\d+)-(\d+)$/;
  const match = scale.match(scalePattern);
  
  if (!match) {
    console.error(`Invalid scale format: ${scale}. Expected format: "min-max"`);
    return { min: 1, max: 5 }; // Fallback
  }
  
  return {
    min: parseInt(match[1], 10),
    max: parseInt(match[2], 10)
  };
};

// Usage in component
const MiniPlot = ({ satisfactionScale, loyaltyScale }) => {
  const satisfactionRange = parseScale(satisfactionScale);
  const loyaltyRange = parseScale(loyaltyScale);

  // Use ranges for calculations
  const x = (combo.satisfaction - satisfactionRange.min) / 
            (satisfactionRange.max - satisfactionRange.min) * 100;
  const y = (combo.loyalty - loyaltyRange.min) / 
            (loyaltyRange.max - loyaltyRange.min) * 100;
};
```

### Performance Optimization

#### Dataset Size Strategy

```typescript
const getPerformanceStrategy = (dataSize: number) => {
  if (dataSize < 1000) {
    return {
      updateMode: 'realtime',
      debounceMs: 0,
      maxCombinations: 10
    };
  } else if (dataSize < 10000) {
    return {
      updateMode: 'debounced',
      debounceMs: 300,
      maxCombinations: 8
    };
  } else {
    return {
      updateMode: 'manual',
      debounceMs: 0,
      maxCombinations: 6
    };
  }
};

// Implementation with debouncing
const debouncedUpdate = useMemo(
  () => debounce((data: DataPoint[]) => {
    const combinations = getEnhancedCombinations(data);
    setFilteredData(combinations);
  }, strategy.debounceMs),
  [strategy.debounceMs]
);
```

#### Memory Management

```typescript
// Cleanup pattern for heavy computations
useEffect(() => {
  let isCancelled = false;
  
  const processData = async () => {
    const result = await heavyDataProcessing(originalData);
    
    if (!isCancelled) {
      setProcessedData(result);
    }
  };
  
  processData();
  
  return () => {
    isCancelled = true;
  };
}, [originalData]);
```

## Debugging Strategies

### Debug Logging System

```typescript
const DEBUG_MODE = process.env.NODE_ENV === 'development';

const debugLog = (category: string, data: any) => {
  if (DEBUG_MODE) {
    console.log(`[ResponseConcentration:${category}]`, data);
  }
};

// Usage throughout component
debugLog('EnhancedCombinations', {
  inputSize: originalData.length,
  outputSize: filteredData.length,
  maxCount: Math.max(...filteredData.map(c => c.count)),
  tierSizes: filteredData.map(c => ({ tier: c.tier, size: c.size })),
  algorithm: 'frequency-based-tiers'
});
```

### Common Debug Scenarios

```typescript
// 1. Data flow debugging
console.log('Data Flow Debug:', {
  originalDataLength: originalData?.length ?? 0,
  reportCombosLength: report.mostCommonCombos.length,
  filteredDataLength: filteredData.length,
  settings: settings.miniPlot,
  availableTiers: getAvailableTiers(),
  isPremium
});

// 2. Tier assignment debugging
console.log('Tier Assignment Debug:', {
  uniqueFrequencies: [...new Set(filteredData.map(c => c.count))],
  tierDistribution: {
    tier1: filteredData.filter(c => c.tier === 1).length,
    tier2: filteredData.filter(c => c.tier === 2).length,
    tier3: filteredData.filter(c => c.tier === 3).length
  },
  sizeDistribution: {
    tier1: filteredData.find(c => c.tier === 1)?.size,
    tier2: filteredData.find(c => c.tier === 2)?.size,
    tier3: filteredData.find(c => c.tier === 3)?.size
  }
});

// 3. Scale calculation debugging
console.log('Scale Debug:', {
  satisfactionScale,
  loyaltyScale,
  satisfactionRange: [satisfactionMin, satisfactionMax],
  loyaltyRange: [loyaltyMin, loyaltyMax],
  averagePoint,
  pointPositions: filteredData.map(c => ({
    combo: `${c.satisfaction},${c.loyalty}`,
    x: ((c.satisfaction - satisfactionMin) / (satisfactionMax - satisfactionMin)) * 100,
    y: ((c.loyalty - loyaltyMin) / (loyaltyMax - loyaltyMin)) * 100
  }))
});
```

## Testing Guidelines

### Unit Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ResponseConcentrationSection } from './ResponseConcentrationSection';
import { getEnhancedCombinations } from './enhancedCombinations';
import { getTierSize, TIER_SIZES } from './tierSizes';

describe('ResponseConcentrationSection', () => {
  const mockSettings = {
    miniPlot: {
      useQuadrantColors: true,
      customColors: {},
      showAverageDot: true,
      frequencyThreshold: 2,
      showTiers: false,
      maxTiers: 2
    },
    list: { useColorCoding: true, maxItems: 10 },
    dial: { minValue: 0, maxValue: 100, customColors: { satisfaction: '#4CAF50', loyalty: '#4682B4' } }
  };

  const mockData = [
    { satisfaction: 4, loyalty: 4, count: 3, percentage: 30 },
    { satisfaction: 3, loyalty: 3, count: 2, percentage: 20 }
  ];

  it('renders with basic props', () => {
    render(
      <ResponseConcentrationSection 
        report={mockReport}
        settings={mockSettings}
        onSettingsChange={jest.fn()}
        isPremium={false}
      />
    );
    
    expect(screen.getByText('Response Distribution Map')).toBeInTheDocument();
  });

  it('enables tier functionality for premium users', () => {
    render(
      <ResponseConcentrationSection 
        {...props}
        isPremium={true}
      />
    );
    
    expect(screen.getByText('Multi-tier visualization')).toBeInTheDocument();
  });
});

describe('Enhanced Combinations', () => {
  it('applies tier logic correctly', () => {
    const testData = [
      { satisfaction: 4, loyalty: 4, excluded: false },
      { satisfaction: 4, loyalty: 4, excluded: false },
      { satisfaction: 4, loyalty: 4, excluded: false },
      { satisfaction: 3, loyalty: 3, excluded: false },
      { satisfaction: 3, loyalty: 3, excluded: false }
    ];

    const result = getEnhancedCombinations(testData, {
      frequencyThreshold: 2,
      showTiers: true,
      maxTiers: 2,
      isPremium: true
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ satisfaction: 4, loyalty: 4, tier: 1, count: 3 });
    expect(result[1]).toMatchObject({ satisfaction: 3, loyalty: 3, tier: 2, count: 2 });
  });
});

describe('Tier Sizing', () => {
  it('returns correct sizes for each tier', () => {
    expect(getTierSize(1)).toBe(TIER_SIZES.tier1);
    expect(getTierSize(2)).toBe(TIER_SIZES.tier2);
    expect(getTierSize(3)).toBe(TIER_SIZES.tier3);
  });

  it('defaults to tier1 size for invalid input', () => {
    expect(getTierSize(99 as any)).toBe(TIER_SIZES.tier1);
  });
});
```

### Integration Testing

```typescript
describe('MiniPlot Integration', () => {
  it('receives correct tier data from enhanced combinations', () => {
    const mockCombinations = [
      { satisfaction: 4, loyalty: 4, tier: 1, size: 1, opacity: 1 },
      { satisfaction: 3, loyalty: 3, tier: 2, size: 0.9, opacity: 0.7 }
    ];

    render(
      <MiniPlot 
        combinations={mockCombinations}
        satisfactionScale="1-5"
        loyaltyScale="1-5"
      />
    );

    // Verify tier classes are applied
    expect(document.querySelector('.mini-plot-point--tier1')).toBeInTheDocument();
    expect(document.querySelector('.mini-plot-point--tier2')).toBeInTheDocument();
  });
});
```

## Maintenance Guidelines

### Regular Maintenance Tasks

1. **Verify tier size consistency:**
   - Check `tierSizes.ts` constants
   - Verify CSS comments match constants
   - Test visual hierarchy in both plot and list

2. **Performance monitoring:**
   - Monitor debounce effectiveness with large datasets
   - Check memory usage during real-time updates
   - Verify tier calculation performance

3. **Cross-browser testing:**
   - Test CSS transform scaling in different browsers
   - Verify touch interactions on mobile devices
   - Check accessibility features

### File Dependencies Map

```
tierSizes.ts (source of truth)
├── enhancedCombinations.ts (imports getTierSize)
├── MiniPlot.css (manually synced via comments)
└── [Future tier-dependent components]

ResponseConcentrationSection/index.tsx
├── enhancedCombinations.ts
├── MiniPlot/index.tsx
├── ResponseSettings/TierToggle.tsx
└── ResponseSettings/FrequencyThresholdSlider.tsx
```

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-01-14 | Multi-tier visualization, average position |
| 2.1.0 | 2025-01-22 | **Centralized tier sizing, enhanced controls** |

### Breaking Changes in v2.1.0

1. **Removed inline sizing from MiniPlot component**
   - Points now use CSS class-based sizing exclusively
   - Eliminates sizing conflicts between CSS and JavaScript

2. **FrequencyThresholdSlider minimum enforcement**
   - Now enforces minimum value of 2 (combinations require multiple occurrences)
   - Previous behavior allowed minimum of 1

3. **TierToggle auto-activation**
   - Clicking tier buttons automatically enables `showTiers`
   - Previous behavior required manual checkbox activation

### Migration Notes

- Existing applications using the component will automatically benefit from improved sizing consistency
- No changes required to public APIs
- CSS customizations for tier styling remain compatible
- Enhanced debugging capabilities available through new logging system