# ID Counter Utility

## Overview
The IdCounter utility manages unique identifier generation and tracking for data points in the application.

## Core Functions

### getNextId
```typescript
function getNextId(): string;
```
Generates next unique identifier.

### reset
```typescript
function reset(): void;
```
Resets counter state.

## Implementation
```typescript
class IdCounter {
  private static instance: IdCounter;
  private counter: number;

  public static getInstance(): IdCounter {
    if (!IdCounter.instance) {
      IdCounter.instance = new IdCounter();
    }
    return IdCounter.instance;
  }

  public getNextId(): string {
    const id = `ID-${String(this.counter).padStart(7, '0')}`;
    this.counter++;
    this.saveState();
    return id;
  }
}
```

## Usage Example
```typescript
const idCounter = IdCounter.getInstance();
const newId = idCounter.getNextId();
```

## State Management
- Persistent counter
- State recovery
- Counter synchronization
- Reset handling

## Error Handling
- Duplicate prevention
- Storage failures
- State corruption
- Counter overflow