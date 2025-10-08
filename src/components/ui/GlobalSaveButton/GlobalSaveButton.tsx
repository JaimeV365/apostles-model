import React, { useState } from 'react';
import { Save, Download, Check, FileText } from 'lucide-react';
import { ApostlesSaveData } from '../../../types/save-export';
import { saveExportService } from '../../../services/SaveExportService';
import { useNotification } from '../../data-entry/NotificationSystem';
import './GlobalSaveButton.css';

interface GlobalSaveButtonProps {
  // Data to save
  data: any[];
  manualAssignments: Map<string, string>;
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
  
  // Scales
  satisfactionScale?: string;
  loyaltyScale?: string;
}

export const GlobalSaveButton: React.FC<GlobalSaveButtonProps> = ({
  data,
  manualAssignments,
  midpoint,
  apostlesZoneSize,
  terroristsZoneSize,
  isClassicModel,
  showGrid,
  showScaleNumbers,
  showLegends,
  showNearApostles,
  showSpecialZones,
  isAdjustableMidpoint,
  labelMode,
  labelPositioning,
  areasDisplayMode,
  frequencyFilterEnabled,
  frequencyThreshold,
  filterState,
  isPremium = false,
  effects = new Set(),
  satisfactionScale = '1-5',
  loyaltyScale = '1-5'
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { showNotification } = useNotification();

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      // Convert manual assignments Map to array
      const manualAssignmentsArray = Array.from(manualAssignments.entries()).map(
        ([pointId, quadrant]) => ({ pointId, quadrant })
      );

      // Prepare save data
      const saveData: ApostlesSaveData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        fileName: saveExportService.getDefaultFileName(),
        
        data: {
          points: data.map(point => ({
            id: point.id,
            name: point.name,
            satisfaction: point.satisfaction,
            loyalty: point.loyalty,
            additionalAttributes: point.additionalAttributes || {}
          })),
          manualAssignments: manualAssignmentsArray,
          scales: {
            satisfaction: satisfactionScale,
            loyalty: loyaltyScale
          }
        },
        
        chartConfig: {
          midpoint,
          apostlesZoneSize,
          terroristsZoneSize,
          isClassicModel
        },
        
        uiState: {
          showGrid,
          showScaleNumbers,
          showLegends,
          showNearApostles,
          showSpecialZones,
          isAdjustableMidpoint,
          labelMode,
          labelPositioning,
          areasDisplayMode,
          frequencyFilterEnabled,
          frequencyThreshold
        },
        
        filters: filterState || {
          dateRange: { startDate: null, endDate: null },
          attributes: [],
          isActive: false
        },
        
        premium: isPremium ? {
          isPremium: true,
          effects: Array.from(effects)
        } : undefined
      };

      // Save the file
      await saveExportService.saveProgress(saveData);
      
      // Show success feedback
      setShowSuccess(true);
      showNotification({
        title: 'Success',
        message: 'Progress saved successfully!',
        type: 'success'
      });
      
      // Reset success state after 2 seconds
      setTimeout(() => setShowSuccess(false), 2000);
      
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
  };

  const hasData = data && data.length > 0;

  return (
    <div className="global-save-button-container">
      <button
        className={`global-save-button ${isSaving ? 'saving' : ''} ${showSuccess ? 'success' : ''} ${!hasData ? 'disabled' : ''}`}
        onClick={handleSave}
        disabled={isSaving || !hasData}
        title={!hasData ? 'No data to save' : 'Save your progress'}
      >
        <div className="global-save-button__icon">
          {showSuccess ? (
            <Check size={20} />
          ) : isSaving ? (
            <div className="global-save-button__spinner" />
          ) : (
            <Save size={20} />
          )}
        </div>
        
        <div className="global-save-button__content">
          <div className="global-save-button__title">
            {showSuccess ? 'Saved!' : isSaving ? 'Saving...' : 'Save Progress'}
          </div>
          <div className="global-save-button__subtitle">
            {hasData ? `${data.length} data points` : 'No data to save'}
          </div>
        </div>
      </button>
      
      {hasData && (
        <div className="global-save-button__info">
          <FileText size={14} />
          <span>Save as .seg file</span>
        </div>
      )}
    </div>
  );
};

export default GlobalSaveButton;
