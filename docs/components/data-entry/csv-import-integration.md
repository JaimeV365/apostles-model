# CSV Import Integration Guide

This guide provides instructions on how to integrate the CSV Import system into your application, with examples of common use cases and best practices.

## Basic Integration

### Step 1: Import the Component

```tsx
import { CSVImport, UploadHistoryItem } from '../components/data-entry/forms/CSVImport';
```

### Step 2: Prepare State Management

```tsx
import React, { useState } from 'react';
import { DataPoint, ScaleFormat } from '../types/base';

// State management for data points
const [data, setData] = useState<DataPoint[]>([]);

// State management for scales
const [scales, setScales] = useState<{
  satisfactionScale: ScaleFormat,
  loyaltyScale: ScaleFormat,
  isLocked: boolean
}>({
  satisfactionScale: '1-5',
  loyaltyScale: '1-5',
  isLocked: false
});

// State management for upload history
const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
```

### Step 3: Create Handler Functions

```tsx
// Handler for data import
const handleImport = (
  importedData: Array<{ 
    id: string; 
    name: string; 
    satisfaction: number; 
    loyalty: number;
    date?: string;
    email?: string;
    [key: string]: any;
  }>, 
  headerScales: { satisfaction: ScaleFormat, loyalty: ScaleFormat },
  overwrite?: boolean
) => {
  // Process imported data
  if (overwrite) {
    // Replace existing data
    setData(importedData);
  } else {
    // Append to existing data
    setData(prevData => [...prevData, ...importedData]);
  }
  
  // Lock scales if this is the first data
  if (data.length === 0) {
    setScales({
      satisfactionScale: headerScales.satisfaction,
      loyaltyScale: headerScales.loyalty,
      isLocked: true
    });
  }
  
  // Return IDs of imported data for tracking
  return importedData.map(item => item.id);
};

// Handler for import success
const handleUploadSuccess = (
  fileName: string, 
  count: number, 
  ids: string[], 
  wasOverwrite?: boolean
) => {
  // Update upload history
  setUploadHistory(prev => [{
    fileName,
    timestamp: new Date(),
    count,
    remainingCount: count,
    associatedIds: ids
  }, ...prev]);
  
  // Show success notification if you have a notification system
  // notificationSystem.show({...});
};
```

### Step 4: Integrate the Component

```tsx
<CSVImport
  onImport={handleImport}
  satisfactionScale={scales.satisfactionScale}
  loyaltyScale={scales.loyaltyScale}
  existingIds={data.map(item => item.id)}
  scalesLocked={scales.isLocked}
  uploadHistory={uploadHistory}
  onUploadSuccess={handleUploadSuccess}
/>
```

## Full Integration Example

Here's a more complete example showing how to integrate the CSV Import component within a parent module:

