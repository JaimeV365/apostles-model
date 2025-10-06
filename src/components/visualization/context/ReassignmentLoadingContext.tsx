import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { UnifiedLoadingPopup } from '../../ui/UnifiedLoadingPopup';

interface ReassignmentLoadingContextType {
  showReassignmentLoading: () => void;
  hideReassignmentLoading: () => void;
  isReassignmentLoading: boolean;
}

const ReassignmentLoadingContext = createContext<ReassignmentLoadingContextType | null>(null);

export const useReassignmentLoading = () => {
  const context = useContext(ReassignmentLoadingContext);
  if (!context) {
    throw new Error('useReassignmentLoading must be used within a ReassignmentLoadingProvider');
  }
  return context;
};

interface ReassignmentLoadingProviderProps {
  children: React.ReactNode;
}

export const ReassignmentLoadingProvider: React.FC<ReassignmentLoadingProviderProps> = ({ children }) => {
  const [isReassignmentLoading, setIsReassignmentLoading] = useState(false);
  const calculationStartTime = useRef<number>(0);

  const showReassignmentLoading = useCallback(() => {
    setIsReassignmentLoading(true);
    calculationStartTime.current = Date.now();
  }, []);

  const hideReassignmentLoading = useCallback(() => {
    // Ensure loading popup shows for at least 1 second from start time
    const elapsedTime = Date.now() - calculationStartTime.current;
    const remainingTime = Math.max(0, 1000 - elapsedTime);
    
    setTimeout(() => {
      setIsReassignmentLoading(false);
    }, remainingTime);
  }, []);

  return (
    <ReassignmentLoadingContext.Provider value={{ 
      showReassignmentLoading,
      hideReassignmentLoading,
      isReassignmentLoading
    }}>
      {children}
      
      {/* Global Reassignment Loading Popup */}
      <UnifiedLoadingPopup 
        isVisible={isReassignmentLoading} 
        text="segmenting" 
        size="medium" 
      />
    </ReassignmentLoadingContext.Provider>
  );
};

export default ReassignmentLoadingProvider;
