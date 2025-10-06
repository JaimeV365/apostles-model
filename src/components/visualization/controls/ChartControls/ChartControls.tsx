import React, { useState, useEffect, useCallback } from 'react';
import { FrequencySlider } from '../FrequencyControl';
import { Switch } from '../../../ui/Switch/Switch';
import { TwoStateToggle } from '../../../ui/TwoStateToggle/TwoStateToggle';
import { BookOpen, Tags, Monitor, Sliders } from 'lucide-react';
import { ScaleFormat } from '../../../../types/base';
import './ChartControls.css';

// Import ThreeStateToggle
import { ThreeStateToggle, TogglePosition } from '../../../ui/ThreeStateToggle';

type LabelMode = 'all' | 'quadrants' | 'sub-sections' | 'none';
type LabelPositioning = 'above-dots' | 'below-dots';

interface ChartControlsProps {
  /** Toggle between classic and modern terminology */
  isClassicModel: boolean;
  setIsClassicModel: (value: boolean) => void;
  
  /** Near-apostles zone visibility */
  showNearApostles: boolean;
  setShowNearApostles: (value: boolean) => void;
  hasSpaceForNearApostles: boolean;

  /** Label display mode */
  labelMode: LabelMode;
  setLabelMode: (mode: LabelMode) => void;
  
  /** Label positioning relative to data points */
  labelPositioning: LabelPositioning;
  setLabelPositioning: (positioning: LabelPositioning) => void;
  
  /** Grid visibility */
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  
  /** Midpoint adjustment */
  isAdjustableMidpoint: boolean;
  setIsAdjustableMidpoint: (adjustable: boolean) => void;
  
  /** Frequency filtering */
  frequencyFilterEnabled: boolean;
  frequencyThreshold: number;
  setFrequencyFilterEnabled: (enabled: boolean) => void;
  setFrequencyThreshold: (threshold: number) => void;
  frequencyData: {
    maxFrequency: number;
    hasOverlaps: boolean;
  };
  
  /** Scale and legend display */
  showScaleNumbers: boolean;
  setShowScaleNumbers: (show: boolean) => void;
  showLegends: boolean;
  setShowLegends: (show: boolean) => void;
  
