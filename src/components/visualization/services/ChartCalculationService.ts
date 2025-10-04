import { 
  GridDimensions, 
  Position, 
  Midpoint, 
  SpecialZoneBoundaries,
  ScaleFormat,
  DataPoint
} from '@/types/base';
import { calculateGrid } from '../utils/gridCalculator';
import { calculateSpecialZoneBoundaries } from '../utils/zoneCalculator';
import { calculatePointFrequencies } from '../utils/frequencyCalculator';
import { calculateMidpointPosition } from '../utils/positionCalculator';

export interface ChartCalculationConfig {
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  midpoint: Midpoint;
  apostlesZoneSize: number;
  terroristsZoneSize: number;
}

export interface ChartCalculationResult {
  dimensions: GridDimensions;
  position: Position;
  maxSizes: { apostles: number; terrorists: number };
  specialZoneBoundaries: SpecialZoneBoundaries;
  frequencyData: any;
  hasSpaceForNearApostles: boolean;
}

export class ChartCalculationService {
  /**
   * Calculate all chart-related dimensions and boundaries
   */
  static calculateChartData(
    config: ChartCalculationConfig,
    data: DataPoint[]
  ): ChartCalculationResult {
    // Calculate grid dimensions
    const dimensions = calculateGrid({
      satisfactionScale: config.satisfactionScale,
      loyaltyScale: config.loyaltyScale,
      midpoint: config.midpoint,
      apostlesZoneSize: config.apostlesZoneSize,
      terroristsZoneSize: config.terroristsZoneSize
    });

    // Calculate midpoint position
    const position = calculateMidpointPosition(config.midpoint, dimensions);

    // Calculate special zone boundaries
    const specialZoneBoundaries = calculateSpecialZoneBoundaries(
      config.apostlesZoneSize,
      config.terroristsZoneSize,
      config.satisfactionScale,
      config.loyaltyScale
    );

    // Calculate point frequencies
    const frequencyData = calculatePointFrequencies(data);

    // Calculate maximum zone sizes
    const maxSizes = this.calculateMaxZoneSizes(dimensions);

    // Check if there's space for near-apostles
    const hasSpaceForNearApostles = this.checkSpaceForNearApostles(
      config.apostlesZoneSize,
      dimensions
    );

    return {
      dimensions,
      position,
      maxSizes,
      specialZoneBoundaries,
      frequencyData,
      hasSpaceForNearApostles
    };
  }

  /**
   * Calculate maximum allowed zone sizes based on grid dimensions
   */
  private static calculateMaxZoneSizes(dimensions: GridDimensions): { apostles: number; terrorists: number } {
    const midCol = dimensions.midpointCol;
    const midRow = dimensions.midpointRow;
    
    // Apostles zone: must stay 1 grid away from midpoint
    const apostlesMax = Math.min(
      dimensions.totalCols - midCol - 1,
      dimensions.totalRows - midRow - 1
    );
    
    // Terrorists zone: must stay 1 grid away from midpoint
    const terroristsMax = Math.min(
      midCol - 1,
      midRow - 1
    );
    
    return {
      apostles: Math.max(0, apostlesMax),
      terrorists: Math.max(0, terroristsMax)
    };
  }

  /**
   * Check if there's enough space for near-apostles zone
   */
  private static checkSpaceForNearApostles(
    apostlesZoneSize: number,
    dimensions: GridDimensions
  ): boolean {
    const midCol = dimensions.midpointCol;
    const midRow = dimensions.midpointRow;
    
    // Need at least 2 cells from midpoint for near-apostles
    const requiredSpace = apostlesZoneSize + 1;
    const availableSpace = Math.min(
      dimensions.totalCols - midCol - 1,
      dimensions.totalRows - midRow - 1
    );
    
    return availableSpace >= requiredSpace;
  }

  /**
   * Validate chart configuration
   */
  static validateConfig(config: ChartCalculationConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate scales
    const validSatScales = ['1-3', '1-5', '1-7', '1-10', '0-10'];
    const validLoyScales = ['1-5', '1-7', '1-10', '0-10'];
    
    if (!validSatScales.includes(config.satisfactionScale)) {
      errors.push(`Invalid satisfaction scale: ${config.satisfactionScale}`);
    }
    
    if (!validLoyScales.includes(config.loyaltyScale)) {
      errors.push(`Invalid loyalty scale: ${config.loyaltyScale}`);
    }
    
    // Validate midpoint
    const satMax = parseInt(config.satisfactionScale.split('-')[1]);
    const loyMax = parseInt(config.loyaltyScale.split('-')[1]);
    
    if (config.midpoint.sat < 1 || config.midpoint.sat > satMax) {
      errors.push(`Midpoint satisfaction (${config.midpoint.sat}) out of range for scale ${config.satisfactionScale}`);
    }
    
    if (config.midpoint.loy < 1 || config.midpoint.loy > loyMax) {
      errors.push(`Midpoint loyalty (${config.midpoint.loy}) out of range for scale ${config.loyaltyScale}`);
    }
    
    // Validate zone sizes
    if (config.apostlesZoneSize < 0) {
      errors.push('Apostles zone size cannot be negative');
    }
    
    if (config.terroristsZoneSize < 0) {
      errors.push('Terrorists zone size cannot be negative');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
