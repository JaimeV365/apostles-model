import { DataPoint } from '@/types/base';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicate?: DataPoint;
  reason?: string;
}

export interface DuplicateCheckOptions {
  existingData: DataPoint[];
  excludedId?: string; // ID to exclude from comparison (e.g., currently editing)
}

export const DuplicateCheckService = {
  checkForDuplicates: (
    newDataPoint: DataPoint,
    options: DuplicateCheckOptions
  ): DuplicateCheckResult => {
    const { existingData, excludedId } = options;
    
    // Normalize new data point values
    const normalizedNewName = newDataPoint.name?.trim() || '';
    const normalizedNewEmail = newDataPoint.email?.trim().toLowerCase() || '';
    const normalizedNewDate = newDataPoint.date?.trim() || '';
    
    const duplicate = existingData.find(existing => {
      // Skip comparing to self when editing (using ID)
      if (excludedId && existing.id === excludedId) return false;
      
      // Different ID check (if same ID and not excluded, it's a duplicate)
      if (existing.id === newDataPoint.id) return true;
      
      // Normalize existing values
      const normalizedExistingName = existing.name?.trim() || '';
      const normalizedExistingEmail = existing.email?.trim().toLowerCase() || '';
      const normalizedExistingDate = existing.date?.trim() || '';

      // Check if there's at least one substantive match (non-empty values that match)
      const hasSubstantiveNameMatch = normalizedExistingName !== '' && 
                                     normalizedNewName !== '' && 
                                     normalizedExistingName === normalizedNewName;
                                  
      const hasSubstantiveEmailMatch = normalizedExistingEmail !== '' && 
                                      normalizedNewEmail !== '' && 
                                      normalizedExistingEmail === normalizedNewEmail;
                                  
      const hasSubstantiveDateMatch = normalizedExistingDate !== '' && 
                                     normalizedNewDate !== '' && 
                                     normalizedExistingDate === normalizedNewDate;
      
      const hasAnySubstantiveMatch = hasSubstantiveNameMatch || 
                                    hasSubstantiveEmailMatch || 
                                    hasSubstantiveDateMatch;
      
      // It's a duplicate if there's at least one substantive match
      return hasAnySubstantiveMatch;
    });

    if (duplicate) {
      let reason = '';
      
      // Find the reason for duplication (which field actually had non-empty matching values)
      const normalizedExistingName = duplicate.name?.trim() || '';
      const normalizedExistingEmail = duplicate.email?.trim().toLowerCase() || '';
      const normalizedExistingDate = duplicate.date?.trim() || '';
      
      if (normalizedExistingEmail !== '' && normalizedNewEmail !== '' && 
          normalizedExistingEmail === normalizedNewEmail) {
        reason = 'email';
      } else if (normalizedExistingName !== '' && normalizedNewName !== '' && 
                normalizedExistingName === normalizedNewName) {
        reason = 'name';
      } else if (normalizedExistingDate !== '' && normalizedNewDate !== '' && 
                normalizedExistingDate === normalizedNewDate) {
        reason = 'date';
      } else if (duplicate.id === newDataPoint.id) {
        reason = 'id';
      } else {
        // Fallback
        reason = 'matching data values'; 
      }
      
      return {
        isDuplicate: true,
        duplicate,
        reason
      };
    }

    return { isDuplicate: false };
  }
};

export default DuplicateCheckService;