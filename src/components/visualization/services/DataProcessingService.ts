import { DataPoint, Midpoint, ScaleFormat } from '@/types/base';
import { QuadrantType } from '../context/DataProcessingContext';
import { calculateSpecialZoneBoundaries } from '../utils/zoneCalculator';

export interface DataProcessingConfig {
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  midpoint: Midpoint;
  apostlesZoneSize: number;
  terroristsZoneSize: number;
  showNearApostles: boolean;
  showSpecialZones: boolean;
}

export interface QuadrantDistribution {
  [key: string]: number;
}

export interface QuadrantOption {
  group: string;
  color: string;
}

export class DataProcessingService {
  /**
   * Get the natural quadrant for a data point based on its coordinates
   */
  static getNaturalQuadrantForPoint(
    point: DataPoint,
    config: DataProcessingConfig
  ): QuadrantType {
    const { satisfaction, loyalty } = point;
    const { midpoint, apostlesZoneSize, terroristsZoneSize, showSpecialZones, showNearApostles } = config;
    
    
    // Check special zones first if enabled
    if (showSpecialZones) {
      // Calculate special zone boundaries using the same logic as zoneCalculator
      const boundaries = calculateSpecialZoneBoundaries(
        apostlesZoneSize,
        terroristsZoneSize,
        config.satisfactionScale,
        config.loyaltyScale
      );
      
      
      // Near-apostles zone (if enabled) - check BEFORE Apostles to handle L-shape correctly
      if (showNearApostles && apostlesZoneSize > 0) {
        const apostlesMinSat = boundaries.apostles.edgeVertixSat;
        const apostlesMinLoy = boundaries.apostles.edgeVertixLoy;
        const hasSpaceForNearApostles = apostlesMinSat > 1 && apostlesMinLoy > 1;
        
        if (hasSpaceForNearApostles) {
          const nearApostlesMinSat = apostlesMinSat - 1;
          const nearApostlesMinLoy = apostlesMinLoy - 1;
          
          // L-shaped Near-Apostles zone around Apostles zone
          // The L-shape consists of:
          // 1. Left edge: satisfaction in [nearApostlesMinSat, apostlesMinSat), loyalty >= apostlesMinLoy
          // 2. Bottom edge: satisfaction >= apostlesMinSat, loyalty in [nearApostlesMinLoy, apostlesMinLoy)
          // 3. Interior: satisfaction in (nearApostlesMinSat, apostlesMinSat), loyalty in (nearApostlesMinLoy, apostlesMinLoy)
          
          // Check if point is in the L-shaped Near-Apostles zone
          const isInLeftEdge = satisfaction >= nearApostlesMinSat && satisfaction < apostlesMinSat && loyalty >= apostlesMinLoy;
          const isInBottomEdge = satisfaction >= apostlesMinSat && loyalty >= nearApostlesMinLoy && loyalty < apostlesMinLoy;
          const isInInterior = satisfaction > nearApostlesMinSat && satisfaction < apostlesMinSat &&
                               loyalty > nearApostlesMinLoy && loyalty < apostlesMinLoy;
          
          if (isInLeftEdge || isInBottomEdge || isInInterior) {
            return 'near_apostles';
          }
        }
      }
      
      // Apostles zone - check AFTER Near-Apostles to avoid conflicts
      if (satisfaction >= boundaries.apostles.edgeVertixSat && loyalty >= boundaries.apostles.edgeVertixLoy) {
        return 'apostles';
      }
      
      // Terrorists zone
      if (satisfaction <= boundaries.terrorists.edgeVertixSat && loyalty <= boundaries.terrorists.edgeVertixLoy) {
        return 'terrorists';
      }
    }
    
    // Standard quadrants
    if (satisfaction >= midpoint.sat && loyalty >= midpoint.loy) {
      return 'loyalists';
    } else if (satisfaction >= midpoint.sat && loyalty < midpoint.loy) {
      return 'mercenaries';
    } else if (satisfaction < midpoint.sat && loyalty >= midpoint.loy) {
      return 'hostages';
    } else {
      return 'defectors';
    }
  }