```tsx
import React, { useState, useEffect } from 'react';
import { CSVImport, UploadHistoryItem } from '../components/data-entry/forms/CSVImport';
import DataTable from '../components/DataTable';
import NotificationSystem from '../components/NotificationSystem';
import { DataPoint, ScaleFormat, HeaderScales } from '../types/base';
import { loadStoredData, saveStoredData } from '../utils/storage';

const DataModule: React.FC = () => {
  // State for data points
  const [data, setData] = useState<DataPoint[]>([]);
  
  // State for scales
  const [scales, setScales] = useState<{
    satisfactionScale: ScaleFormat,
    loyaltyScale: ScaleFormat,
    isLocked: boolean
  }>({
    satisfactionScale: '1-5',
    loyaltyScale: '1-5',
    isLocked: false
  });
  
  // State for upload history
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  
  // Load saved data on mount
  useEffect(() => {
    const savedState = loadStoredData();
    if (savedState) {
      setData(savedState.data || []);
      setScales({
        satisfactionScale: savedState.satisfactionScale || '1-5',
        loyaltyScale: savedState.loyaltyScale || '1-5',
        isLocked: savedState.data && savedState.data.length > 0
      });
      setUploadHistory(savedState.uploadHistory || []);
    }
  }, []);
  
  // Save data when it changes
  useEffect(() => {
    saveStoredData({
      data,
      satisfactionScale: scales.satisfactionScale,
      loyaltyScale: scales.loyaltyScale,
      uploadHistory
    });
  }, [data, scales, uploadHistory]);
  
  // Handle data import
  const handleImport = (
    importedData: DataPoint[], 
    headerScales: HeaderScales,
    overwrite?: boolean
  ) => {
    // Process based on import mode
    if (overwrite) {
      setData(importedData);
    } else {
      setData(prevData => [...prevData, ...importedData]);
    }
    
    // If first data import, set scales based on the file
    if (data.length === 0) {
      setScales({
        satisfactionScale: headerScales.satisfaction,
        loyaltyScale: headerScales.loyalty,
        isLocked: true
      });
    }
    
    // Return imported IDs for tracking
    return importedData.map(item => item.id);
  };
  
  // Handle successful upload
  const handleUploadSuccess = (
    fileName: string, 
    count: number, 
    ids: string[], 
    wasOverwrite?: boolean
  ) => {
    // Update upload history
    setUploadHistory(prev => [{
      fileName,
      timestamp: new Date(),
      count,
      remainingCount: count,
      associatedIds: ids
    }, ...prev]);
    
    // Show success notification
    NotificationSystem.show({
      type: 'success',
      title: 'Import Successful',
      message: `${count} entries ${wasOverwrite ? 'replaced' : 'added'} from ${fileName}`
    });
  };
  
  // Handle data point deletion
  const handleDeleteDataPoint = (id: string) => {
    setData(prevData => prevData.filter(item => item.id !== id));
    
    // Update upload history counts
    setUploadHistory(prev => 
      prev.map(item => ({
        ...item,
        remainingCount: item.associatedIds.includes(id)
          ? item.remainingCount - 1
          : item.remainingCount
      }))
    );
  };
  
  return (
    <div className="data-module">
      <h2>Data Management</h2>
      
      <div className="data-input-section">
        <h3>Import Data</h3>
        <CSVImport
          onImport={handleImport}
          satisfactionScale={scales.satisfactionScale}
          loyaltyScale={scales.loyaltyScale}
          existingIds={data.map(item => item.id)}
          scalesLocked={scales.isLocked}
          uploadHistory={uploadHistory}
          onUploadSuccess={handleUploadSuccess}
        />
      </div>
      
      {data.length > 0 && (
        <div className="data-display-section">
          <h3>Data Table</h3>
          <DataTable
            data={data}
            onDelete={handleDeleteDataPoint}
            onEdit={handleEditDataPoint}
            satisfactionScale={scales.satisfactionScale}
            loyaltyScale={scales.loyaltyScale}
          />
        </div>
      )}
    </div>
  );
};

export default DataModule;
```

## Best Practices

### 1. Scale Management

Handle scales appropriately to ensure data consistency:

```tsx
// Detect scales from first import
if (data.length === 0) {
  // Use scales from CSV file
  setScales({
    satisfactionScale: headerScales.satisfaction,
    loyaltyScale: headerScales.loyalty,
    isLocked: true
  });
} else {
  // Enforce existing scales for subsequent imports
  if (headerScales.satisfaction !== scales.satisfactionScale ||
      headerScales.loyalty !== scales.loyaltyScale) {
    // Show error or handle mismatch
    NotificationSystem.show({
      type: 'error',
      title: 'Scale Mismatch',
      message: 'CSV uses different scales than your existing data'
    });
    return false;
  }
}
```

### 2. Error Handling

Provide clear feedback for validation errors:

```tsx
// In parent component
const handleImportError = (error: string) => {
  NotificationSystem.show({
    type: 'error',
    title: 'Import Error',
    message: error
  });
};

// Then pass to CSVImport if needed
<CSVImport
  // other props
  onError={handleImportError}
/>
```

### 3. Upload History Tracking

Track upload history and maintain it across sessions:

```tsx
// Update history when data is deleted
const handleDeleteBatch = (fileName: string) => {
  const historyItem = uploadHistory.find(item => item.fileName === fileName);
  if (historyItem) {
    // Remove all data associated with this file
    setData(prevData => 
      prevData.filter(item => !historyItem.associatedIds.includes(item.id))
    );
    
    // Update history item
    setUploadHistory(prev => 
      prev.map(item => 
        item.fileName === fileName 
          ? { ...item, remainingCount: 0 }
          : item
      )
    );
  }
};
```

