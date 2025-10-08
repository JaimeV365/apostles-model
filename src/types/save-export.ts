// Save/Export System Types - Version 2.0
// This defines the new two-part structure for saving complete user progress

export interface ApostlesSaveData {
  // Metadata
  version: string;
  timestamp: string;
  fileName?: string;
  description?: string;
  
  // Part 1: Data Table (CSV-like structure)
  dataTable: {
    headers: {
      satisfaction: string; // e.g., "1-5", "0-10"
      loyalty: string; // e.g., "1-5", "0-10"
      email?: string;
      date?: string;
      group?: string;
      excluded?: string;
      reassigned?: string; // NEW: Flag for reassigned points
      [key: string]: string | undefined; // Additional attributes as columns
    };
    rows: Array<{
      id: string;
      name: string;
      satisfaction: number;
      loyalty: number;
      email?: string;
      date?: string;
      dateFormat?: string;
      group: string;
      excluded?: boolean;
      reassigned?: boolean; // NEW: Flag for reassigned points
      [key: string]: any; // Additional attributes as columns
    }>;
  };
  
  // Part 2: Context/Settings
  context: {
    // Manual Reassignments (for reassigned points)
    manualAssignments: Array<{
      pointId: string;
      quadrant: string;
    }>;
    
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
    
    // Filter State (Enhanced for comprehensive filter support)
    filters: {
      dateRange: {
        startDate: string | null; // ISO string or null
        endDate: string | null; // ISO string or null
        preset?: string; // 'all', 'today', 'yesterday', etc.
      };
      attributes: Array<{
        field: string; // Field name (e.g., 'group', 'satisfaction', 'loyalty', custom fields)
        values: Array<string | number>; // Selected values for this field
        availableValues?: Array<{
          value: string | number;
          count: number;
        }>; // Available values with counts (for UI restoration)
        expanded?: boolean; // UI state for collapsible sections
      }>;
      isActive: boolean; // Whether any filters are currently applied
    };
    
    // Premium Features
    premium?: {
      isPremium: boolean;
      effects: string[];
      watermarkSettings?: Record<string, any>;
    };
  };
}

export interface SaveExportService {
  saveProgress: (data: ApostlesSaveData) => Promise<void>;
  loadProgress: (file: File) => Promise<ApostlesSaveData>;
  validateSaveData: (data: any) => data is ApostlesSaveData;
  getDefaultFileName: () => string;
}