  /**
   * Calculate distribution of data points across quadrants
   */
  static calculateDistribution(
    data: DataPoint[],
    manualAssignments: Map<string, QuadrantType>,
    config: DataProcessingConfig
  ): QuadrantDistribution {
    const distribution: QuadrantDistribution = {};
    
    // Initialize all quadrants
    const allQuadrants: QuadrantType[] = [
      'loyalists', 'mercenaries', 'hostages', 'defectors',
      'apostles', 'terrorists', 'near_apostles'
    ];
    
    allQuadrants.forEach(quadrant => {
      distribution[quadrant] = 0;
    });
    
    // Count points in each quadrant
    data.forEach(point => {
      const quadrant = manualAssignments.get(point.id) || 
                      this.getNaturalQuadrantForPoint(point, config);
      distribution[quadrant]++;
    });
    
    return distribution;
  }

  /**
   * Get display name for a quadrant
   */
  static getDisplayNameForQuadrant(quadrant: QuadrantType, isClassicModel: boolean = false): string {
    if (isClassicModel) {
      switch (quadrant) {
        case 'loyalists': return 'Loyalists';
        case 'mercenaries': return 'Mercenaries';
        case 'hostages': return 'Hostages';
        case 'defectors': return 'Defectors';
        case 'apostles': return 'Apostles';
        case 'terrorists': return 'Terrorists';
        case 'near_apostles': return 'Near-Apostles';
        case 'neutral': return 'Neutral';
        default: return quadrant;
      }
    } else {
      // Modern terminology
      switch (quadrant) {
        case 'loyalists': return 'Loyalists';
        case 'mercenaries': return 'Mercenaries';
        case 'hostages': return 'Hostages';
        case 'defectors': return 'Defectors';
        case 'apostles': return 'Advocates';
        case 'terrorists': return 'Trolls';
        case 'near_apostles': return 'Near-Advocates';
        case 'neutral': return 'Neutral';
        default: return quadrant;
      }
    }
  }

  /**
   * Check if a point is in a special zone
   */
  static isPointInSpecialZone(
    point: DataPoint,
    config: DataProcessingConfig
  ): boolean {
    const quadrant = this.getNaturalQuadrantForPoint(point, config);
    return ['apostles', 'terrorists', 'near_apostles'].includes(quadrant);
  }

  /**
   * Get hierarchical classification for a point
   */
  static getHierarchicalClassification(
    point: DataPoint,
    manualAssignments: Map<string, QuadrantType>,
    config: DataProcessingConfig
  ): { baseQuadrant: QuadrantType; specificZone: QuadrantType | null } {
    const assignedQuadrant = manualAssignments.get(point.id);
    const naturalQuadrant = this.getNaturalQuadrantForPoint(point, config);
    const quadrant = assignedQuadrant || naturalQuadrant;
    
    // Map special zones to their base quadrant
    let baseQuadrant: QuadrantType = quadrant;
    let specificZone: QuadrantType | null = null;
    
    if (quadrant === 'apostles' || quadrant === 'near_apostles') {
      baseQuadrant = 'loyalists';
      specificZone = quadrant;
    } else if (quadrant === 'terrorists') {
      baseQuadrant = 'defectors';
      specificZone = quadrant;
    }
    
    return { baseQuadrant, specificZone };
  }

