import { useState } from 'react';

export interface ChartState {
  // Scale and legend visibility
  showScaleNumbers: boolean;
  setShowScaleNumbers: (show: boolean) => void;
  showLegends: boolean;
  setShowLegends: (show: boolean) => void;
  
  // Label configuration
  labelMode: 'all' | 'quadrants' | 'sub-sections' | 'none';
  setLabelMode: (mode: 'all' | 'quadrants' | 'sub-sections' | 'none') => void;
  showQuadrantLabels: boolean;
  setShowQuadrantLabels: (show: boolean) => void;
  showSpecialZoneLabels: boolean;
  setShowSpecialZoneLabels: (show: boolean) => void;
  
  // Label positioning
  labelPositioning: 'above-dots' | 'below-dots';
  setLabelPositioning: (positioning: 'above-dots' | 'below-dots') => void;
}

export const useChartState = (): ChartState => {
  // State for scale numbers and legends
  const [showScaleNumbers, setShowScaleNumbers] = useState<boolean>(true);
  const [showLegends, setShowLegends] = useState<boolean>(true);
  
  // State for labels
  const [labelMode, setLabelMode] = useState<'all' | 'quadrants' | 'sub-sections' | 'none'>('all');
  const [showQuadrantLabels, setShowQuadrantLabels] = useState<boolean>(true);
  const [showSpecialZoneLabels, setShowSpecialZoneLabels] = useState<boolean>(true);
  
  // State for label positioning
  const [labelPositioning, setLabelPositioning] = useState<'above-dots' | 'below-dots'>('above-dots');
  
  return {
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
  };
};



