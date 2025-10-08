// Save/Export System Types
// This defines the structure for saving complete user progress

export interface ApostlesSaveData {
  // Metadata
  version: string;
  timestamp: string;
  fileName?: string;
  description?: string;
  
  // Core Data
  data: {
    points: Array<{
      id: string;
      name: string;
      satisfaction: number;
      loyalty: number;
      additionalAttributes?: Record<string, any>;
    }>;
    manualAssignments: Array<{
      pointId: string;
      quadrant: string;
    }>;
    scales: {
      satisfaction: string;
      loyalty: string;
    };
  };
  
  // Chart Configuration
  chartConfig: {
    midpoint: {
      sat: number;
      loy: number;
    };
    apostlesZoneSize: number;
    terroristsZoneSize: number;
    isClassicModel: boolean;
  };
  
  // UI State
  uiState: {
    // Display settings
    showGrid: boolean;
    showScaleNumbers: boolean;
    showLegends: boolean;
    showNearApostles: boolean;
    showSpecialZones: boolean;
    isAdjustableMidpoint: boolean;
    
    // Label settings
    labelMode: number; // 1=No Labels, 2=Quadrants, 3=All Labels
    labelPositioning: 'above-dots' | 'below-dots';
    areasDisplayMode: number; // 1=No Areas, 2=Main Areas, 3=All Areas
    
    // Frequency settings
    frequencyFilterEnabled: boolean;
    frequencyThreshold: number;
  };
  
  // Filter State
  filters: {
    dateRange: {
      startDate: string | null;
      endDate: string | null;
      preset?: string;
    };
    attributes: Array<{
      field: string;
      values: Array<string | number>;
    }>;
    isActive: boolean;
  };
  
  // Premium Features
  premium?: {
    isPremium: boolean;
    effects: string[];
    watermarkSettings?: Record<string, any>;
  };
}

export interface SaveExportService {
  saveProgress: (data: ApostlesSaveData) => Promise<void>;
  loadProgress: (file: File) => Promise<ApostlesSaveData>;
  validateSaveData: (data: any) => data is ApostlesSaveData;
  getDefaultFileName: () => string;
}
