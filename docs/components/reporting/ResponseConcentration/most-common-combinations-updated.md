# Most Common Combinations Documentation

## Overview
The Most Common Combinations section displays an enhanced combination of a MiniPlot visualization and a corresponding list of data points, laid out in a three-column grid structure within the Response Concentration component. This documentation reflects the major updates in version 2.0 including real-time processing, average position references, and flexible scale support.

## File Structure
```
components/
└── reporting/
    ├── components/
    │   ├── ResponseConcentrationSection/
    │   │   ├── index.tsx        # Main component with enhanced processing
    │   │   └── styles.css       # Updated styles with legend support
    │   └── MiniPlot/
    │       ├── index.tsx        # Enhanced MiniPlot with scale flexibility
    │       └── MiniPlot.css     # CSS-based styling architecture
    └── ReportingSection.css     # Global reporting styles
```

## Enhanced Component Dependencies
```typescript
import React, { useState, useEffect } from 'react';
import type { DataReport } from '../../types';
import type { ResponseConcentrationSettings } from '../ResponseSettings/types';
import type { DataPoint } from '@/types/base';
import { MiniPlot } from '../MiniPlot';
import CombinationDial from '../CombinationDial';
import ResponseSettings from '../ResponseSettings';
```

## Layout Structure (Updated v2.0)

### Enhanced Grid Container
```tsx
<div className="response-concentration-grid">
  <div style={{ 
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
    background: '#f9fafb',
    borderRadius: '0.5rem',
    padding: '1.5rem'
  }}>
    {/* Enhanced grid items with real-time updates */}
  </div>
</div>
```

### Enhanced MiniPlot Section
```tsx
{/* Left Column - Enhanced MiniPlot with Average Position */}
<div className="concentration-column">
  <h5>Response Distribution Map</h5>
  <div className="miniplot-container">
    <MiniPlot 
      combinations={filteredData}              // Real-time enhanced data
      satisfactionScale={report.satisfactionScale}
      loyaltyScale={report.loyaltyScale}
      useQuadrantColors={settings.miniPlot.useQuadrantColors}
      customColors={settings.miniPlot.customColors}
      averagePoint={{                          // New: Average position reference
        satisfaction: report.statistics.satisfaction.average,
        loyalty: report.statistics.loyalty.average
      }}
      showAverageDot={settings.miniPlot.showAverageDot}  // New: Premium toggle
    />
  </div>
  {/* New: Legend below visualization */}
  {settings.miniPlot.showAverageDot && (
    <div className="miniplot-legend">
      <div className="legend-item">
        <span className="legend-dot average-dot"></span>
        <span className="legend-text">Average Position</span>
      </div>
    </div>
  )}
</div>
```

### Enhanced Combinations List Section
```tsx
{/* Middle Column - Dynamic Combinations List */}
<div className="concentration-column">
  <h5>Frequent Responses</h5>
  <ul className="combinations-list">
    {getFilteredCombinations().map((combo: Combination, index: number) => (
      <li key={index} className="combination-item">
        <span 
          className="combination-marker"
          style={{ 
            backgroundColor: getPointColor(combo.satisfaction, combo.loyalty)
          }} 
        />
        <div className="combination-text">
          <span className="combination-values">
            {combo.satisfaction}, {combo.loyalty}
          </span>
          <span className="combination-stats">
            ({combo.count} responses - {combo.percentage.toFixed(1)}%)
          </span>
        </div>
      </li>
    ))}
    {filteredData.length > settings.list.maxItems && (
      <li className="combinations-more">
        ...and {filteredData.length - settings.list.maxItems} more combinations
      </li>
    )}
  </ul>
</div>
```

### Enhanced Intensity Section
```tsx
{/* Right Column - Response Intensity */}
<div className="concentration-column">
  <h5>Response Intensity</h5>
  <div className="dial-container">
    <CombinationDial 
      statistics={report.statistics}
      totalEntries={report.totalEntries}
      isPremium={isPremium}
      minValue={settings.dial.minValue}
      maxValue={settings.dial.maxValue}
      customColors={settings.dial.customColors}
    />
  </div>
</div>
```

