import React, { useState, useMemo, useEffect } from 'react';
import { 
  GridDimensions, 
  Position, 
  DataPoint, 
  ScaleFormat, 
  Midpoint,
  SpecialZoneBoundaries
} from '@/types/base';
import { useQuadrantAssignment } from '../context/QuadrantAssignmentContext';
import { calculateGrid } from '../utils/gridCalculator';
import { calculateSpecialZoneBoundaries } from '../utils/zoneCalculator';
import { calculatePointFrequencies } from '../utils/frequencyCalculator';
import { calculateMidpointPosition } from '../utils/positionCalculator';
import { GridRenderer, ScaleMarkers, AxisLegends } from '../grid';
import { DataPointRenderer } from '../components/DataPoints';
import { ChartControls } from '../controls/ChartControls';
import { MidpointHandle } from '../controls/MidpointControl';
import { ResizeHandle } from '../controls/ResizeHandles';
import { Quadrants } from '../zones/Quadrants';
import { SpecialZones } from '../zones/SpecialZones';
import { Watermark } from '../watermark';
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
  // State for the midpoint position
  const { midpoint, setMidpoint } = useQuadrantAssignment();
  
  // Use context zone sizes instead of local state
const { apostlesZoneSize, terroristsZoneSize, setApostlesZoneSize, setTerroristsZoneSize } = useQuadrantAssignment();
  
  // State for scale numbers and legends
  const [showScaleNumbers, setShowScaleNumbers] = useState<boolean>(true);
  const [showLegends, setShowLegends] = useState<boolean>(true);
  
  // State for labels
  const [labelMode, setLabelMode] = useState<'all' | 'quadrants' | 'sub-sections' | 'none'>('all');
  const [showQuadrantLabels, setShowQuadrantLabels] = useState<boolean>(true);
  const [showSpecialZoneLabels, setShowSpecialZoneLabels] = useState<boolean>(true);
  
  // Remove unused state
  // const [resizingZone, setResizingZone] = useState<'apostles' | 'terrorists' | null>(null);
  
  // Calculate grid dimensions
  const dimensions = useMemo<GridDimensions>(() => {
    return calculateGrid({
      satisfactionScale,
      loyaltyScale,
      midpoint,
      apostlesZoneSize,
      terroristsZoneSize
    });
  }, [satisfactionScale, loyaltyScale, midpoint, apostlesZoneSize, terroristsZoneSize]);
  
  // Calculate midpoint position
  const position = useMemo<Position>(() => {
    return calculateMidpointPosition(midpoint, dimensions);
  }, [midpoint, dimensions]);
  
  // Calculate maximum zone sizes
  const maxSizes = useMemo(() => {
    const satMax = parseInt(satisfactionScale.split('-')[1]);
    const loyMax = parseInt(loyaltyScale.split('-')[1]);
    
    // Distance from midpoint to edges
    const midCol = midpoint.sat - 1;
    const midRow = midpoint.loy - 1;
    
    const maxApostlesX = satMax - midCol - 1;
    const maxApostlesY = loyMax - midRow - 1;
    const maxApostlesSize = Math.min(maxApostlesX, maxApostlesY);
    
    const maxTerrX = midCol;
    const maxTerrY = midRow;
    const maxTerrSize = Math.min(maxTerrX, maxTerrY);
    
    return {
      apostles: Math.max(1, maxApostlesSize),
      terrorists: Math.max(1, maxTerrSize)
    };
  }, [satisfactionScale, loyaltyScale, midpoint]);

  // Calculate special zone boundaries
  const specialZoneBoundaries = useMemo(() => {
    return calculateSpecialZoneBoundaries(
      apostlesZoneSize,
      terroristsZoneSize,
      satisfactionScale,
      loyaltyScale
    );
  }, [apostlesZoneSize, terroristsZoneSize, satisfactionScale, loyaltyScale]);
  
  // Calculate frequency data
  const frequencyData = useMemo(() => {
    return calculatePointFrequencies(data.filter(point => !point.excluded));
  }, [data]);
  
  // Handle midpoint change
  const handleMidpointChange = (newMidpoint: Midpoint) => {
    setMidpoint(newMidpoint);
  };
  
  // Handle zone resize
  const handleZoneResize = (zone: 'apostles' | 'terrorists', newSize: number) => {
  
  if (zone === 'apostles') {
    const finalSize = Math.min(newSize, maxSizes.apostles);
    console.log(`📈 Calling setApostlesZoneSize(${finalSize})`);
    setApostlesZoneSize(finalSize);
  } else {
    const finalSize = Math.min(newSize, maxSizes.terrorists);
    console.log(`📈 Calling setTerroristsZoneSize(${finalSize})`);
    setTerroristsZoneSize(finalSize);
  }
};
  
  // Handle label mode change
  const handleLabelModeChange = (mode: 'all' | 'quadrants' | 'sub-sections' | 'none') => {
    setLabelMode(mode);
  };
  
  // Check if we have space for near-apostles
