import { useState } from 'react';
import { DataPoint } from '@/types/base';
import DuplicateCheckService from '../services/DuplicateCheckService';

export interface DuplicateData {
  existing: DataPoint;
  new: DataPoint;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicate?: DataPoint;
  reason?: string;
}

export const useDuplicateCheck = (existingData: DataPoint[]) => {
  const [duplicateData, setDuplicateData] = useState<DuplicateData | null>(null);

  const checkForDuplicates = (newDataPoint: DataPoint, excludedId?: string): DuplicateCheckResult => {
    // Use the DuplicateCheckService to check for duplicates
    return DuplicateCheckService.checkForDuplicates(newDataPoint, {
      existingData,
      excludedId
    });
  };

  return {
    duplicateData,
    setDuplicateData,
    checkForDuplicates
  };
};