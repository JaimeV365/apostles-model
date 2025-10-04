# State Flow Documentation

## Overview
This document details how data and state flow through the Apostles Model application.

## Core State Types

### Data State
```typescript
interface DataState {
  points: DataPoint[];
  scales: ScaleState;
  uploadHistory: UploadHistoryItem[];
}

interface ScaleState {
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  isLocked: boolean;
}
```

## State Flow Diagram
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Data Entry    │ ──► │  State Manager  │ ──► │  Visualization  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       │                        │
        │                       ▼                        ▼
        │                ┌─────────────────┐     ┌─────────────────┐
        └────────────── │  Local Storage  │     │    UI State     │
                        └─────────────────┘     └─────────────────┘
```

## Data Flow

### 1. Data Entry Flow
```typescript
// Manual Entry
const handleDataSubmit = (newPoint: DataPoint) => {
  validateData(newPoint);
  updateScales(newPoint);
  saveToState(newPoint);
  updateStorage();
};

// CSV Import
const handleCSVImport = (data: DataPoint[]) => {
  validateBatch(data);
  updateScalesFromBatch(data);
  saveToState(data);
  updateStorage();
};
```

### 2. Scale Management Flow
```typescript
const handleScaleChange = (
  scale: ScaleFormat,
  type: 'satisfaction' | 'loyalty'
) => {
  validateScaleTransition(scale, type);
  updateScale(scale, type);
  lockScales();
  updateVisualization();
};
```

### 3. Visualization Flow
```typescript
const updateVisualization = () => {
  calculateDimensions();
  updatePositions();
  updateZones();
  refreshDisplay();
};
```

## State Updates

### Component State Updates
```typescript
// Direct updates
setState(newValue);

// Batch updates
ReactDOM.unstable_batchedUpdates(() => {
  setState1(newValue1);
  setState2(newValue2);
});
```

### Persistent State Updates
```typescript
const updatePersistentState = () => {
  const newState = {
    data: currentData,
    scales: currentScales,
    history: uploadHistory
  };
  
  storageManager.saveState(newState);
};
```

## State Recovery

### Loading Saved State
```typescript
const loadSavedState = async () => {
  const saved = await storageManager.loadState();
  if (saved && validateState(saved)) {
    restoreState(saved);
  }
};
```

### State Synchronization
```typescript
const synchronizeState = () => {
  synchronizeData();
  synchronizeScales();
  synchronizeHistory();
  validateStateConsistency();
};
```

## Error Handling

### State Error Recovery
```typescript
const handleStateError = async (error: StateError) => {
  logError(error);
  await backupCurrentState();
  await attemptStateRecovery();
  notifyUser(error);
};
```

## State Dependencies

### Component Dependencies
```typescript
// DataEntryModule depends on:
- ScaleState
- DataState
- UploadHistory

// Visualization depends on:
- DataState
- ScaleState
- UIState
```

### State Initialization
```typescript
const initializeState = () => {
  initializeScales();
  initializeData();
  initializeHistory();
  validateInitialState();
};
```

## Best Practices

### State Management
- Validate state changes
- Batch related updates
- Maintain consistency
- Handle errors gracefully

### Data Flow
- Follow unidirectional flow
- Validate input data
- Maintain scale constraints
- Update persistent storage

### Performance
- Optimize state updates
- Minimize state changes
- Use appropriate structures
- Cache calculated values

## Common Patterns

### State Updates
```typescript
// Atomic updates
const updateSingle = (id: string, changes: Partial<DataPoint>) => {
  setData(prev => prev.map(point =>
    point.id === id ? { ...point, ...changes } : point
  ));
};

// Batch updates
const updateBatch = (changes: Array<[string, Partial<DataPoint>]>) => {
  setData(prev => {
    const updated = [...prev];
    changes.forEach(([id, change]) => {
      const index = updated.findIndex(p => p.id === id);
      if (index !== -1) {
        updated[index] = { ...updated[index], ...change };
      }
    });
    return updated;
  });
};
```

## Notes
- Monitor state consistency
- Log state changes
- Handle edge cases
- Document state constraints
- Test state flows
- Maintain error recovery