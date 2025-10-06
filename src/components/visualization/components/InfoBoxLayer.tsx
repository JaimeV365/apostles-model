import React, { createContext, useContext, useState, useCallback } from 'react';
import { DataPoint, Position } from '@/types/base';
import InfoBox from './DataPoints/DataPointInfoBox';

interface InfoBoxData {
  point: DataPoint;
  normalized: Position;
  quadrantInfo: {
    group: string;
    color: string;
  };
  count: number;
  samePoints: DataPoint[];
  availableOptions: any[];
  onClose: () => void;
  onGroupChange: (group: any) => void;
}

interface InfoBoxContextType {
  showInfoBox: (data: InfoBoxData) => void;
  hideInfoBox: () => void;
  isVisible: boolean;
  infoBoxData: InfoBoxData | null;
}

const InfoBoxContext = createContext<InfoBoxContextType | null>(null);

export const useInfoBox = () => {
  const context = useContext(InfoBoxContext);
  if (!context) {
    throw new Error('useInfoBox must be used within an InfoBoxProvider');
  }
  return context;
};

interface InfoBoxProviderProps {
  children: React.ReactNode;
}

export const InfoBoxProvider: React.FC<InfoBoxProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [infoBoxData, setInfoBoxData] = useState<InfoBoxData | null>(null);

  const showInfoBox = useCallback((data: InfoBoxData) => {
    setInfoBoxData(data);
    setIsVisible(true);
  }, []);

  const hideInfoBox = useCallback(() => {
    setIsVisible(false);
    setInfoBoxData(null);
  }, []);

  return (
    <InfoBoxContext.Provider value={{ 
      showInfoBox, 
      hideInfoBox, 
      isVisible, 
      infoBoxData
    }}>
      {children}
    </InfoBoxContext.Provider>
  );
};

interface InfoBoxLayerProps {
  // This component will render the InfoBox in the dedicated layer
}

export const InfoBoxLayer: React.FC<InfoBoxLayerProps> = () => {
  const { isVisible, infoBoxData, hideInfoBox } = useInfoBox();

  if (!isVisible || !infoBoxData) {
    return null;
  }

  return (
    <InfoBox
      point={infoBoxData.point}
      normalized={infoBoxData.normalized}
      quadrantInfo={infoBoxData.quadrantInfo}
      count={infoBoxData.count}
      samePoints={infoBoxData.samePoints}
      availableOptions={infoBoxData.availableOptions}
      onClose={hideInfoBox}
      onGroupChange={infoBoxData.onGroupChange}
    />
  );
};

export default InfoBoxLayer;
