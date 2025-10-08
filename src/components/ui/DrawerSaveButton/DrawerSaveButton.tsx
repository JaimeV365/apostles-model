import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { useSaveLoad } from '../../../hooks/useSaveLoad';
import { comprehensiveSaveLoadService } from '../../../services/ComprehensiveSaveLoadService';
import { useNotification } from '../../data-entry/NotificationSystem';
import './DrawerSaveButton.css';

interface DrawerSaveButtonProps {
  // Data to save
  data: any[];
  
  // Scales
  satisfactionScale: string;
  loyaltyScale: string;
  
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

export const DrawerSaveButton: React.FC<DrawerSaveButtonProps> = ({
  data,
  satisfactionScale,
  loyaltyScale,
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
  effects = new Set()
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showNotification } = useNotification();
  
  // Try to use the context-based save, but fallback to basic save if context is not available
  let saveProgress: (() => Promise<void>) | null = null;
  let contextIsSaving = false;
  
  try {
    const saveLoadHook = useSaveLoad({
      data,
      satisfactionScale,
      loyaltyScale,
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
      isPremium,
      effects
    });
    saveProgress = saveLoadHook.saveProgress;
    contextIsSaving = saveLoadHook.isSaving;
  } catch (error) {
    // Context is not available, we'll use the fallback save
    console.log('Context not available, using fallback save');
  }

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      if (saveProgress) {
        // Use context-based save (this will show its own notification)
        await saveProgress();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        // Fallback save without context data
        const saveData = comprehensiveSaveLoadService.createSaveData({
          data,
          manualAssignments: new Map(), // No manual assignments available
          satisfactionScale, // Use actual scale from props
          loyaltyScale, // Use actual scale from props
          midpoint: { sat: 3, loy: 3 }, // Default midpoint
          apostlesZoneSize: 1, // Default zone size
          terroristsZoneSize: 1, // Default zone size
          isClassicModel: false, // Default model
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
          isPremium,
          effects
        });
        
        await comprehensiveSaveLoadService.saveComprehensiveProgress(saveData);
        
        // Only show notification for fallback save
        setShowSuccess(true);
        showNotification({
          title: 'Success',
          message: 'Progress saved successfully!',
          type: 'success'
        });
        
        setTimeout(() => setShowSuccess(false), 2000);
      }
      
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
    <div className="drawer-save-button-container">
      <button
        className={`drawer-save-button ${(isSaving || contextIsSaving) ? 'saving' : ''} ${showSuccess ? 'success' : ''} ${!hasData ? 'disabled' : ''}`}
        onClick={handleSave}
        disabled={isSaving || contextIsSaving || !hasData}
      >
        <div className="drawer-save-button__icon">
          {showSuccess ? (
            <Check size={18} />
          ) : (isSaving || contextIsSaving) ? (
            <div className="drawer-save-button__spinner" />
          ) : (
            <Save size={18} />
          )}
        </div>
        
        <div className="drawer-save-button__content">
          <div className="drawer-save-button__title">
            {showSuccess ? 'Saved!' : (isSaving || contextIsSaving) ? 'Saving...' : 'Save Progress'}
          </div>
          <div className="drawer-save-button__subtitle">
            {hasData ? `${data.length} data points` : 'No data to save'}
          </div>
        </div>
      </button>
      
      {hasData && (
        <div className="drawer-save-button__info">
          <span>Save as .seg file</span>
        </div>
      )}
    </div>
  );
};

export default DrawerSaveButton;
