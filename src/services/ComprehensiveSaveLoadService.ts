import { ApostlesSaveData } from '../types/save-export';
import { saveExportService } from './SaveExportService';

// This service handles comprehensive save/load operations
// It needs to be called from components that have access to all the context data

export interface SaveLoadService {
  saveComprehensiveProgress: (saveData: ApostlesSaveData) => Promise<void>;
  loadComprehensiveProgress: (file: File) => Promise<ApostlesSaveData>;
  createSaveData: (params: CreateSaveDataParams) => ApostlesSaveData;
}

export interface CreateSaveDataParams {
  // Core Data
  data: any[];
  manualAssignments: Map<string, string>;
  satisfactionScale: string;
  loyaltyScale: string;
  
  // Chart Configuration
  midpoint: { sat: number; loy: number };
  apostlesZoneSize: number;
  terroristsZoneSize: number;
  isClassicModel: boolean;
  
  // UI State
  showGrid: boolean;
  showScaleNumbers: boolean;
  showLegends: boolean;
  showNearApostles: boolean;
  showSpecialZones: boolean;
  isAdjustableMidpoint: boolean;
  labelMode: number;
  labelPositioning: 'above-dots' | 'below-dots';
  areasDisplayMode: number;
  frequencyFilterEnabled: boolean;
  frequencyThreshold: number;
  
  // Filter State (Enhanced)
  filterState?: {
    dateRange: {
      startDate: Date | null;
      endDate: Date | null;
      preset?: string;
    };
    attributes: Array<{
      field: string;
      values: Set<string | number>;
      availableValues?: Array<{
        value: string | number;
        count: number;
      }>;
      expanded?: boolean;
    }>;
    isActive: boolean;
  };
  
  // Premium
  isPremium?: boolean;
  effects?: Set<string>;
}

class ComprehensiveSaveLoadServiceImpl implements SaveLoadService {
  
  /**
   * Create comprehensive save data from all current state
   */
  createSaveData(params: CreateSaveDataParams): ApostlesSaveData {
    // Debug logging
    console.log('🔍 ComprehensiveSaveLoadService createSaveData - Filter state:', {
      hasFilterState: !!params.filterState,
      filterState: params.filterState,
      midpoint: params.midpoint,
      manualAssignmentsSize: params.manualAssignments.size
    });
    
    // Convert manual assignments Map to array
    const manualAssignmentsArray = Array.from(params.manualAssignments.entries()).map(
      ([pointId, quadrant]) => ({ pointId, quadrant })
    );

    // Create a set of reassigned point IDs for quick lookup
    const reassignedPointIds = new Set(manualAssignmentsArray.map(ma => ma.pointId));

    // Build headers dynamically based on available data
    const headers: any = {
      satisfaction: params.satisfactionScale,
      loyalty: params.loyaltyScale,
      group: 'text',
      excluded: 'boolean',
      reassigned: 'boolean'
    };

    // Add optional headers if they exist in the data
    const samplePoint = params.data[0];
    if (samplePoint?.email) headers.email = 'text';
    if (samplePoint?.date) headers.date = 'date';
    if (samplePoint?.dateFormat) headers.dateFormat = 'text';

    // Add additional attributes as columns
    if (samplePoint?.additionalAttributes) {
      Object.keys(samplePoint.additionalAttributes).forEach(key => {
        headers[key] = 'text'; // Default to text type
      });
    }

    // Build rows with all data flattened
    const rows = params.data.map(point => {
      const row: any = {
        id: point.id,
        name: point.name,
        satisfaction: point.satisfaction,
        loyalty: point.loyalty,
        group: point.group || 'Default',
        excluded: point.excluded || false,
        reassigned: reassignedPointIds.has(point.id)
      };

      // Add optional fields
      if (point.email) row.email = point.email;
      if (point.date) row.date = point.date;
      if (point.dateFormat) row.dateFormat = point.dateFormat;

      // Flatten additional attributes
      if (point.additionalAttributes) {
        Object.entries(point.additionalAttributes).forEach(([key, value]) => {
          row[key] = value;
        });
      }

      return row;
    });

    return {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      fileName: saveExportService.getDefaultFileName(),
      
      // Part 1: Data Table (CSV-like structure)
      dataTable: {
        headers,
        rows
      },
      
      // Part 2: Context/Settings
      context: {
        manualAssignments: manualAssignmentsArray,
        
        chartConfig: {
          midpoint: params.midpoint,
          apostlesZoneSize: params.apostlesZoneSize,
          terroristsZoneSize: params.terroristsZoneSize,
          isClassicModel: params.isClassicModel
        },
        
        uiState: {
          showGrid: params.showGrid,
          showScaleNumbers: params.showScaleNumbers,
          showLegends: params.showLegends,
          showNearApostles: params.showNearApostles,
          showSpecialZones: params.showSpecialZones,
          isAdjustableMidpoint: params.isAdjustableMidpoint,
          labelMode: params.labelMode,
          labelPositioning: params.labelPositioning,
          areasDisplayMode: params.areasDisplayMode,
          frequencyFilterEnabled: params.frequencyFilterEnabled,
          frequencyThreshold: params.frequencyThreshold
        },
        
        filters: params.filterState ? {
          dateRange: {
            startDate: params.filterState.dateRange.startDate?.toISOString() || null,
            endDate: params.filterState.dateRange.endDate?.toISOString() || null,
            preset: params.filterState.dateRange.preset
          },
          attributes: params.filterState.attributes.map(attr => ({
            field: attr.field,
            values: Array.from(attr.values),
            availableValues: attr.availableValues,
            expanded: attr.expanded
          })),
          isActive: params.filterState.isActive
        } : {
          dateRange: { startDate: null, endDate: null, preset: 'all' },
          attributes: [],
          isActive: false
        },
        
        premium: params.isPremium ? {
          isPremium: true,
          effects: Array.from(params.effects || new Set())
        } : undefined
      }
    };
  }

  /**
   * Save comprehensive progress
   */
  async saveComprehensiveProgress(saveData: ApostlesSaveData): Promise<void> {
    await saveExportService.saveProgress(saveData);
  }

  /**
   * Load comprehensive progress
   */
  async loadComprehensiveProgress(file: File): Promise<ApostlesSaveData> {
    return await saveExportService.loadProgress(file);
  }
}

// Export singleton instance
export const comprehensiveSaveLoadService = new ComprehensiveSaveLoadServiceImpl();
export default comprehensiveSaveLoadService;