### 4. Advanced Integration with Conflation

Merge data for duplicate IDs rather than replacing or rejecting:

```tsx
const handleImport = (
  importedData: DataPoint[], 
  headerScales: HeaderScales,
  overwrite?: boolean
) => {
  if (overwrite) {
    // Complete replacement
    setData(importedData);
  } else {
    // Conflation logic - merge duplicates by ID
    const existingDataMap = new Map(data.map(item => [item.id, item]));
    
    // Process each imported item
    importedData.forEach(newItem => {
      if (existingDataMap.has(newItem.id)) {
        // Merge with existing data - prioritize new values where present
        const existingItem = existingDataMap.get(newItem.id)!;
        existingDataMap.set(newItem.id, {
          ...existingItem,
          ...newItem,
          // Optional: preserve specific fields from existing data
          notes: existingItem.notes || newItem.notes
        });
      } else {
        // New item - just add to map
        existingDataMap.set(newItem.id, newItem);
      }
    });
    
    // Convert map back to array
    setData(Array.from(existingDataMap.values()));
  }
  
  // Rest of the import handling...
};
```

### 5. Data Persistence

Ensure imported data is persisted across sessions:

```tsx
// Save to local storage after import
useEffect(() => {
  if (data.length > 0) {
    localStorage.setItem('appData', JSON.stringify({
      data,
      scales,
      uploadHistory
    }));
  }
}, [data, scales, uploadHistory]);

// Load on component mount
useEffect(() => {
  const savedData = localStorage.getItem('appData');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      setData(parsed.data || []);
      setScales(parsed.scales || defaultScales);
      setUploadHistory(parsed.uploadHistory || []);
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }
}, []);
```

## Handling Special Cases

### 1. Custom Field Mapping

If you need custom field mapping for specific CSV formats:

```tsx
const customFieldMap = {
  'Customer ID': 'id',
  'Full Name': 'name',
  'Satisfaction Score': 'satisfaction',
  'Loyalty Rating': 'loyalty',
  'Customer Email': 'email'
};

<CSVImport
  // other props
  fieldMapping={customFieldMap}
/>
```

### 2. Progress Reporting for Large Files

For handling progress feedback with large files:

```tsx
const handleProgressUpdate = (progress: number, stage: string) => {
  setImportProgress({
    percent: progress,
    stage
  });
};

<CSVImport
  // other props
  onProgressUpdate={handleProgressUpdate}
/>
```

### 3. Data Transformation

If you need to transform data before storage:

```tsx
const handleImport = (
  importedData: any[], 
  headerScales: HeaderScales,
  overwrite?: boolean
) => {
  // Transform data before storing
  const transformedData = importedData.map(item => ({
    ...item,
    // Add derived fields
    group: determineGroup(item.satisfaction, item.loyalty),
    score: calculateScore(item.satisfaction, item.loyalty),
    // Format or standardize values
    name: item.name.trim(),
    email: item.email?.toLowerCase(),
    // Add metadata
    importDate: new Date().toISOString()
  }));
  
  // Process transformed data
  if (overwrite) {
    setData(transformedData);
  } else {
    setData(prevData => [...prevData, ...transformedData]);
  }
  
  // Return transformed IDs
  return transformedData.map(item => item.id);
};
```

## Troubleshooting

### Common Issues and Solutions

1. **Scale Mismatch**
   - **Issue**: "Scale mismatch" error when importing data
   - **Solution**: Ensure CSV headers include scale information (e.g., "Satisfaction:1-5")

2. **Empty Import Results**
   - **Issue**: No data imported from seemingly valid CSV
   - **Solution**: Check for template rows or metadata rows with "OPTIONAL"/"REQUIRED" text

3. **Date Format Issues**
   - **Issue**: Dates being rejected or formatted incorrectly
   - **Solution**: Include date format in header (e.g., "Date(dd/mm/yyyy)")

4. **Duplicate Detection Problems**
   - **Issue**: Duplicates not being detected
   - **Solution**: Ensure ID fields are consistently formatted and normalized

5. **Performance Issues**
   - **Issue**: Large file imports are slow or crash the browser
   - **Solution**: Consider server-side processing for very large files (>10MB)