## Enhanced Data Processing

### Real-time Combination Detection
```typescript
const getEnhancedCombinations = (data: DataPoint[]): Combination[] => {
  if (!data || data.length === 0) return [];
  
  // Build frequency map for real-time processing
  const combinationMap = new Map<string, CombinationData>();
  
  data.filter(d => !d.excluded).forEach(d => {
    const key = `${d.satisfaction}-${d.loyalty}`;
    if (!combinationMap.has(key)) {
      combinationMap.set(key, {
        count: 1,
        satisfaction: d.satisfaction,
        loyalty: d.loyalty
      });
    } else {
      const current = combinationMap.get(key)!;
      current.count++;
    }
  });

  // Convert to combinations with percentage calculation
  const allCombinations = Array.from(combinationMap.values())
    .map(combo => ({
      satisfaction: combo.satisfaction,
      loyalty: combo.loyalty,
      count: combo.count,
      percentage: (combo.count / data.filter(d => !d.excluded).length) * 100
    }))
    .sort((a, b) => b.count - a.count);

  // Smart filtering algorithm
  const maxCount = allCombinations.length > 0 ? allCombinations[0].count : 0;
  
  if (maxCount >= 3) {
    // High-frequency data: Show top tier combinations
    return allCombinations
      .filter(combo => combo.count >= Math.max(3, maxCount * 0.8))
      .slice(0, 6);
  } else if (maxCount >= 2) {
    // Medium-frequency data: Show emerging patterns
    return allCombinations
      .filter(combo => combo.count >= 2)
      .slice(0, 8);
  } else {
    // Low-frequency data: Fall back to top combinations
    return allCombinations.slice(0, 2);
  }
};
```

### Real-time Update Integration
```typescript
// In ResponseConcentrationSection component
const [filteredData, setFilteredData] = useState(
  originalData.length > 0 ? getEnhancedCombinations(originalData) : report.mostCommonCombos
);

// Real-time update effect
useEffect(() => {
  if (originalData && originalData.length > 0) {
    const newCombinations = getEnhancedCombinations(originalData);
    setFilteredData(newCombinations);
  }
}, [originalData]);
```

## Enhanced MiniPlot Configuration

### Multi-Scale Support
```typescript
// Dynamic scale parsing for flexibility
const [satisfactionMin, satisfactionMax] = satisfactionScale.split('-').map(Number);
const [loyaltyMin, loyaltyMax] = loyaltyScale.split('-').map(Number);

// Dynamic tick generation
{[...Array(loyaltyMax - loyaltyMin + 1)].map((_, i) => (
  <div key={i} className="mini-plot-tick">
    {loyaltyMin + i}
  </div>
))}

// Position calculation for any scale range
const x = (combo.satisfaction - satisfactionMin) / (satisfactionMax - satisfactionMin) * 100;
const y = (combo.loyalty - loyaltyMin) / (loyaltyMax - loyaltyMin) * 100;
```

### Enhanced CSS Configuration
```css
.mini-plot {
  position: relative;
  width: 280px;
  height: 220px;
  margin: 0;
  display: grid;
  grid-template-areas:
    "y-axis plot"
    "blank x-axis";
  grid-template-columns: 30px 1fr;
  grid-template-rows: 1fr 20px;
  gap: 2px;
}

/* Enhanced average position styling */
.mini-plot-point--average {
  width: 8px;
  height: 8px;
  background-color: white;
  border: 2px solid #dc2626;
  filter: drop-shadow(0 0 3px rgba(220, 38, 38, 0.6));
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.2);
  z-index: 10;
}

/* Legend styling */
.miniplot-legend {
  display: flex;
  justify-content: flex-start;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;
  font-size: 0.75rem;
  color: #6b7280;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.average-dot {
  background-color: white;
  border: 2px solid #dc2626;
  filter: drop-shadow(0 0 2px rgba(220, 38, 38, 0.5));
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.2);
}
```