const hasSpaceForNearApostles = useMemo(() => {
  const satMax = parseInt(satisfactionScale.split('-')[1]);
  const loyMax = parseInt(loyaltyScale.split('-')[1]);
  
  // Get apostles zone boundaries
  const boundaries = calculateSpecialZoneBoundaries(apostlesZoneSize, terroristsZoneSize, satisfactionScale, loyaltyScale);
  const apostlesMinSat = boundaries.apostles.edgeVertixSat; // 4
  const apostlesMinLoy = boundaries.apostles.edgeVertixLoy; // 7
  
  // Near-apostles L-shape needs the corner position
  const nearApostlesCornerSat = apostlesMinSat - 1; // 3
  const nearApostlesCornerLoy = apostlesMinLoy - 1; // 6
  
  // Check if corner position conflicts with midpoint quadrants
  const cornerInHostages = nearApostlesCornerSat < midpoint.sat && nearApostlesCornerLoy >= midpoint.loy;
  const cornerInDefectors = nearApostlesCornerSat < midpoint.sat && nearApostlesCornerLoy < midpoint.loy;
  const cornerInMercenaries = nearApostlesCornerSat >= midpoint.sat && nearApostlesCornerLoy < midpoint.loy;
  
  const hasSpace = !cornerInHostages && !cornerInDefectors && !cornerInMercenaries;
  
  console.log(`🔍 Near-apostles corner would be at (${nearApostlesCornerSat},${nearApostlesCornerLoy})`);
  console.log(`🔍 Midpoint at (${midpoint.sat},${midpoint.loy})`);
  console.log(`🔍 Corner conflicts: hostages=${cornerInHostages}, defectors=${cornerInDefectors}, mercenaries=${cornerInMercenaries}`);
  console.log(`🔍 Has space for near-apostles: ${hasSpace}`);
  
  return hasSpace;
}, [satisfactionScale, loyaltyScale, apostlesZoneSize, terroristsZoneSize, midpoint]);

  // Debug boundaries
  console.log('🔍 Special zone boundaries calculated in QuadrantChart:', specialZoneBoundaries);

  console.log(`🔧 QuadrantChart: About to render ResizeHandle with isAdjustable=${isAdjustableMidpoint}`);
console.log(`🔧 QuadrantChart: Type of isAdjustableMidpoint:`, typeof isAdjustableMidpoint);
console.log(`🔧 QuadrantChart: Strict equality check:`, isAdjustableMidpoint === true);
console.log(`🔧 QuadrantChart: Strict equality check false:`, isAdjustableMidpoint === false);

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
        setLabelMode={handleLabelModeChange}
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
      
      <div 
        className="chart-container"
        data-apostles-boundary-sat={specialZoneBoundaries.apostles.edgeVertixSat}
        data-apostles-boundary-loy={specialZoneBoundaries.apostles.edgeVertixLoy}
        data-terrorists-boundary-sat={specialZoneBoundaries.terrorists.edgeVertixSat}
        data-terrorists-boundary-loy={specialZoneBoundaries.terrorists.edgeVertixLoy}
      >
        {/* Grid */}
        <GridRenderer
          dimensions={dimensions}
          showGrid={showGrid}
        />

        {/* Scale Numbers */}
        {showScaleNumbers && (
          <ScaleMarkers
            satisfactionScale={satisfactionScale}
            loyaltyScale={loyaltyScale}
            showScaleNumbers={showScaleNumbers}
          />
        )}

        {/* Legends */}
        {showLegends && (
          <AxisLegends
            satisfactionScale={satisfactionScale}
            loyaltyScale={loyaltyScale}
            showLegends={showLegends}
            showScaleNumbers={showScaleNumbers}
          />
        )}
        
        {/* Quadrants */}
        <Quadrants
          position={position}
          isClassicModel={isClassicModel}
          showLabels={showLabels && showQuadrantLabels}
          showQuadrantLabels={showQuadrantLabels}
        />
        
        {/* Special zones */}
        {(() => {
          console.log(`🔧 QuadrantChart: About to render SpecialZoneRenderer`);
          return null;
        })()}
        {showSpecialZones && (
  <SpecialZones
    dimensions={dimensions}
    zoneSizes={{ apostles: apostlesZoneSize, terrorists: terroristsZoneSize }}
    position={position}
    maxSizes={maxSizes}
    showNearApostles={showNearApostles}
    onResizeStart={(zone) => console.log(`🔧 SpecialZones: Resize start for ${zone}`)}
    onResize={(newSizes) => {
      console.log(`🔧 SpecialZones: Resize to`, newSizes);
      setApostlesZoneSize(newSizes.apostles);
      setTerroristsZoneSize(newSizes.terrorists);
    }}
    isClassicModel={isClassicModel}
    showLabels={showLabels && showSpecialZoneLabels}
    showHandles={true}
  />
)}
        
        {/* Data points */}
        <DataPointRenderer
          data={data}
          dimensions={dimensions}
          position={position}
          frequencyFilterEnabled={frequencyFilterEnabled}
          frequencyThreshold={frequencyThreshold}
          satisfactionScale={satisfactionScale}
          loyaltyScale={loyaltyScale}
          showNearApostles={showNearApostles}
          apostlesZoneSize={apostlesZoneSize}
  terroristsZoneSize={terroristsZoneSize} 
  isClassicModel={isClassicModel}
        />
        
        {/* Midpoint handle */}
        <MidpointHandle
          position={position}
          midpoint={midpoint}
          dimensions={dimensions}
          satisfactionScale={satisfactionScale}
          loyaltyScale={loyaltyScale}
          onMidpointChange={handleMidpointChange}
          isAdjustable={isAdjustableMidpoint}
          apostlesZoneSize={apostlesZoneSize}
          terroristsZoneSize={terroristsZoneSize}
          showNearApostles={showNearApostles}
          onShowNearApostlesChange={onShowNearApostlesChange}
          showSpecialZones={showSpecialZones}
        />
        
        {/* Resize handles */}
        <ResizeHandle
          dimensions={dimensions}
          apostlesZoneSize={apostlesZoneSize}
          terroristsZoneSize={terroristsZoneSize}
          onZoneResize={handleZoneResize}
          isAdjustable={isAdjustableMidpoint && showSpecialZones}
        />
        
        {/* Watermark */}
        <Watermark
          hide={hideWatermark}
          effects={activeEffects}
          dimensions={dimensions}
        />
      </div>
    </div>
  );
};

export default QuadrantChart;