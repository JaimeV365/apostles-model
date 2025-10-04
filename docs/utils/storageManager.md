# Storage Manager Utility

## Overview
The StorageManager utility handles persistent storage operations, including data saving, loading, and state management using localStorage.

## Core Functions

### saveState
```typescript
function saveState(state: Partial<StorageState>): void;
```
Saves current state to localStorage.

### loadState
```typescript
function loadState(): Partial<StorageState> | null;
```
Loads saved state from localStorage.

### clearState
```typescript
function clearState(): void;
```
Clears saved state.

## Interface
```typescript
interface StorageState {
  data: DataPoint[];
  uploadHistory: UploadHistoryItem[];
  scales: ScaleState;
  lastUpdated: string;
}
```

## Usage Example
```typescript
const storageManager = StorageManager.getInstance();

// Save state
storageManager.saveState({
  data: currentData,
  scales: currentScales
});

// Load state
const savedState = storageManager.loadState();
```

## Error Handling
- Storage availability
- Data validation
- Version conflicts
- Corruption handling

## Migration Strategy
- Version management
- Data structure updates
- Backward compatibility
- State recovery