  // Optional parameters for backward compatibility
  showSpecialZones?: boolean;
  setShowSpecialZones?: (show: boolean) => void;
  showQuadrantLabels?: boolean;
  setShowQuadrantLabels?: (show: boolean) => void;
  showSpecialZoneLabels?: boolean;
  setSpecialZoneLabels?: (show: boolean) => void;
  satisfactionScale?: ScaleFormat;
  loyaltyScale?: ScaleFormat;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  isClassicModel,
  setIsClassicModel,
  showNearApostles,
  setShowNearApostles,
  hasSpaceForNearApostles,
  showSpecialZones = true,
  setShowSpecialZones = () => {},
  satisfactionScale = '1-5',
  loyaltyScale = '1-5',
  labelMode,
  setLabelMode,
  labelPositioning,
  setLabelPositioning,
  showQuadrantLabels = true,
  setShowQuadrantLabels = () => {},
  showSpecialZoneLabels = true,
  setSpecialZoneLabels = () => {},
  showGrid,
  setShowGrid,
  isAdjustableMidpoint,
  setIsAdjustableMidpoint,
  frequencyFilterEnabled,
  frequencyThreshold,
  setFrequencyFilterEnabled,
  setFrequencyThreshold,
  frequencyData,
  showScaleNumbers,
  setShowScaleNumbers,
  showLegends,
  setShowLegends,
}) => {
  console.log('🔍 ChartControls received labelPositioning:', labelPositioning);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Check if using 1-3 scale
  const isUsing1To3Scale = satisfactionScale === '1-3' || loyaltyScale === '1-3';

  // Compute the areas display mode
  const getAreaDisplayMode = (): TogglePosition => {
    if (!showSpecialZones) return 1;
    if (!showNearApostles) return 2;
    return 3;
  };

  const [areasDisplayMode, setAreasDisplayMode] = useState<TogglePosition>(getAreaDisplayMode());

  // Sync display mode with individual toggles
  useEffect(() => {
    setAreasDisplayMode(getAreaDisplayMode());
  }, [showNearApostles, showSpecialZones]);

  // Effect to sync label state with near-apostles visibility
useEffect(() => {
  if (!showNearApostles && labelMode === 'sub-sections') {
    // Call the function directly without dependency
    setLabelMode('all');
    setShowQuadrantLabels(true);
    setSpecialZoneLabels(true);
  }
}, [showNearApostles, labelMode, setShowQuadrantLabels, setSpecialZoneLabels]);



  const handleLabelClick = (mode: LabelMode) => {
    setLabelMode(mode);
    switch (mode) {
      case 'all':
        setShowQuadrantLabels(true);
        setSpecialZoneLabels(true);
        break;
      case 'quadrants':
        setShowQuadrantLabels(true);
        setSpecialZoneLabels(false);
        break;
      case 'sub-sections':
        setShowQuadrantLabels(false);
        setSpecialZoneLabels(true);
        break;
      case 'none':
        setShowQuadrantLabels(false);
        setSpecialZoneLabels(false);
        break;
    }
  };
  
  const handleAreasDisplayModeChange = (position: TogglePosition) => {
  setAreasDisplayMode(position);
  switch(position) {
    case 1: // No Areas - only main quadrants
      setShowSpecialZones(false);
      setShowNearApostles(false);
      break;
    case 2: // Main Areas - quadrants + apostles/terrorists  
      setShowSpecialZones(true);
      setShowNearApostles(false);
      break;
    case 3: // All Areas - everything including near-zones
      setShowSpecialZones(true);
      setShowNearApostles(true);
      break;
  }
};

// Auto-switch from "All Areas" to "Main Areas" when space runs out
useEffect(() => {
  if (areasDisplayMode === 3 && !hasSpaceForNearApostles) {
    console.log('🔄 Auto-switching from "All Areas" to "Main Areas" - no space available');
    setAreasDisplayMode(2);
    handleAreasDisplayModeChange(2);
  }
}, [hasSpaceForNearApostles, areasDisplayMode, handleAreasDisplayModeChange]);

  const renderLabelButtons = () => {
    const buttons = [
      {
        mode: 'all' as LabelMode,
        label: 'All Labels',
        show: true
      },
      {
        mode: 'quadrants' as LabelMode,
        label: 'Quadrants',
        show: true
      },
      {
        mode: 'sub-sections' as LabelMode,
        label: 'Areas',
        show: showNearApostles && hasSpaceForNearApostles
      },
      {
        mode: 'none' as LabelMode,
        label: 'No Labels',
        show: true
      }
    ];

    return buttons.map(button => 
      button.show && (
        <button 
          key={button.mode}
          className={`label-button ${labelMode === button.mode ? 'active' : ''}`}
          onClick={() => handleLabelClick(button.mode)}
        >
          {button.label}
        </button>
      )
    );
  };

  return (
    <div className="chart-controls-wrapper">
      <div className="chart-controls-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="control-section-title-text">
          Controls {isCollapsed ? 
            <span style={{ color: '#3a863e' }}>▼</span> : 
            <span style={{ color: '#3a863e' }}>▲</span>}
        </div>
      </div>
      
      <div className={`chart-controls ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Display Group */}
        <div className="control-group display-group">
          <div className="control-section-title">
            <Monitor size={16} className="control-section-icon" />
            <span className="control-section-title-text">Display</span>
          </div>
          <div className="control-group-content">
            <TwoStateToggle
              leftLabel="Fixed"
              rightLabel="Adjustable"
              value={isAdjustableMidpoint ? 'right' : 'left'}
              onChange={(value: 'left' | 'right') => setIsAdjustableMidpoint(value === 'right')}
            />

            <Switch
              checked={showGrid}
              onChange={setShowGrid}
              leftLabel="Grid"
            />
                        
            <Switch
              checked={showScaleNumbers}
              onChange={setShowScaleNumbers}
              leftLabel="Scale Numbers"
            />
                        
            <Switch
              checked={showLegends}
              onChange={setShowLegends}
              leftLabel="Legends"
            />
          </div>
        </div>

        {/* Labels Group */}
        <div className="control-group labels-group">
          <div className="control-section-title">
            <Tags size={16} className="control-section-icon" />
            <span className="control-section-title-text">Labels</span>
          </div>
          <div className="control-group-content">
            <div className="labels-buttons">
              {renderLabelButtons()}
            </div>
            
            {/* Label Positioning Controls */}
            <div className="label-positioning-controls">
              <div className="control-label">Label Position:</div>
              <TwoStateToggle
                leftLabel="Above Dots"
                rightLabel="Below Dots"
                value={labelPositioning === 'above-dots' ? 'left' : 'right'}
                onChange={(value: 'left' | 'right') => {
                  const newPositioning = value === 'left' ? 'above-dots' : 'below-dots';
                  setLabelPositioning(newPositioning);
                }}
              />
            </div>
          </div>
        </div>


        {/* Terminology Group */}
        <div className="control-group terminology-group">
          <div className="control-section-title">
            <BookOpen size={16} className="control-section-icon" />
            <span className="control-section-title-text">Terminology</span>
          </div>
          <div className="control-group-content">
            <TwoStateToggle
  leftLabel="Classic"
  rightLabel="Modern"
  value={isClassicModel ? 'left' : 'right'}
  onChange={(value: 'left' | 'right') => setIsClassicModel(value === 'left')}
  disabled={areasDisplayMode === 1}
  disabledReason={areasDisplayMode === 1 ? "Not applicable when areas are hidden" : undefined}
/>
            <ThreeStateToggle
  position={areasDisplayMode}
  onChange={handleAreasDisplayModeChange}
  labels={["No Areas", "Main Areas", "All Areas"]}
  disabled={false}
  disabledPositions={!hasSpaceForNearApostles ? [3] : []}
  disabledPositionReason="No space available for near areas"
/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartControls;