import React from 'react';
import { GridDimensions, Position, SpecialZoneBoundaries, ScaleFormat, Midpoint } from '@/types/base';
import { GridRenderer, ScaleMarkers, AxisLegends } from '../grid';
import { Quadrants } from '../zones/Quadrants';
import { SpecialZones } from '../zones/SpecialZones';
import { DataPointRendererSelector } from '../components/DataPoints/DataPointRendererSelector';
import { MidpointHandle } from '../controls/MidpointControl';
import { ResizeHandle } from '../controls/ResizeHandles';
import { Watermark } from '../watermark';
import { ChartErrorBoundary, DataProcessingErrorBoundary } from '../error';

interface ChartContainerProps {
  // Chart dimensions and positioning
  dimensions: GridDimensions;
  position: Position;
  specialZoneBoundaries: SpecialZoneBoundaries;
  midpoint: Midpoint;
  
  // Data and scales
  data: any[];
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  
  // Zone configuration
  apostlesZoneSize: number;
  terroristsZoneSize: number;
  maxSizes: { apostles: number; terrorists: number };
  
  // Display options
  showGrid: boolean;
  showScaleNumbers: boolean;
  showLegends: boolean;
  showLabels: boolean;
  showQuadrantLabels: boolean;
  showSpecialZoneLabels: boolean;
  showSpecialZones: boolean;
  showNearApostles: boolean;
  isClassicModel: boolean;
  isAdjustableMidpoint: boolean;
  hideWatermark: boolean;
  activeEffects: Set<string>;
  
  // Performance options
  useCanvasRenderer?: boolean;
  
  // Frequency filtering
  frequencyFilterEnabled: boolean;
  frequencyThreshold: number;
  frequencyData: any;
  
  // Event handlers
  onMidpointChange: (midpoint: any) => void;
  onZoneResize: (zone: 'apostles' | 'terrorists', newSize: number) => void;
  onShowNearApostlesChange: (show: boolean) => void;
  onApostlesZoneSizeChange: (size: number) => void;
  onTerroristsZoneSizeChange: (size: number) => void;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  dimensions,
  position,
  specialZoneBoundaries,
  midpoint,
  data,
  satisfactionScale,
  loyaltyScale,
  apostlesZoneSize,
  terroristsZoneSize,
  maxSizes,
  showGrid,
  showScaleNumbers,
  showLegends,
  showLabels,
  showQuadrantLabels,
  showSpecialZoneLabels,
  showSpecialZones,
  showNearApostles,
  isClassicModel,
  isAdjustableMidpoint,
  hideWatermark,
  activeEffects,
  useCanvasRenderer,
  frequencyFilterEnabled,
  frequencyThreshold,
  frequencyData,
  onMidpointChange,
  onZoneResize,
  onShowNearApostlesChange,
  onApostlesZoneSizeChange,
  onTerroristsZoneSizeChange,
}) => {
  return (
    <ChartErrorBoundary>
      <div 
        className="chart-container"
        data-apostles-boundary-sat={specialZoneBoundaries.apostles.edgeVertixSat}
        data-apostles-boundary-loy={specialZoneBoundaries.apostles.edgeVertixLoy}
        data-terrorists-boundary-sat={specialZoneBoundaries.terrorists.edgeVertixSat}
        data-terrorists-boundary-loy={specialZoneBoundaries.terrorists.edgeVertixLoy}
      >
        {/* Grid Layer */}
        <GridRenderer
          dimensions={dimensions}
          showGrid={showGrid}
        />

        {/* Scale Numbers Layer */}
        {showScaleNumbers && (
          <ScaleMarkers
            satisfactionScale={satisfactionScale}
            loyaltyScale={loyaltyScale}
            showScaleNumbers={showScaleNumbers}
          />
        )}

        {/* Legends Layer */}
        {showLegends && (
          <AxisLegends
            satisfactionScale={satisfactionScale}
            loyaltyScale={loyaltyScale}
            showLegends={showLegends}
            showScaleNumbers={showScaleNumbers}
          />
        )}
        
        {/* Quadrants Layer */}
        <Quadrants
          position={position}
          isClassicModel={isClassicModel}
          showLabels={showLabels && showQuadrantLabels}
          showQuadrantLabels={showQuadrantLabels}
        />
        
        {/* Special Zones Layer */}
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
              onApostlesZoneSizeChange(newSizes.apostles);
              onTerroristsZoneSizeChange(newSizes.terrorists);
            }}
            isClassicModel={isClassicModel}
            showLabels={showLabels && showSpecialZoneLabels}
            showHandles={true}
          />
        )}
        
        {/* Data Points Layer - Wrapped with Data Processing Error Boundary */}
        <DataProcessingErrorBoundary>
          <DataPointRendererSelector
            useCanvasRenderer={useCanvasRenderer || false}
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
        </DataProcessingErrorBoundary>
        
        {/* Interactive Elements Layer */}
        <MidpointHandle
          position={position}
          midpoint={midpoint}
          dimensions={dimensions}
          satisfactionScale={satisfactionScale}
          loyaltyScale={loyaltyScale}
          onMidpointChange={onMidpointChange}
          isAdjustable={isAdjustableMidpoint}
          apostlesZoneSize={apostlesZoneSize}
          terroristsZoneSize={terroristsZoneSize}
          showNearApostles={showNearApostles}
          onShowNearApostlesChange={onShowNearApostlesChange}
          showSpecialZones={showSpecialZones}
        />
        
        <ResizeHandle
          dimensions={dimensions}
          apostlesZoneSize={apostlesZoneSize}
          terroristsZoneSize={terroristsZoneSize}
          onZoneResize={onZoneResize}
          isAdjustable={isAdjustableMidpoint && showSpecialZones}
        />
        
        {/* Watermark Layer */}
        <Watermark
          hide={hideWatermark}
          effects={activeEffects}
          dimensions={dimensions}
        />
      </div>
    </ChartErrorBoundary>
  );
};
