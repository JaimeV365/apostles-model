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
  
  // Filter State
  filterState?: any;
  
  // Premium
  isPremium?: boolean;
  effects?: Set<string>;
}

class ComprehensiveSaveLoadServiceImpl implements SaveLoadService {
  
  /**
   * Create comprehensive save data from all current state
   */
  createSaveData(params: CreateSaveDataParams): ApostlesSaveData {
    // Convert manual assignments Map to array
    const manualAssignmentsArray = Array.from(params.manualAssignments.entries()).map(
      ([pointId, quadrant]) => ({ pointId, quadrant })
    );

    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      fileName: saveExportService.getDefaultFileName(),
      
      data: {
        points: params.data.map(point => ({
          id: point.id,
          name: point.name,
          satisfaction: point.satisfaction,
          loyalty: point.loyalty,
          additionalAttributes: point.additionalAttributes || {}
        })),
        manualAssignments: manualAssignmentsArray,
        scales: {
          satisfaction: params.satisfactionScale,
          loyalty: params.loyaltyScale
        }
      },
      
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
      
      filters: params.filterState || {
        dateRange: { startDate: null, endDate: null },
        attributes: [],
        isActive: false
      },
      
      premium: params.isPremium ? {
        isPremium: true,
        effects: Array.from(params.effects || new Set())
      } : undefined
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