### Enhanced Props Interface
```typescript
interface EnhancedMiniPlotProps {
  combinations: Array<{
    satisfaction: number;
    loyalty: number;
    count: number;
    percentage: number;
  }>;
  satisfactionScale: string;  // e.g., "1-5", "0-10"
  loyaltyScale: string;
  useQuadrantColors?: boolean;
  customColors?: Record<string, string>;
  averagePoint?: {            // New in v2.0
    satisfaction: number;
    loyalty: number;
  };
  showAverageDot?: boolean;   // New in v2.0
}
```

## Enhanced List Implementation

### Dynamic Color Logic
```typescript
const getPointColor = (satisfaction: number, loyalty: number) => {
  if (!settings.miniPlot.useQuadrantColors && settings.miniPlot.customColors?.default) {
    return settings.miniPlot.customColors.default;
  }
  
  // Dynamic midpoint calculation based on scale
  const satRange = satisfactionScale.split('-').map(Number);
  const loyRange = loyaltyScale.split('-').map(Number);
  const satMidpoint = (satRange[0] + satRange[1]) / 2;
  const loyMidpoint = (loyRange[0] + loyRange[1]) / 2;
  
  if (satisfaction >= satMidpoint && loyalty >= loyMidpoint) return '#4CAF50';  // Loyalists
  if (satisfaction >= satMidpoint && loyalty < loyMidpoint) return '#f59e0b';   // Mercenaries
  if (satisfaction < satMidpoint && loyalty >= loyMidpoint) return '#4682b4';   // Hostages
  return '#dc2626';  // Defectors
};
```

### Enhanced List Item Structure
```tsx
<li className="combination-item">
  <span 
    className="combination-marker"
    style={{ 
      backgroundColor: getPointColor(combo.satisfaction, combo.loyalty),
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: '8px',
      border: '1px solid rgba(0,0,0,0.1)'
    }} 
  />
  <div className="combination-text">
    <span className="combination-values">
      {combo.satisfaction}, {combo.loyalty}
    </span>
    <span className="combination-stats">
      ({combo.count} responses - {combo.percentage.toFixed(1)}%)
    </span>
  </div>
</li>
```

## Integration Examples

### Basic Integration with Real-time Updates
```tsx
import ResponseConcentrationSection from './components/ResponseConcentrationSection';
import { DEFAULT_SETTINGS } from './components/ResponseSettings/types';

const ReportingComponent = ({ data, isPremium }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [report, setReport] = useState(null);

  // Generate report with real-time capability
  useEffect(() => {
    const generateReport = async () => {
      const newReport = await generateDataReport(data, '1-5', '1-5');
      setReport(newReport);
    };
    generateReport();
  }, [data]);

  if (!report) return <div>Loading...</div>;

  return (
    <ResponseConcentrationSection
      report={report}
      settings={settings}
      onSettingsChange={setSettings}
      isPremium={isPremium}
      originalData={data}  // Enables real-time processing
    />
  );
};
```

### Advanced Integration with Custom Processing
```tsx
const AdvancedReportingComponent = ({ data, isPremium, customThreshold }) => {
  const [settings, setSettings] = useState({
    ...DEFAULT_SETTINGS,
    miniPlot: {
      ...DEFAULT_SETTINGS.miniPlot,
      showAverageDot: isPremium  // Premium feature
    }
  });

  // Custom combination processing
  const customProcessor = useCallback((data: DataPoint[]) => {
    return getEnhancedCombinations(data).filter(
      combo => combo.count >= customThreshold
    );
  }, [customThreshold]);

  return (
    <ResponseConcentrationSection
      report={report}
      settings={settings}
      onSettingsChange={setSettings}
      isP