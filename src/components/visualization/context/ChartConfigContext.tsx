import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ScaleFormat } from '../../../types/base';

// Define the shape of our chart configuration context
interface ChartConfigContextType {
  // Midpoint state
  midpoint: { sat: number; loy: number };
  setMidpoint: (newMidpoint: { sat: number; loy: number }) => void;
  
  // Zone size state
  apostlesZoneSize: number;
  terroristsZoneSize: number;
  setApostlesZoneSize: (size: number) => void;
  setTerroristsZoneSize: (size: number) => void;
  
  // Scale information
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  
  // Terminology management
  isClassicModel: boolean;
}

const ChartConfigContext = createContext<ChartConfigContextType | undefined>(undefined);

interface ChartConfigProviderProps {
  children: React.ReactNode;
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  initialMidpoint?: { sat: number; loy: number };
  isClassicModel?: boolean;
  apostlesZoneSize?: number;
  terroristsZoneSize?: number;
  onApostlesZoneSizeChange?: (size: number) => void;
  onTerroristsZoneSizeChange?: (size: number) => void;
}

export const ChartConfigProvider: React.FC<ChartConfigProviderProps> = ({
  children,
  satisfactionScale,
  loyaltyScale,
  initialMidpoint: providedInitialMidpoint,
  isClassicModel = true,
  apostlesZoneSize: externalApostlesZoneSize = 1,
  terroristsZoneSize: externalTerroristsZoneSize = 1,
  onApostlesZoneSizeChange,
  onTerroristsZoneSizeChange,
}) => {
  // Store internal state for zone sizes
  const [apostlesZoneSize, setInternalApostlesZoneSize] = useState(externalApostlesZoneSize);
  const [terroristsZoneSize, setInternalTerroristsZoneSize] = useState(externalTerroristsZoneSize);
  
  // Wrapper functions to update both internal state and call the external handlers
  const setApostlesZoneSize = (size: number) => {
    console.log(`📈 Setting apostles size to ${size}`);
    console.log(`📈 External callback exists: ${!!onApostlesZoneSizeChange}`);
    setInternalApostlesZoneSize(size);
    if (onApostlesZoneSizeChange) {
      console.log(`📈 Calling external onApostlesZoneSizeChange(${size})`);
      onApostlesZoneSizeChange(size);
    } else {
      console.log(`⚠️ No external onApostlesZoneSizeChange callback found`);
    }
  };
  
  const setTerroristsZoneSize = (size: number) => {
    console.log(`📈 Setting terrorists size to ${size}`);
    setInternalTerroristsZoneSize(size);
    if (onTerroristsZoneSizeChange) {
      onTerroristsZoneSizeChange(size);
    }
  };

  // Calculate initial midpoint based on scales
  const calculatedInitialMidpoint = useMemo(() => {
    const minSat = parseInt(satisfactionScale.split('-')[0]);
    const maxSat = parseInt(satisfactionScale.split('-')[1]);
    const minLoy = parseInt(loyaltyScale.split('-')[0]);
    const maxLoy = parseInt(loyaltyScale.split('-')[1]);
    
    return {
      sat: minSat + (maxSat - minSat) / 2,
      loy: minLoy + (maxLoy - minLoy) / 2
    };
  }, [satisfactionScale, loyaltyScale]);

  // Use provided initial midpoint if available, otherwise use calculated one
  const finalInitialMidpoint = providedInitialMidpoint || calculatedInitialMidpoint;

  // State
  const [midpoint, setMidpoint] = useState(finalInitialMidpoint);
  const [isClassicModelState, setIsClassicModelState] = useState(isClassicModel);

  // Update midpoint if scales change and no initial midpoint was provided
  useEffect(() => {
    if (!providedInitialMidpoint) {
      setMidpoint(calculatedInitialMidpoint);
    }
  }, [satisfactionScale, loyaltyScale, calculatedInitialMidpoint, providedInitialMidpoint]);

  // Update isClassicModel when prop changes
  useEffect(() => {
    setIsClassicModelState(isClassicModel);
  }, [isClassicModel]);

  const contextValue = useMemo(() => ({
    midpoint,
    setMidpoint,
    apostlesZoneSize,
    terroristsZoneSize,
    setApostlesZoneSize,
    setTerroristsZoneSize,
    satisfactionScale,
    loyaltyScale,
    isClassicModel: isClassicModelState,
  }), [
    midpoint,
    apostlesZoneSize,
    terroristsZoneSize,
    setApostlesZoneSize,
    setTerroristsZoneSize,
    satisfactionScale,
    loyaltyScale,
    isClassicModelState,
  ]);

  return (
    <ChartConfigContext.Provider value={contextValue}>
      {children}
    </ChartConfigContext.Provider>
  );
};

// Hook for using the context
export const useChartConfig = (): ChartConfigContextType => {
  const context = useContext(ChartConfigContext);
  if (context === undefined) {
    throw new Error('useChartConfig must be used within a ChartConfigProvider');
  }
  return context;
};





