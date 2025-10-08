import { useState, useCallback } from 'react';
import { useNotification } from '../components/data-entry/NotificationSystem';
import { comprehensiveSaveLoadService, CreateSaveDataParams } from '../services/ComprehensiveSaveLoadService';
import { ApostlesSaveData } from '../types/save-export';

export interface UseSaveLoadParams {
  // Data
  data: any[];
  
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
  
  // Use default values instead of context data to avoid interfering with visualization
  const midpoint = { sat: 3, loy: 3 }; // Default midpoint
  const apostlesZoneSize = 1; // Default zone size
  const terroristsZoneSize = 1; // Default zone size
  const isClassicModel = false; // Default model
  const manualAssignments = new Map(); // Empty manual assignments
  const satisfactionScale = '1-5'; // Default scale
  const loyaltyScale = '1-5'; // Default scale

  /**
   * Save current progress
   */
  const saveProgress = useCallback(async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    
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
        
        // Filter State
        filterState: params.filterState,
        
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
      
      // Load data
      if (params.onDataLoad) {
        params.onDataLoad(saveData.data.points, {
          satisfaction: saveData.data.scales.satisfaction,
          loyalty: saveData.data.scales.loyalty
        });
      }
      
      // Note: We're not updating the visualization context to avoid interference
      // The loaded data will be applied through the onSettingsLoad callback

      // Load settings
      if (params.onSettingsLoad) {
        params.onSettingsLoad({
          // Chart Configuration
          midpoint: saveData.chartConfig.midpoint,
          apostlesZoneSize: saveData.chartConfig.apostlesZoneSize,
          terroristsZoneSize: saveData.chartConfig.terroristsZoneSize,
          isClassicModel: saveData.chartConfig.isClassicModel,
          
          // UI State
          showGrid: saveData.uiState.showGrid,
          showScaleNumbers: saveData.uiState.showScaleNumbers,
          showLegends: saveData.uiState.showLegends,
          showNearApostles: saveData.uiState.showNearApostles,
          showSpecialZones: saveData.uiState.showSpecialZones,
          isAdjustableMidpoint: saveData.uiState.isAdjustableMidpoint,
          labelMode: saveData.uiState.labelMode,
          labelPositioning: saveData.uiState.labelPositioning,
          areasDisplayMode: saveData.uiState.areasDisplayMode,
          frequencyFilterEnabled: saveData.uiState.frequencyFilterEnabled,
          frequencyThreshold: saveData.uiState.frequencyThreshold,
          
          // Filter State
          filterState: saveData.filters,
          
          // Premium
          isPremium: saveData.premium?.isPremium || false,
          effects: new Set(saveData.premium?.effects || []),
          
          // Manual Assignments
          manualAssignments: new Map(saveData.data.manualAssignments.map(ma => [ma.pointId, ma.quadrant]))
        });
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
