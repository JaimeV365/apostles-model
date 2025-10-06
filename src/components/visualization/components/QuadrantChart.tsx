import React from 'react';
import { 
  DataPoint, 
  ScaleFormat
} from '@/types/base';
import { useQuadrantAssignment } from '../context/QuadrantAssignmentContext';
import { useChartCalculations, useChartHandlers, useChartState } from '../hooks';
import { ChartControls } from '../controls/ChartControls';
import { ChartContainer } from './ChartContainer';
import './QuadrantChart.css';

interface QuadrantChartProps {
  data: DataPoint[];
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  isClassicModel: boolean;
  showNearApostles: boolean;
  showSpecialZones: boolean;
  showLabels: boolean;
  showGrid: boolean;
  hideWatermark: boolean;
  showAdvancedFeatures: boolean;
  activeEffects: Set<string>;
  frequencyFilterEnabled: boolean;
  frequencyThreshold: number;
  isAdjustableMidpoint: boolean;
  onFrequencyFilterEnabledChange: (enabled: boolean) => void;
  onFrequencyThresholdChange: (threshold: number) => void;
  onIsAdjustableMidpointChange: (adjustable: boolean) => void;
  onIsClassicModelChange: (isClassic: boolean) => void;
  onShowNearApostlesChange: (show: boolean) => void;
  onShowSpecialZonesChange: (show: boolean) => void;
  onShowLabelsChange: (show: boolean) => void;
  onShowGridChange: (show: boolean) => void;
  
  specialZoneBoundaries?: any;
}

const QuadrantChart: React.FC<QuadrantChartProps> = ({
  data,
  satisfactionScale,
  loyaltyScale,
  isClassicModel,
  showNearApostles,
  showSpecialZones,
  showLabels,
  showGrid,
  hideWatermark,
  showAdvancedFeatures,
  activeEffects,
  frequencyFilterEnabled,
  frequencyThreshold,
  isAdjustableMidpoint,
  onFrequencyFilterEnabledChange,
  onFrequencyThresholdChange,
  onIsAdjustableMidpointChange,
  onIsClassicModelChange,
  onShowNearApostlesChange,
  onShowSpecialZonesChange,
  onShowLabelsChange,
  onShowGridChange
}) => {
  // Get context values
  const { midpoint, apostlesZoneSize: contextApostlesZoneSize, terroristsZoneSize: contextTerroristsZoneSize, setApostlesZoneSize, setTerroristsZoneSize } = useQuadrantAssignment();
  
  // Use custom hooks for chart logic
  const {
    dimensions,
    position,
    maxSizes,
    specialZoneBoundaries,
    frequencyData,
    hasSpaceForNearApostles
  } = useChartCalculations({
    data,
    satisfactionScale,
    loyaltyScale
  });
  
  const { handleMidpointChange, handleZoneResize } = useChartHandlers({ maxSizes });
  
  const {
    showScaleNumbers,
    setShowScaleNumbers,
    showLegends,
    setShowLegends,
    labelMode,
    setLabelMode,
    showQuadrantLabels,
    setShowQuadrantLabels,
    showSpecialZoneLabels,
    setShowSpecialZoneLabels,
    labelPositioning,
    setLabelPositioning,
  } = useChartState();
  
  // Debug boundaries
  console.log('🔍 Special zone boundaries calculated in QuadrantChart:', specialZoneBoundaries);
  console.log('🔍 Label positioning:', labelPositioning);
  console.log('🔍 ChartControls props:', { labelPositioning, setLabelPositioning });

  return (
    <div className="quadrant-chart">
      <ChartControls
        isClassicModel={isClassicModel}
        setIsClassicModel={onIsClassicModelChange}
        showNearApostles={showNearApostles}
        setShowNearApostles={onShowNearApostlesChange}
        hasSpaceForNearApostles={hasSpaceForNearApostles}
        showSpecialZones={showSpecialZones}
        setShowSpecialZones={onShowSpecialZonesChange} 
        labelMode={labelMode}
        setLabelMode={setLabelMode}
        labelPositioning={labelPositioning}
        setLabelPositioning={setLabelPositioning}
        showQuadrantLabels={showQuadrantLabels}
        setShowQuadrantLabels={setShowQuadrantLabels}
        showSpecialZoneLabels={showSpecialZoneLabels}
        setSpecialZoneLabels={setShowSpecialZoneLabels}
        showGrid={showGrid}
        setShowGrid={onShowGridChange}
        isAdjustableMidpoint={isAdjustableMidpoint}
        setIsAdjustableMidpoint={onIsAdjustableMidpointChange}
        frequencyFilterEnabled={frequencyFilterEnabled}
        frequencyThreshold={frequencyThreshold}
        setFrequencyFilterEnabled={onFrequencyFilterEnabledChange}
        setFrequencyThreshold={onFrequencyThresholdChange}
        frequencyData={frequencyData}
        showScaleNumbers={showScaleNumbers}
        setShowScaleNumbers={setShowScaleNumbers}
        showLegends={showLegends}
        setShowLegends={setShowLegends}
        satisfactionScale={satisfactionScale}
        loyaltyScale={loyaltyScale}
      />
      
      <ChartContainer
        dimensions={dimensions}
        position={position}
        specialZoneBoundaries={specialZoneBoundaries}
        midpoint={midpoint}
        data={data}
        satisfactionScale={satisfactionScale}
        loyaltyScale={loyaltyScale}
        apostlesZoneSize={contextApostlesZoneSize}
        terroristsZoneSize={contextTerroristsZoneSize}
        maxSizes={maxSizes}
        showGrid={showGrid}
        showScaleNumbers={showScaleNumbers}
        showLegends={showLegends}
        showLabels={showLabels}
        showQuadrantLabels={showQuadrantLabels}
        showSpecialZoneLabels={showSpecialZoneLabels}
        labelPositioning={labelPositioning}
        showSpecialZones={showSpecialZones}
        showNearApostles={showNearApostles}
        isClassicModel={isClassicModel}
        isAdjustableMidpoint={isAdjustableMidpoint}
        hideWatermark={hideWatermark}
        activeEffects={activeEffects}
        frequencyFilterEnabled={frequencyFilterEnabled}
        frequencyThreshold={frequencyThreshold}
        frequencyData={frequencyData}
        onMidpointChange={handleMidpointChange}
        onZoneResize={handleZoneResize}
        onShowNearApostlesChange={onShowNearApostlesChange}
        onApostlesZoneSizeChange={setApostlesZoneSize}
        onTerroristsZoneSizeChange={setTerroristsZoneSize}
      />
    </div>
  );
};

export default QuadrantChart;