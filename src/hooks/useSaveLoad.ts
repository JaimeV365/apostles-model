import { useState, useCallback } from 'react';
import { useNotification } from '../components/data-entry/NotificationSystem';
import { comprehensiveSaveLoadService, CreateSaveDataParams } from '../services/ComprehensiveSaveLoadService';
import { ApostlesSaveData } from '../types/save-export';
import { useQuadrantAssignmentSafe } from '../components/visualization/context/UnifiedQuadrantContext';
import { useChartConfigSafe } from '../components/visualization/context/ChartConfigContext';
import { useFilterContextSafe } from '../components/visualization/context/FilterContext';

export interface UseSaveLoadParams {
  // Data
  data: any[];
  satisfactionScale: string;
  loyaltyScale: string;
  
  // UI State (from App.tsx)
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
  
  // Filter State (if available)
  filterState?: any;
  
  // Premium
  isPremium?: boolean;
  effects?: Set<string>;
  
  // Callbacks for loading
  onDataLoad?: (data: any[], scales: { satisfaction: string; loyalty: string }) => void;
  onSettingsLoad?: (settings: any) => void;
}

export const useSaveLoad = (params: UseSaveLoadParams) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();
  
  // Always call hooks unconditionally (React rules)
  // These safe hooks return null if contexts are not available
  const contextData = useQuadrantAssignmentSafe();
  const chartConfig = useChartConfigSafe();
  const filterContext = useFilterContextSafe();
  
  // Use context data if available, otherwise use defaults
  const midpoint = contextData?.midpoint || { sat: 3, loy: 3 };
  const apostlesZoneSize = contextData?.apostlesZoneSize || 1;
  const terroristsZoneSize = contextData?.terroristsZoneSize || 1;
  const isClassicModel = contextData?.isClassicModel || false;
  const manualAssignments = contextData?.manualAssignments || new Map();
  const satisfactionScale = params.satisfactionScale;
  const loyaltyScale = params.loyaltyScale;

  /**
   * Save current progress
   */
  const saveProgress = useCallback(async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    // Debug logging
    console.log('🔍 useSaveLoad saveProgress - Context data:', {
      contextData: contextData ? 'available' : 'null',
      chartConfig: chartConfig ? 'available' : 'null', 
      filterContext: filterContext ? 'available' : 'null',
      midpoint: contextData?.midpoint,
      filterState: filterContext?.filterState,
      manualAssignments: contextData?.manualAssignments?.size || 0
    });
    
    try {
      const saveDataParams: CreateSaveDataParams = {
        // Core Data
        data: params.data,
        manualAssignments,
        satisfactionScale,
        loyaltyScale,
        
        // Chart Configuration
        midpoint,
        apostlesZoneSize,
        terroristsZoneSize,
        isClassicModel,
        
        // UI State
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
        frequencyThreshold: params.frequencyThreshold,
        
        // Filter State (use context if available, otherwise fallback to params)
        filterState: filterContext?.filterState || params.filterState,
        
        // Premium
        isPremium: params.isPremium,
        effects: params.effects
      };

      const saveData = comprehensiveSaveLoadService.createSaveData(saveDataParams);
      await comprehensiveSaveLoadService.saveComprehensiveProgress(saveData);
      
      showNotification({
        title: 'Success',
        message: 'Progress saved successfully!',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Failed to save progress:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to save progress. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    isSaving,
    params,
    midpoint,
    apostlesZoneSize,
    terroristsZoneSize,
    isClassicModel,
    manualAssignments,
    satisfactionScale,
    loyaltyScale,
    showNotification
  ]);

  /**
   * Load progress from file
   */
  const loadProgress = useCallback(async (file: File) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const saveData = await comprehensiveSaveLoadService.loadComprehensiveProgress(file);
      
      // Handle both old and new format
      if (saveData.version === '2.0.0' && saveData.dataTable) {
        // New format: Load from dataTable
        const dataPoints = saveData.dataTable.rows.map(row => {
          const point: any = {
            id: row.id,
            name: row.name,
            satisfaction: row.satisfaction,
            loyalty: row.loyalty,
            group: row.group || 'Default',
            excluded: row.excluded || false
          };
          
          // Add optional fields
          if (row.email) point.email = row.email;
          if (row.date) point.date = row.date;
          if (row.dateFormat) point.dateFormat = row.dateFormat;
          
          // Reconstruct additionalAttributes from flattened columns
          const additionalAttributes: Record<string, any> = {};
          Object.keys(row).forEach(key => {
            if (!['id', 'name', 'satisfaction', 'loyalty', 'email', 'date', 'dateFormat', 'group', 'excluded', 'reassigned'].includes(key)) {
              additionalAttributes[key] = row[key];
            }
          });
          
          if (Object.keys(additionalAttributes).length > 0) {
            point.additionalAttributes = additionalAttributes;
          }
          
          return point;
        });
        
        // Load the data with proper scales from headers
        if (params.onDataLoad) {
          params.onDataLoad(dataPoints, {
            satisfaction: saveData.dataTable.headers.satisfaction,
            loyalty: saveData.dataTable.headers.loyalty
          });
        }
        
        // Load the context settings
        if (params.onSettingsLoad) {
          const context = saveData.context;
          params.onSettingsLoad({
            // Chart Configuration
            midpoint: context.chartConfig.midpoint,
            apostlesZoneSize: context.chartConfig.apostlesZoneSize,
            terroristsZoneSize: context.chartConfig.terroristsZoneSize,
            isClassicModel: context.chartConfig.isClassicModel,
            
            // UI State
            showGrid: context.uiState.showGrid,
            showScaleNumbers: context.uiState.showScaleNumbers,
            showLegends: context.uiState.showLegends,
            showNearApostles: context.uiState.showNearApostles,
            showSpecialZones: context.uiState.showSpecialZones,
            isAdjustableMidpoint: context.uiState.isAdjustableMidpoint,
            labelMode: context.uiState.labelMode,
            labelPositioning: context.uiState.labelPositioning,
            areasDisplayMode: context.uiState.areasDisplayMode,
            frequencyFilterEnabled: context.uiState.frequencyFilterEnabled,
            frequencyThreshold: context.uiState.frequencyThreshold,
            
            // Filter State (convert from saved format to context format)
            filterState: {
              dateRange: {
                startDate: context.filters.dateRange.startDate ? new Date(context.filters.dateRange.startDate) : null,
                endDate: context.filters.dateRange.endDate ? new Date(context.filters.dateRange.endDate) : null,
                preset: context.filters.dateRange.preset
              },
              attributes: context.filters.attributes.map((attr: any) => ({
                field: attr.field,
                values: new Set(attr.values),
                availableValues: attr.availableValues,
                expanded: attr.expanded
              })),
              isActive: context.filters.isActive
            },
            
            // Premium
            isPremium: context.premium?.isPremium || false,
            effects: new Set(context.premium?.effects || []),
            
            // Manual Assignments
            manualAssignments: new Map(context.manualAssignments.map((ma: any) => [ma.pointId, ma.quadrant]))
          });
        }
        
      } else {
        // Old format: Handle legacy structure
        console.warn('Loading legacy .seg format - consider re-saving for better compatibility');
        
        if (params.onDataLoad) {
          const dataPoints = (saveData as any).data?.points?.map((point: any) => ({
            ...point,
            group: point.group || 'Default'
          })) || [];
          
          params.onDataLoad(dataPoints, {
            satisfaction: (saveData as any).data?.scales?.satisfaction || '1-5',
            loyalty: (saveData as any).data?.scales?.loyalty || '1-5'
          });
        }
        
        if (params.onSettingsLoad) {
          params.onSettingsLoad({
            // Chart Configuration
            midpoint: (saveData as any).chartConfig?.midpoint || { sat: 3, loy: 3 },
            apostlesZoneSize: (saveData as any).chartConfig?.apostlesZoneSize || 1,
            terroristsZoneSize: (saveData as any).chartConfig?.terroristsZoneSize || 1,
            isClassicModel: (saveData as any).chartConfig?.isClassicModel || false,
            
            // UI State
            showGrid: (saveData as any).uiState?.showGrid ?? true,
            showScaleNumbers: (saveData as any).uiState?.showScaleNumbers ?? true,
            showLegends: (saveData as any).uiState?.showLegends ?? true,
            showNearApostles: (saveData as any).uiState?.showNearApostles ?? false,
            showSpecialZones: (saveData as any).uiState?.showSpecialZones ?? true,
            isAdjustableMidpoint: (saveData as any).uiState?.isAdjustableMidpoint ?? false,
            labelMode: (saveData as any).uiState?.labelMode || 1,
            labelPositioning: (saveData as any).uiState?.labelPositioning || 'below-dots',
            areasDisplayMode: (saveData as any).uiState?.areasDisplayMode || 2,
            frequencyFilterEnabled: (saveData as any).uiState?.frequencyFilterEnabled ?? false,
            frequencyThreshold: (saveData as any).uiState?.frequencyThreshold || 1,
            
            // Filter State (legacy format - convert to context format)
            filterState: (saveData as any).filters ? {
              dateRange: {
                startDate: (saveData as any).filters.dateRange?.startDate ? new Date((saveData as any).filters.dateRange.startDate) : null,
                endDate: (saveData as any).filters.dateRange?.endDate ? new Date((saveData as any).filters.dateRange.endDate) : null,
                preset: (saveData as any).filters.dateRange?.preset || 'all'
              },
              attributes: ((saveData as any).filters.attributes || []).map((attr: any) => ({
                field: attr.field,
                values: new Set(attr.values || []),
                availableValues: attr.availableValues,
                expanded: attr.expanded
              })),
              isActive: (saveData as any).filters.isActive || false
            } : {
              dateRange: { startDate: null, endDate: null, preset: 'all' },
              attributes: [],
              isActive: false
            },
            
            // Premium
            isPremium: (saveData as any).premium?.isPremium || false,
            effects: new Set((saveData as any).premium?.effects || []),
            
            // Manual Assignments
            manualAssignments: new Map((saveData as any).data?.manualAssignments?.map((ma: any) => [ma.pointId, ma.quadrant]) || [])
          });
        }
      }
      
      showNotification({
        title: 'Success',
        message: 'Progress loaded successfully!',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Failed to load progress:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to load progress file. Please check the file format.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, params, showNotification]);

  return {
    saveProgress,
    loadProgress,
    isSaving,
    isLoading
  };
};
