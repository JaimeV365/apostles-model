// src/components/visualization/context/QuadrantAssignmentContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { DataPoint, ScaleFormat, SpecialZoneBoundaries } from '../../../types/base';
import { calculateSpecialZoneBoundaries } from '../utils/zoneCalculator';
import type { QuadrantOption } from '../components/DataPoints/DataPointInfoBox';

// Define quadrant types
export type QuadrantType = 'loyalists' | 'mercenaries' | 'hostages' | 'defectors' | 'apostles' | 'terrorists' | 'near_apostles' | 'near_terrorists' | 'neutral';

// Define the shape of our context (keeping the same interface)
interface QuadrantAssignmentContextType {
  // Midpoint state
  midpoint: { sat: number; loy: number };
  setMidpoint: (newMidpoint: { sat: number; loy: number }) => void;
  
  // Zone size state - adding direct access to these
  apostlesZoneSize: number;
  terroristsZoneSize: number;
  setApostlesZoneSize: (size: number) => void;
  setTerroristsZoneSize: (size: number) => void;
  
  // Manual assignments management
  manualAssignments: Map<string, QuadrantType>;
  updateManualAssignment: (pointId: string, quadrant: QuadrantType) => void;
  clearManualAssignment: (pointId: string) => void;
  
  // Neutral state management
  neutralAssignments: Set<string>;
  setNeutralAssignment: (pointId: string, isNeutral: boolean) => void;
  isPointNeutral: (point: DataPoint) => boolean;
  showNeutralPoints: boolean;
  setShowNeutralPoints: (show: boolean) => void;
  
  // Quadrant determination
  getQuadrantForPoint: (point: DataPoint) => QuadrantType;
  
  // Distribution statistics
  distribution: Record<QuadrantType, number>;
  
  // Scale information
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  
  // Terminology management
  isClassicModel: boolean;
  
  // Enhanced classification functions
  getDisplayNameForQuadrant: (quadrantType: QuadrantType) => string;
  getBoundaryOptions: (point: DataPoint) => QuadrantOption[];
  isPointInSpecialZone: (point: DataPoint) => boolean;
  
  // Special zone boundaries
  specialZoneBoundaries: SpecialZoneBoundaries;
  
  // Near-apostles/terrorists availability
  hasSpaceForNearApostles: boolean;
  hasSpaceForNearTerrorists: boolean;
  
  // Show special zones flag
  showSpecialZones: boolean;
  setShowSpecialZones: (show: boolean) => void;
  
  // Show near-apostles flag
  showNearApostles: boolean;
  setShowNearApostles: (show: boolean) => void;
}

// Create the context
const QuadrantAssignmentContext = createContext<QuadrantAssignmentContextType | undefined>(undefined);

// Provider component
interface QuadrantAssignmentProviderProps {
  children: React.ReactNode;
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  isClassicModel: boolean;
  apostlesZoneSize: number;
  terroristsZoneSize: number;
  onApostlesZoneSizeChange?: (size: number) => void;
  onTerroristsZoneSizeChange?: (size: number) => void;
  showSpecialZones: boolean;
  showNearApostles: boolean;
}

