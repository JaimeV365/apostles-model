import { useCallback } from 'react';
import { Midpoint } from '@/types/base';
import { useQuadrantAssignment } from '../context/QuadrantAssignmentContext';

interface UseChartHandlersProps {
  maxSizes: {
    apostles: number;
    terrorists: number;
  };
}

interface ChartHandlers {
  handleMidpointChange: (newMidpoint: Midpoint) => void;
  handleZoneResize: (zone: 'apostles' | 'terrorists', newSize: number) => void;
  handleLabelModeChange: (mode: 'all' | 'quadrants' | 'sub-sections' | 'none') => void;
}

/**
 * Custom hook that encapsulates all chart event handlers
 * Extracted from QuadrantChart component to improve modularity
 * 
 * @param maxSizes - Maximum allowed sizes for apostles and terrorists zones
 * @returns Object containing all chart event handlers
 */
export const useChartHandlers = ({ maxSizes }: UseChartHandlersProps): ChartHandlers => {
  // Get context values
  const { 
    setMidpoint, 
    setApostlesZoneSize, 
    setTerroristsZoneSize 
  } = useQuadrantAssignment();

  // Handle midpoint change
  const handleMidpointChange = useCallback((newMidpoint: Midpoint) => {
    console.time('🎯 MIDPOINT_MOVEMENT');
    setMidpoint(newMidpoint);
    console.timeEnd('🎯 MIDPOINT_MOVEMENT');
  }, [setMidpoint]);

  // Handle zone resize
  const handleZoneResize = useCallback((zone: 'apostles' | 'terrorists', newSize: number) => {
    if (zone === 'apostles') {
      const finalSize = Math.min(newSize, maxSizes.apostles);
      console.log(`📈 Calling setApostlesZoneSize(${finalSize})`);
      setApostlesZoneSize(finalSize);
    } else {
      const finalSize = Math.min(newSize, maxSizes.terrorists);
      console.log(`📈 Calling setTerroristsZoneSize(${finalSize})`);
      setTerroristsZoneSize(finalSize);
    }
  }, [maxSizes, setApostlesZoneSize, setTerroristsZoneSize]);

  // Handle label mode change
  const handleLabelModeChange = useCallback((mode: 'all' | 'quadrants' | 'sub-sections' | 'none') => {
    // This will be handled by the component's local state
    // We're keeping the same interface for now
  }, []);

  return {
    handleMidpointChange,
    handleZoneResize,
    handleLabelModeChange
  };
};