import { DataPoint } from 'types/base';
import { GridDimensions as BaseGridDimensions } from '@/types/base';
export type Scale = '0-10' | '1-5' | '1-7' | '1-10';
export type ResizingZone = 'apostles' | 'terrorists' | null;

export interface Position {
  x: number;
  y: number;
}

export type GridDimensions = BaseGridDimensions;

export interface ZoneSizes {
  apostles: number;
  terrorists: number;
}

export interface ScaleConfig {
  satisfaction: Scale;
  loyalty: Scale;
}

export interface QuadrantCell {
  left: string;
  bottom: string;
  width: string;
  height: string;
}

export interface SpecialCell extends QuadrantCell {
  size: number;
}

export interface QuadrantLayout {
  apostles: SpecialCell;
  terrorists: SpecialCell;
  nearApostles: Array<SpecialCell> | null;
  quadrants: {
    loyalists: QuadrantCell;
    mercenaries: QuadrantCell;
    hostages: QuadrantCell;
    defectors: QuadrantCell;
  };
}

export interface TestZones8Props {
  data: DataPoint[];
  scales: ScaleConfig;
  hideWatermark?: boolean;
  effects?: Set<string>;
  onSecretCode?: (code: string) => void;labelMode: 'all' | 'quadrants' | 'sub-sections' | 'none';
  setLabelMode: (mode: 'all' | 'quadrants' | 'sub-sections' | 'none') => void;
}

export interface GridLine {
  type: 'vertical' | 'horizontal';
  position: number;
  isHalf: boolean;
}

export interface FrequencyStats {
  maxFrequency: number;
  hasOverlaps: boolean;
  frequencyMap: Map<string, number>;
}

export interface EnhancedDataPoint extends DataPoint {
  frequency: number;
  quadrant: string;
  normalizedSatisfaction: number;
  normalizedLoyalty: number;
}

export interface VisualizationEffects {
  hideWatermark: boolean;
  customLogo?: string;
}

export interface GridControlsProps {
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
  showLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;
  isClassicModel: boolean;
  onIsClassicModelChange: (isClassic: boolean) => void;
}

export interface FrequencyControlsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  threshold: number;
  onThresholdChange: (threshold: number) => void;
  maxFrequency: number;
}