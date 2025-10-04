# Component Props Documentation

## Overview
Defines the prop interfaces for all major components in the Apostles Model application.

## Data Entry Props

### DataEntryModuleProps
```typescript
interface DataEntryModuleProps {
  /** Data change handler */
  onDataChange: (data: DataPoint[], headerScales?: HeaderScales) => void;
  
  /** Current satisfaction scale */
  satisfactionScale: ScaleFormat;
  
  /** Current loyalty scale */
  loyaltyScale: ScaleFormat;
  
  /** External data array */
  data?: DataPoint[];
  
  /** Secret code handler */
  onSecretCode?: (code: string) => void;
}
```

### CSVImportProps
```typescript
interface CSVImportProps {
  /** Import handler */
  onImport: (data: Array<DataPoint>, headerScales: HeaderScales) => string[];
  
  /** Current scales */
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  
  /** Existing IDs */
  existingIds: string[];
  
  /** Scale lock status */
  scalesLocked: boolean;
  
  /** Upload history */
  uploadHistory: UploadHistoryItem[];
  
  /** Success handler */
  onUploadSuccess: (fileName: string, count: number, ids: string[]) => void;
}
```

## Visualization Props

### QuadrantChartProps
```typescript
interface QuadrantChartProps {
  /** Data points */
  data: DataPoint[];
  
  /** Scale formats */
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  
  /** Display options */
  isClassicModel: boolean;
  showNearApostles: boolean;
  showLabels: boolean;
  showGrid: boolean;
  hideWatermark: boolean;
  
  /** Feature flags */
  showAdvancedFeatures: boolean;
  activeEffects: Set<string>;
  
  /** Frequency controls */
  frequencyFilterEnabled: boolean;
  frequencyThreshold: number;
  
  /** Midpoint adjustment */
  isAdjustableMidpoint: boolean;
  
  /** Event handlers */
  onIsClassicModelChange: (isClassic: boolean) => void;
  onShowNearApostlesChange: (show: boolean) => void;
  onShowLabelsChange: (show: boolean) => void;
  onShowGridChange: (show: boolean) => void;
  onFrequencyFilterEnabledChange: (enabled: boolean) => void;
  onFrequencyThresholdChange: (threshold: number) => void;
  onIsAdjustableMidpointChange: (adjustable: boolean) => void;
}
```

## UI Component Props

### InputFieldProps
```typescript
interface InputFieldProps {
  /** Field value */
  value: string;
  
  /** Change handler */
  onChange: (value: string) => void;
  
  /** Placeholder text */
  placeholder: string;
  
  /** Error message */
  error?: string;
  
  /** Input type */
  type?: 'text' | 'number';
  
  /** Number constraints */
  min?: number;
  max?: number;
  
  /** Dropdown options */
  dropdownOptions?: string[];
  
  /** Dropdown handlers */
  onDropdownSelect?: (value: string) => void;
  forceCloseDropdown?: boolean;
}
```

### CardProps
```typescript
interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}
```

## Utility Props

### NotificationProps
```typescript
interface NotificationProps {
  /** Notification data */
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface NotificationContextProps {
  showNotification: (notification: Omit<NotificationProps, 'id'>) => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}
```

## Type Relationships
- DataEntryModuleProps -> DataPoint
- QuadrantChartProps -> ScaleFormat
- InputFieldProps -> ValidationRules

## Usage Guidelines

### Prop Validation
- Type checking
- Required props
- Default values
- Prop constraints

### Event Handlers
- Type safety
- Error handling
- Event bubbling
- State updates

### Children Props
- Type constraints
- Render props
- Component composition
- Slot patterns

## Notes
- Optional props
- Prop defaults
- Type inheritance
- Interface extensions