# Response Concentration Types Documentation

Save this file at: `/docs/types/reporting/response-concentration.md`

## Overview
This document details all TypeScript types and interfaces used throughout the Response Concentration section of the application.

## Core Types Location
```
/components/reporting/types/
└── index.ts
```

## Data Structure Types

### Statistics Data
```typescript
interface StatisticsData {
  /** Average value */
  average: number;

  /** Median value */
  median: number;

  /** Most common value */
  mode: number;

  /** Maximum value in dataset */
  max: number;

  /** Count of maximum value occurrences */
  maxCount: number;

  /** Minimum value in dataset */
  min: number;

  /** Count of minimum value occurrences */
  minCount: number;

  /** Distribution record mapping values to their frequency */
  distribution: Record<number, number>;
}
```

### Response Combination
```typescript
interface ResponseCombination {
  /** Satisfaction score */
  satisfaction: number;

  /** Loyalty score */
  loyalty: number;

  /** Number of occurrences */
  count: number;

  /** Percentage of total responses */
  percentage: number;
}
```

## Settings Types

### Response Concentration Settings
```typescript
interface ResponseConcentrationSettings {
  /** MiniPlot visualization settings */
  miniPlot: MiniPlotSettings;

  /** Response list settings */
  list: ListSettings;

  /** Dial visualization settings */
  dial: DialSettings;
}

interface MiniPlotSettings {
  /** Whether to use quadrant-based colors */
  useQuadrantColors: boolean;

  /** Custom color configuration */
  customColors: {
    /** Default color for all points */
    default?: string;
  };
}

interface ListSettings {
  /** Whether to use color coding for responses */
  useColorCoding: boolean;

  /** Maximum number of items to display */
  maxItems: number;
}

interface DialSettings {
  /** Minimum value for dial scale */
  minValue: number;

  /** Maximum value for dial scale */
  maxValue: number;

  /** Custom colors for dial elements */
  customColors: {
    /** Color for satisfaction dial */
    satisfaction: string;

    /** Color for loyalty dial */
    loyalty: string;
  };
}
```

## Component Props Types

### Response Concentration Section
```typescript
interface ResponseConcentrationProps {
  /** Report data containing all statistics */
  report: DataReport;

  /** Current settings configuration */
  settings: ResponseConcentrationSettings;

  /** Settings change handler */
  onSettingsChange: (settings: ResponseConcentrationSettings) => void;

  /** Premium mode flag */
  isPremium: boolean;
}
```

### MiniPlot Component
```typescript
interface MiniPlotProps {
  /** Array of response combinations to display */
  combinations: ResponseCombination[];

  /** Scale format for satisfaction axis */
  satisfactionScale: string;

  /** Scale format for loyalty axis */
  loyaltyScale: string;

  /** Optional: Whether to use quadrant colors */
  useQuadrantColors?: boolean;

  /** Optional: Custom colors configuration */
  customColors?: Record<string, string>;
}
```

### Combination Dial
```typescript
interface CombinationDialProps {
  /** Statistics data for visualization */
  statistics: {
    satisfaction: StatisticsData;
    loyalty: StatisticsData;
  };

  /** Total number of entries */
  totalEntries: number;

  /** Optional: Premium mode flag */
  isPremium?: boolean;

  /** Optional: Minimum value for dial scale */
  minValue?: number;

  /** Optional: Maximum value for dial scale */
  maxValue?: number;

  /** Optional: Custom colors for dials */
  customColors?: {
    satisfaction: string;
    loyalty: string;
  };
}
```

## Utility Types

### Color Configuration
```typescript
type ColorConfig = {
  /** Hex color code */
  value: string;

  /** Optional label for the color */
  label?: string;
};

type ColorPalette = Record<string, ColorConfig>;

/** Standard color palette used across components */
const colorPalette: ColorPalette = {
  green: { value: '#3a863e', label: 'Brand green' },
  red: { value: '#dc2626', label: 'Red' },
  yellow: { value: '#ffef00', label: 'Yellow' },
  blue: { value: '#4682b4', label: 'Blue' },
  purple: { value: '#8b5cf6', label: 'Purple' },
  pink: { value: '#ec4899', label: 'Pink' },
  gray: { value: '#78716c', label: 'Warm gray' },
  orange: { value: '#f59e0b', label: 'Orange' }
};
```

### Scale Types
```typescript
type ScaleFormat = '1-5' | '1-7' | '1-10';

interface ScaleConfig {
  /** Minimum scale value */
  min: number;

  /** Maximum scale value */
  max: number;

  /** Scale step size */
  step: number;
}
```

## Type Guards

### Settings Validation
```typescript
function isValidSettings(settings: unknown): settings is ResponseConcentrationSettings {
  const s = settings as ResponseConcentrationSettings;
  return (
    s &&
    typeof s === 'object' &&
    'miniPlot' in s &&
    'list' in s &&
    'dial' in s &&
    typeof s.miniPlot.useQuadrantColors === 'boolean' &&
    typeof s.list.maxItems === 'number' &&
    typeof s.dial.minValue === 'number' &&
    typeof s.dial.maxValue === 'number'
  );
}
```

### Color Validation
```typescript
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function isValidCustomColors(colors: unknown): colors is Record<string, string> {
  if (typeof colors !== 'object' || !colors) return false;
  return Object.values(colors).every(color => 
    typeof color === 'string' && isValidHexColor(color)
  );
}
```

## Default Values

### Default Settings
```typescript
const DEFAULT_SETTINGS: ResponseConcentrationSettings = {
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
```

## Type Extensions

### Component-Specific Extensions
```typescript
interface ExtendedMiniPlotProps extends MiniPlotProps {
  /** Additional premium features */
  premiumFeatures?: {
    /** Enable hover tooltips */
    enableTooltips?: boolean;
    /** Enable click interactions */
    enableInteractions?: boolean;
    /** Custom point size calculation */
    pointSizeCalculator?: (count: number, total: number) => number;
  };
}

interface ExtendedDialProps extends CombinationDialProps {
  /** Additional premium features */
  premiumFeatures?: {
    /** Enable animation */
    enableAnimation?: boolean;
    /** Custom scale formatter */
    scaleFormatter?: (value: number) => string;
    /** Transition duration in ms */
    transitionDuration?: number;
  };
}
```

## Utility Function Types

### Event Handlers
```typescript
type SettingsChangeHandler = (
  section: keyof ResponseConcentrationSettings,
  key: string,
  value: any
) => void;

type ColorChangeHandler = (
  metric: 'satisfaction' | 'loyalty',
  color: string
) => void;
```

### Data Transformers
```typescript
type DataTransformer = (
  data: ResponseCombination[]
) => {
  values: number[];
  labels: string[];
  colors: string[];
};

type ScaleTransformer = (
  value: number,
  fromScale: ScaleFormat,
  toScale: ScaleFormat
) => number;
```

## Notes

### Type Usage Best Practices
1. Always use strict type checking (`strictNullChecks: true`)
2. Prefer interfaces for objects that can be implemented
3. Use type for unions and complex types
4. Use const assertions for literal types
5. Include JSDoc comments for complex types

### Version Compatibility
- TypeScript version: 4.8.0 or higher
- React version: 18.0.0 or higher
- Ensure all imported types are from compatible versions

### Type Safety Considerations
1. Use type guards for runtime checking
2. Implement proper error boundaries
3. Validate all external data
4. Handle null and undefined cases
5. Use discriminated unions for complex state