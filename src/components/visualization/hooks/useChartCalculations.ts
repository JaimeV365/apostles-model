import { useMemo } from 'react';
import { 
  DataPoint,
  ScaleFormat
} from '@/types/base';
import { useQuadrantAssignment } from '../context/QuadrantAssignmentContext';
import { ChartCalculationService } from '../services';

interface UseChartCalculationsProps {
  data: DataPoint[];
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
}

/**
 * Custom hook that encapsulates all chart-related calculations using the ChartCalculationService
 * Extracted from QuadrantChart component to improve modularity and maintainability
 * 
 * @param data - Array of data points
 * @param satisfactionScale - Satisfaction scale format (e.g., '1-5', '1-7')
 * @param loyaltyScale - Loyalty scale format (e.g., '1-5', '1-7')
 * @returns Object containing all calculated chart values
 */
export const useChartCalculations = ({
  data,
  satisfactionScale,
  loyaltyScale,
}: UseChartCalculationsProps) => {
  const { midpoint, apostlesZoneSize, terroristsZoneSize } = useQuadrantAssignment();

  const chartData = useMemo(() => {
    const config = {
      satisfactionScale,
      loyaltyScale,
      midpoint,
      apostlesZoneSize,
      terroristsZoneSize
    };

    // Validate configuration
    const validation = ChartCalculationService.validateConfig(config);
    if (!validation.isValid) {
      console.warn('Invalid chart configuration:', validation.errors);
    }

    return ChartCalculationService.calculateChartData(config, data);
  }, [data, satisfactionScale, loyaltyScale, midpoint, apostlesZoneSize, terroristsZoneSize]);

  return {
    dimensions: chartData.dimensions,
    position: chartData.position,
    maxSizes: chartData.maxSizes,
    specialZoneBoundaries: chartData.specialZoneBoundaries,
    frequencyData: chartData.frequencyData,
    hasSpaceForNearApostles: chartData.hasSpaceForNearApostles,
  };
};