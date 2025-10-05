import React from 'react';
import { DataPointRenderer } from './DataPointRenderer';
import { CanvasDataPointRenderer } from './CanvasDataPointRenderer';
import { GridDimensions, Position, DataPoint, ScaleFormat } from '@/types/base';

interface DataPointRendererSelectorProps {
  // Feature flag
  useCanvasRenderer: boolean;
  
  // All the props that both renderers need
  data: DataPoint[];
  dimensions: GridDimensions;
  position: Position;
  frequencyFilterEnabled: boolean;
  frequencyThreshold: number;
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  showNearApostles: boolean;
  apostlesZoneSize: number;
  terroristsZoneSize: number;
  isClassicModel: boolean;
  onPointSelect?: (point: DataPoint & {
    frequency: number;
    quadrant: string;
    normalizedSatisfaction: number;
    normalizedLoyalty: number;
  }) => void;
  selectedPointId?: string;
}

export const DataPointRendererSelector: React.FC<DataPointRendererSelectorProps> = ({
  useCanvasRenderer,
  ...props
}) => {
  if (useCanvasRenderer) {
    return <CanvasDataPointRenderer {...props} />;
  }
  
  return <DataPointRenderer {...props} />;
};

export default DataPointRendererSelector;




