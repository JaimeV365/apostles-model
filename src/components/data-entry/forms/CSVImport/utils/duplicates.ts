import { DataPoint } from '@/types/base';
import { DuplicateReport } from '../types';

export const detectDuplicates = (newData: any[], existingData: DataPoint[]): DuplicateReport => {
  console.log('Running duplicate detection on', newData.length, 'rows');
  
  if (newData.length === 0) {
    return { count: 0, items: [] };
  }
  
  // Extract just the IDs for ID-based duplicate detection
  const existingIds = existingData.map(item => item.id);
  
  // Create a map to track all reasons for each row by ID
  const duplicateMap = new Map<string, { item: any, reasons: Set<string> }>();
  
  // Check for duplicate IDs within the file
  const idsInFile = newData.filter(row => row.id).map(row => row.id);
  const uniqueIds = new Set<string>();
  const duplicateIds = new Set<string>();
  
  // Find duplicated IDs within this import
  idsInFile.forEach(id => {
    if (uniqueIds.has(id)) {
      duplicateIds.add(id);
    } else {
      uniqueIds.add(id);
    }
  });
  
  console.log('Found duplicate IDs within file:', Array.from(duplicateIds));
  
  // Add all instances of duplicated IDs to the map
  duplicateIds.forEach(dupId => {
    const items = newData.filter(row => row.id === dupId);
    items.forEach(item => {
      const id = item.id || `noID-${Math.random().toString(36).substring(2, 9)}`;
      if (!duplicateMap.has(id)) {
        duplicateMap.set(id, { item, reasons: new Set() });
      }
      duplicateMap.get(id)?.reasons.add('Duplicate ID within imported file');
    });
  });
  
  // Check for IDs that already exist in the system
  if (existingIds.length > 0) {
    // Get the count of matching IDs between this file and existing data
    const matchingIds = idsInFile.filter(id => existingIds.includes(id));
    console.log('Found existing IDs:', matchingIds.length);
    
    // If ALL IDs match existing ones (re-upload of same file or similar), flag all as duplicates
    if (matchingIds.length === idsInFile.length && idsInFile.length > 0) {
      console.log('All IDs match existing ones');
      idsInFile.forEach(id => {
        const item = newData.find(row => row.id === id);
        if (item) {
          const itemId = item.id || `noID-${Math.random().toString(36).substring(2, 9)}`;
          if (!duplicateMap.has(itemId)) {
            duplicateMap.set(itemId, { item, reasons: new Set() });
          }
          duplicateMap.get(itemId)?.reasons.add('ID already exists in system');
        }
      });
    } else {
      // Normal case - just add individual matching IDs
      const conflictingIds = matchingIds;
      
      conflictingIds.forEach(id => {
        const item = newData.find(row => row.id === id);
        if (item) {
          const itemId = item.id || `noID-${Math.random().toString(36).substring(2, 9)}`;
          if (!duplicateMap.has(itemId)) {
            duplicateMap.set(itemId, { item, reasons: new Set() });
          }
          duplicateMap.get(itemId)?.reasons.add('ID already exists in system');
        }
      });
    }
  }
  
  // Add email duplicate detection
  // Create a map of all emails for quick lookup within this file
  const emailMap = new Map<string, any[]>();
  
  // First gather all emails in this import
  newData.forEach(row => {
    if (row.email) {
      const email = row.email.toLowerCase().trim();
      if (!emailMap.has(email)) {
        emailMap.set(email, []);
      }
      emailMap.get(email)?.push(row);
    }
  });
  
  // Check for duplicate emails
  emailMap.forEach((rows, email) => {
    if (rows.length > 1) {
      // Duplicates within this import
      rows.forEach(row => {
        const itemId = row.id || `noID-${Math.random().toString(36).substring(2, 9)}`;
        if (!duplicateMap.has(itemId)) {
          duplicateMap.set(itemId, { item: row, reasons: new Set() });
        }
        duplicateMap.get(itemId)?.reasons.add(`Duplicate email (${email})`);
      });
    }
  });
  
  // Add name duplicate detection
  // Create a map of all names for quick lookup within this file
  const nameMap = new Map<string, any[]>();
  
  // First gather all names in this import
  newData.forEach(row => {
    if (row.name) {
      const name = row.name.toLowerCase().trim();
      if (!nameMap.has(name)) {
        nameMap.set(name, []);
      }
      nameMap.get(name)?.push(row);
    }
  });
  
  // Check for duplicate names
  nameMap.forEach((rows, name) => {
    if (rows.length > 1) {
      // Duplicates within this import
      rows.forEach(row => {
        const itemId = row.id || `noID-${Math.random().toString(36).substring(2, 9)}`;
        if (!duplicateMap.has(itemId)) {
          duplicateMap.set(itemId, { item: row, reasons: new Set() });
        }
        duplicateMap.get(itemId)?.reasons.add(`Duplicate name (${name})`);
      });
    }
  });
  
  // Add NEW CODE: Check for name duplicates against existing data
  // Check new data against existing names
  newData.forEach(newItem => {
    if (newItem.name) {
      const normalizedName = newItem.name.toLowerCase().trim();
      
      // Check against existing data names
      existingData.forEach(existingItem => {
        if (existingItem.name && 
            existingItem.name.toLowerCase().trim() === normalizedName) {
          // It's a duplicate name with existing data
          const itemId = newItem.id || `noID-${Math.random().toString(36).substring(2, 9)}`;
          if (!duplicateMap.has(itemId)) {
            duplicateMap.set(itemId, { item: newItem, reasons: new Set() });
          }
          duplicateMap.get(itemId)?.reasons.add(`Duplicate name (${newItem.name})`);
        }
      });
    }
  });
  
  // Add NEW CODE: Check for email duplicates against existing data
  // Check new data against existing emails
  newData.forEach(newItem => {
    if (newItem.email) {
      const normalizedEmail = newItem.email.toLowerCase().trim();
      
      // Check against existing data emails
      existingData.forEach(existingItem => {
        if (existingItem.email && 
            existingItem.email.toLowerCase().trim() === normalizedEmail) {
          // It's a duplicate email with existing data
          const itemId = newItem.id || `noID-${Math.random().toString(36).substring(2, 9)}`;
          if (!duplicateMap.has(itemId)) {
            duplicateMap.set(itemId, { item: newItem, reasons: new Set() });
          }
          duplicateMap.get(itemId)?.reasons.add(`Duplicate email (${newItem.email})`);
        }
      });
    }
  });
  
  // Convert the map to the expected output format
  const duplicates: Array<{ id: string; name: string; reason: string }> = [];
  duplicateMap.forEach((entry, id) => {
    duplicates.push({
      id,
      name: entry.item.name || 'Unnamed',
      reason: Array.from(entry.reasons).join(', ')
    });
  });
  
  const result = {
    count: duplicates.length,
    items: duplicates
  };
  
  console.log('Final duplicate report:', result);
  return result;
};

export const generateDuplicateCSV = (duplicates: DuplicateReport): void => {
  // Enhanced CSV with more fields
  const header = 'ID,Name,Email,Reason\n';
  const rows = duplicates.items.map(item => {
    // Get email from the reason if it contains an email
    const emailMatch = item.reason.match(/Duplicate email \((.*?)\)/);
    const email = emailMatch ? emailMatch[1] : '';
    
    return `"${item.id}","${item.name}","${email}","${item.reason}"`;
  }).join('\n');
  
  const content = header + rows;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'segmentor_duplicate_records.csv');  // With segmentor prefix
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating duplicate CSV:', error);
  }
};