  /**
   * Validate data point
   */
  static validateDataPoint(point: DataPoint, config: DataProcessingConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate coordinates
    const satMax = parseInt(config.satisfactionScale.split('-')[1]);
    const loyMax = parseInt(config.loyaltyScale.split('-')[1]);
    
    if (point.satisfaction < 1 || point.satisfaction > satMax) {
      errors.push(`Satisfaction value ${point.satisfaction} out of range for scale ${config.satisfactionScale}`);
    }
    
    if (point.loyalty < 1 || point.loyalty > loyMax) {
      errors.push(`Loyalty value ${point.loyalty} out of range for scale ${config.loyaltyScale}`);
    }
    
    // Validate required fields
    if (!point.id || point.id.trim() === '') {
      errors.push('Data point must have a valid ID');
    }
    
    if (typeof point.satisfaction !== 'number' || isNaN(point.satisfaction)) {
      errors.push('Satisfaction must be a valid number');
    }
    
    if (typeof point.loyalty !== 'number' || isNaN(point.loyalty)) {
      errors.push('Loyalty must be a valid number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Filter data points based on criteria
   */
  static filterDataPoints(
    data: DataPoint[],
    filters: {
      quadrant?: QuadrantType;
      minSatisfaction?: number;
      maxSatisfaction?: number;
      minLoyalty?: number;
      maxLoyalty?: number;
    },
    config: DataProcessingConfig
  ): DataPoint[] {
    return data.filter(point => {
      // Quadrant filter
      if (filters.quadrant) {
        const pointQuadrant = this.getNaturalQuadrantForPoint(point, config);
        if (pointQuadrant !== filters.quadrant) {
          return false;
        }
      }
      
      // Satisfaction range filter
      if (filters.minSatisfaction !== undefined && point.satisfaction < filters.minSatisfaction) {
        return false;
      }
      if (filters.maxSatisfaction !== undefined && point.satisfaction > filters.maxSatisfaction) {
        return false;
      }
      
      // Loyalty range filter
      if (filters.minLoyalty !== undefined && point.loyalty < filters.minLoyalty) {
        return false;
      }
      if (filters.maxLoyalty !== undefined && point.loyalty > filters.maxLoyalty) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Get the effective quadrant for a point (considering manual assignments)
   */
  /**
   * Check if a point is at the neutral position (exactly on the midpoint)
   */
  static isPointNeutral(point: DataPoint, config: DataProcessingConfig): boolean {
    return point.satisfaction === config.midpoint.sat && point.loyalty === config.midpoint.loy;
  }

  static getQuadrantForPoint(
    point: DataPoint,
    manualAssignments: Map<string, QuadrantType>,
    config: DataProcessingConfig
  ): QuadrantType {
    // Check for manual assignment first (this overrides everything)
    const manualAssignment = manualAssignments.get(point.id);
    if (manualAssignment) {
      console.log(`🔍 Point ${point.id} has manual assignment: ${manualAssignment}`);
      return manualAssignment;
    }
    
    // Check for neutral position (only if no manual assignment)
    if (this.isPointNeutral(point, config)) {
      return 'neutral';
    }
    
    // Fall back to natural quadrant
    return this.getNaturalQuadrantForPoint(point, config);
  }

  /**
   * Auto-reassign points when midpoint changes
   */
  static autoReassignPointsOnMidpointChange(
    data: DataPoint[],
    manualAssignments: Map<string, QuadrantType>,
    config: DataProcessingConfig,
    getQuadrantForPoint: (point: DataPoint) => QuadrantType,
    getNaturalQuadrantForPoint: (point: DataPoint) => QuadrantType,
    getDisplayNameForQuadrant: (quadrant: QuadrantType) => string,
    isPointInSpecialZone: (point: DataPoint) => boolean,
    shouldAutoReassignPoint: (point: DataPoint, manualQuadrant: QuadrantType, naturalQuadrant: QuadrantType) => boolean
  ): Map<string, QuadrantType> {
    if (manualAssignments.size === 0) return manualAssignments;

    console.log(`🔄 Auto-reassigning ${manualAssignments.size} manually assigned points after midpoint change`);
    
    const updatedAssignments = new Map(manualAssignments);
    let reassignedCount = 0;

    // Check each manually assigned point
    for (const [pointId, manualQuadrant] of Array.from(manualAssignments)) {
      // Find the point in the data
      const point = data.find(p => p.id === pointId);
      if (!point) {
        console.log(`⚠️ Point ${pointId} not found in data, removing manual assignment`);
        updatedAssignments.delete(pointId);
        continue;
      }

      // Get the natural quadrant for this point with current midpoint
      const naturalQuadrant = getNaturalQuadrantForPoint(point);
      
      // Check if the point is now clearly in a different quadrant
      const shouldReassign = shouldAutoReassignPoint(point, manualQuadrant, naturalQuadrant);
      
      if (shouldReassign) {
        console.log(`🔄 Auto-reassigning point ${pointId} (${point.satisfaction},${point.loyalty}): ${manualQuadrant} → ${naturalQuadrant}`);
        updatedAssignments.delete(pointId);
        reassignedCount++;
      } else {
        console.log(`✅ Keeping manual assignment for point ${pointId} (${point.satisfaction},${point.loyalty}): ${manualQuadrant} (natural: ${naturalQuadrant})`);
      }
    }

    if (reassignedCount > 0) {
      console.log(`🔄 Auto-reassigned ${reassignedCount} points after midpoint change`);
    }

    return updatedAssignments;
  }
}