export const QuadrantAssignmentProvider: React.FC<QuadrantAssignmentProviderProps> = ({
  children,
  satisfactionScale,
  loyaltyScale,
  isClassicModel,
  apostlesZoneSize: externalApostlesZoneSize,
  terroristsZoneSize: externalTerroristsZoneSize,
  onApostlesZoneSizeChange,
  onTerroristsZoneSizeChange,
  showSpecialZones,
  showNearApostles
}) => {
  // Internal state for zone sizes
  const [internalApostlesZoneSize, setInternalApostlesZoneSize] = useState(externalApostlesZoneSize);
  const [internalTerroristsZoneSize, setInternalTerroristsZoneSize] = useState(externalTerroristsZoneSize);
  
  // Use external values when they change
  useEffect(() => {
    setInternalApostlesZoneSize(externalApostlesZoneSize);
  }, [externalApostlesZoneSize]);
  
  useEffect(() => {
    setInternalTerroristsZoneSize(externalTerroristsZoneSize);
  }, [externalTerroristsZoneSize]);
  
  // Use internal state for the actual values
  const apostlesZoneSize = internalApostlesZoneSize;
  const terroristsZoneSize = internalTerroristsZoneSize;
  
  // State for manual assignments
  const [manualAssignments, setManualAssignments] = useState<Map<string, QuadrantType>>(new Map());
  
  // State for neutral assignments
  const [neutralAssignments, setNeutralAssignments] = useState<Set<string>>(new Set());
  const [showNeutralPoints, setShowNeutralPoints] = useState(false);
  
  // State for midpoint
  const [midpoint, setMidpoint] = useState({ sat: 3, loy: 4 });
  
  // Zone size change handlers
  const setApostlesZoneSize = (size: number) => {
    setInternalApostlesZoneSize(size);
    if (onApostlesZoneSizeChange) {
      onApostlesZoneSizeChange(size);
    }
  };
  
  const setTerroristsZoneSize = (size: number) => {
    setInternalTerroristsZoneSize(size);
    if (onTerroristsZoneSizeChange) {
      onTerroristsZoneSizeChange(size);
    }
  };
  
  // Manual assignment functions
  const updateManualAssignment = useCallback((pointId: string, quadrant: QuadrantType) => {
    setManualAssignments(prev => {
      const newMap = new Map(prev);
      newMap.set(pointId, quadrant);
      return newMap;
    });
  }, []);
  
  const clearManualAssignment = useCallback((pointId: string) => {
    setManualAssignments(prev => {
      const newMap = new Map(prev);
      newMap.delete(pointId);
      return newMap;
    });
  }, []);
  
  // Neutral assignment functions
  const setNeutralAssignment = useCallback((pointId: string, isNeutral: boolean) => {
    setNeutralAssignments(prev => {
      const newSet = new Set(prev);
      if (isNeutral) {
        newSet.add(pointId);
      } else {
        newSet.delete(pointId);
      }
      return newSet;
    });
  }, []);
  
  const isPointNeutral = useCallback((point: DataPoint) => {
    return neutralAssignments.has(point.id);
  }, [neutralAssignments]);
  
  // Calculate special zone boundaries
  const specialZoneBoundaries = useMemo(() => {
    return calculateSpecialZoneBoundaries(
      apostlesZoneSize,
      terroristsZoneSize,
      satisfactionScale,
      loyaltyScale
    );
  }, [apostlesZoneSize, terroristsZoneSize, satisfactionScale, loyaltyScale]);
  
  // Calculate space availability for near-apostles and near-terrorists
  const hasSpaceForNearApostles = useMemo(() => {
    const maxSat = parseInt(satisfactionScale.split('-')[1]);
    const maxLoy = parseInt(loyaltyScale.split('-')[1]);
    const availableSatCells = maxSat - midpoint.sat;
    const availableLoyaltyCells = maxLoy - midpoint.loy;
    return availableSatCells >= 2 && availableLoyaltyCells >= 1;
  }, [satisfactionScale, loyaltyScale, midpoint]);
  
  const hasSpaceForNearTerrorists = useMemo(() => {
    const maxSat = parseInt(satisfactionScale.split('-')[1]);
    const maxLoy = parseInt(loyaltyScale.split('-')[1]);
    const availableSatCells = midpoint.sat - 1;
    const availableLoyaltyCells = midpoint.loy - 1;
    return availableSatCells >= 1 && availableLoyaltyCells >= 1;
  }, [satisfactionScale, loyaltyScale, midpoint]);
  
  // Natural quadrant classification (without manual assignments)
  const getNaturalQuadrantForPoint = useCallback((point: DataPoint): QuadrantType => {
    const maxSat = parseInt(satisfactionScale.split('-')[1]);
    const maxLoy = parseInt(loyaltyScale.split('-')[1]);
    
    // Use the corrected boundary calculation
    const boundaries = calculateSpecialZoneBoundaries(
      apostlesZoneSize,
      terroristsZoneSize,
      satisfactionScale,
      loyaltyScale
    );
    
    // Check for special zones first
    if (showSpecialZones) {
      // Check for apostles zone
      if (point.satisfaction >= boundaries.apostles.edgeVertixSat && point.loyalty >= boundaries.apostles.edgeVertixLoy) {
        return 'apostles';
      }
      
      // Check for terrorists zone
      if (point.satisfaction <= boundaries.terrorists.edgeVertixSat && point.loyalty <= boundaries.terrorists.edgeVertixLoy) {
        return 'terrorists';
      }
      
      // Check for near-apostles if space is available
      if (showNearApostles && hasSpaceForNearApostles) {
        const apostlesMinSat = boundaries.apostles.edgeVertixSat;
        const apostlesMinLoy = boundaries.apostles.edgeVertixLoy;
        const nearApostlesMinSat = apostlesMinSat - 1;
        const nearApostlesMinLoy = apostlesMinLoy;
        
        if (point.satisfaction >= nearApostlesMinSat && point.satisfaction < apostlesMinSat && point.loyalty >= apostlesMinLoy) {
          return 'near_apostles';
        }
        
        if (point.satisfaction >= apostlesMinSat && point.loyalty === nearApostlesMinLoy) {
          return 'near_apostles';
        }
        
        if (point.satisfaction === nearApostlesMinSat && point.loyalty === nearApostlesMinLoy) {
          return 'near_apostles';
        }
        
        if (point.satisfaction >= nearApostlesMinSat && point.satisfaction < apostlesMinSat &&
            point.loyalty >= nearApostlesMinLoy && point.loyalty < apostlesMinLoy) {
          return 'near_apostles';
        }
      }
      
      // Check for near-terrorists if space is available
      if (showNearApostles && hasSpaceForNearTerrorists) {
        const terroristsMaxSat = boundaries.terrorists.edgeVertixSat;
        const terroristsMaxLoy = boundaries.terrorists.edgeVertixLoy;
        const nearTerroristsMaxSat = terroristsMaxSat + 1;
        const nearTerroristsMaxLoy = terroristsMaxLoy + 1;
        
        if (point.satisfaction > terroristsMaxSat && point.satisfaction <= nearTerroristsMaxSat && point.loyalty <= terroristsMaxLoy) {
          return 'near_terrorists';
        }
        
        if (point.satisfaction <= terroristsMaxSat && point.loyalty > terroristsMaxLoy && point.loyalty <= nearTerroristsMaxLoy) {
          return 'near_terrorists';
        }
        
        if (point.satisfaction === nearTerroristsMaxSat && point.loyalty === nearTerroristsMaxLoy) {
          return 'near_terrorists';
        }
        
        if (point.satisfaction > terroristsMaxSat && point.satisfaction <= nearTerroristsMaxSat &&
            point.loyalty > terroristsMaxLoy && point.loyalty <= nearTerroristsMaxLoy) {
          return 'near_terrorists';
        }
      }
    }
    
    // Standard quadrant classification
    if (point.satisfaction >= midpoint.sat && point.loyalty >= midpoint.loy) {
      return 'loyalists';
    } else if (point.satisfaction >= midpoint.sat && point.loyalty < midpoint.loy) {
      return 'mercenaries';
    } else if (point.satisfaction < midpoint.sat && point.loyalty >= midpoint.loy) {
      return 'hostages';
    } else {
      return 'defectors';
    }
  }, [satisfactionScale, loyaltyScale, midpoint, apostlesZoneSize, terroristsZoneSize, showSpecialZones, showNearApostles, hasSpaceForNearApostles, hasSpaceForNearTerrorists]);
  
  // Main quadrant classification function (includes manual assignments)
  const getQuadrantForPoint = useCallback((point: DataPoint): QuadrantType => {
    // Check for neutral assignment first
    if (isPointNeutral(point)) {
      return 'neutral';
    }
    
    // Check for manual assignment
    const manualAssignment = manualAssignments.get(point.id);
    if (manualAssignment) {
      return manualAssignment;
    }
    
    // Use natural classification
    return getNaturalQuadrantForPoint(point);
  }, [manualAssignments, isPointNeutral, getNaturalQuadrantForPoint]);
  
  // Distribution calculation
  const distribution = useMemo(() => {
    const dist: Record<QuadrantType, number> = {
      loyalists: 0,
      mercenaries: 0,
      hostages: 0,
      defectors: 0,
      apostles: 0,
      terrorists: 0,
      near_apostles: 0,
      near_terrorists: 0,
      neutral: 0
    };
    
    return dist;
  }, []);
  
  // Display name function
  const getDisplayNameForQuadrant = useCallback((quadrantType: QuadrantType): string => {
    if (isClassicModel) {
      switch (quadrantType) {
        case 'loyalists': return 'Champions';
        case 'mercenaries': return 'Potential Loyalists';
        case 'hostages': return 'At Risk';
        case 'defectors': return 'Cannot Do Much';
        case 'apostles': return 'Apostles';
        case 'terrorists': return 'Terrorists';
        case 'near_apostles': return 'Near Apostles';
        case 'near_terrorists': return 'Near Terrorists';
        case 'neutral': return 'Neutral';
        default: return quadrantType;
      }
    } else {
      switch (quadrantType) {
        case 'loyalists': return 'Loyalists';
        case 'mercenaries': return 'Mercenaries';
        case 'hostages': return 'Hostages';
        case 'defectors': return 'Defectors';
        case 'apostles': return 'Apostles';
        case 'terrorists': return 'Terrorists';
        case 'near_apostles': return 'Near Apostles';
        case 'near_terrorists': return 'Near Terrorists';
        case 'neutral': return 'Neutral';
        default: return quadrantType;
      }
    }
  }, [isClassicModel]);
  
  // Boundary options function
  const getBoundaryOptions = useCallback((point: DataPoint): QuadrantOption[] => {
    const options: QuadrantOption[] = [];
    
    // Add standard quadrants
    options.push({ group: 'loyalists', color: '#10b981' });
    options.push({ group: 'mercenaries', color: '#f59e0b' });
    options.push({ group: 'hostages', color: '#ef4444' });
    options.push({ group: 'defectors', color: '#6b7280' });
    
    // Add special zones if enabled
    if (showSpecialZones) {
      options.push({ group: 'apostles', color: '#8b5cf6' });
      options.push({ group: 'terrorists', color: '#dc2626' });
      
      if (showNearApostles && hasSpaceForNearApostles) {
        options.push({ group: 'near_apostles', color: '#a855f7' });
      }
      
      if (showNearApostles && hasSpaceForNearTerrorists) {
        options.push({ group: 'near_terrorists', color: '#b91c1c' });
      }
    }
    
    // Add neutral option
    options.push({ group: 'neutral', color: '#9ca3af' });
    
    return options;
  }, [showSpecialZones, showNearApostles, hasSpaceForNearApostles, hasSpaceForNearTerrorists]);
  
  // Check if point is in special zone
  const isPointInSpecialZone = useCallback((point: DataPoint): boolean => {
    const quadrant = getQuadrantForPoint(point);
    return ['apostles', 'terrorists', 'near_apostles', 'near_terrorists'].includes(quadrant);
  }, [getQuadrantForPoint]);
  
  const contextValue: QuadrantAssignmentContextType = {
    midpoint,
    setMidpoint,
    apostlesZoneSize,
    terroristsZoneSize,
    setApostlesZoneSize,
    setTerroristsZoneSize,
    manualAssignments,
    updateManualAssignment,
    clearManualAssignment,
    neutralAssignments,
    setNeutralAssignment,
    isPointNeutral,
    showNeutralPoints,
    setShowNeutralPoints,
    getQuadrantForPoint,
    distribution,
    satisfactionScale,
    loyaltyScale,
    isClassicModel,
    getDisplayNameForQuadrant,
    getBoundaryOptions,
    isPointInSpecialZone,
    specialZoneBoundaries,
    hasSpaceForNearApostles,
    hasSpaceForNearTerrorists,
    showSpecialZones,
    setShowSpecialZones: () => {}, // This will be handled by parent component
    showNearApostles,
    setShowNearApostles: () => {}, // This will be handled by parent component
  };
  
  return (
    <QuadrantAssignmentContext.Provider value={contextValue}>
      {children}
    </QuadrantAssignmentContext.Provider>
  );
};

// Hook to use the context
export const useQuadrantAssignment = (): QuadrantAssignmentContextType => {
  const context = useContext(QuadrantAssignmentContext);
  if (context === undefined) {
    throw new Error('useQuadrantAssignment must be used within a QuadrantAssignmentProvider');
  }
  return context;
};

export default QuadrantAssignmentContext;
