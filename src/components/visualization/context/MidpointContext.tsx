import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ScaleFormat } from '../../../types/base';

interface MidpointContextType {
  midpoint: { sat: number; loy: number };
  setMidpoint: (newMidpoint: { sat: number; loy: number }) => void;
}

const MidpointContext = createContext<MidpointContextType | undefined>(undefined);

interface MidpointProviderProps {
  children: ReactNode;
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
}

export const MidpointProvider: React.FC<MidpointProviderProps> = ({
  children,
  satisfactionScale,
  loyaltyScale
}) => {
  // Calculate initial midpoint based on scales
  const initialMidpoint = {
    sat: Math.ceil(parseInt(satisfactionScale.split('-')[1]) / 2),
    loy: Math.ceil(parseInt(loyaltyScale.split('-')[1]) / 2)
  };

  const [midpoint, setMidpoint] = useState(initialMidpoint);

  // Update midpoint when scales change
  useEffect(() => {
    const newMidpoint = {
      sat: Math.ceil(parseInt(satisfactionScale.split('-')[1]) / 2),
      loy: Math.ceil(parseInt(loyaltyScale.split('-')[1]) / 2)
    };
    setMidpoint(newMidpoint);
  }, [satisfactionScale, loyaltyScale]);

  return (
    <MidpointContext.Provider value={{ midpoint, setMidpoint }}>
      {children}
    </MidpointContext.Provider>
  );
};

export const useMidpoint = (): MidpointContextType => {
  const context = useContext(MidpointContext);
  if (context === undefined) {
    throw new Error('useMidpoint must be used within a MidpointProvider');
  }
  return context;
};