import React, { useState } from 'react';
import { Save, Download, Check } from 'lucide-react';
import { ApostlesSaveData } from '../../../types/save-export';
import { saveExportService } from '../../../services/SaveExportService';
import { useNotification } from '../../data-entry/NotificationSystem';
import './SaveProgressButton.css';

interface SaveProgressButtonProps {
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
  
  // Optional props
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
}

export const SaveProgressButton: React.FC<SaveProgressButtonProps> = ({
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
  className = '',
  size = 'medium',
  variant = 'primary'
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
            satisfaction: '1-5', // TODO: Get from context
            loyalty: '1-5' // TODO: Get from context
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

  const buttonClasses = [
    'save-progress-button',
    `save-progress-button--${size}`,
    `save-progress-button--${variant}`,
    isSaving && 'save-progress-button--saving',
    showSuccess && 'save-progress-button--success',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={handleSave}
      disabled={isSaving || data.length === 0}
      title={data.length === 0 ? 'No data to save' : 'Save your progress'}
    >
      {showSuccess ? (
        <Check size={16} />
      ) : isSaving ? (
        <div className="save-progress-button__spinner" />
      ) : (
        <Save size={16} />
      )}
      
      <span className="save-progress-button__text">
        {showSuccess ? 'Saved!' : isSaving ? 'Saving...' : 'Save Progress'}
      </span>
    </button>
  );
};

export default SaveProgressButton;
