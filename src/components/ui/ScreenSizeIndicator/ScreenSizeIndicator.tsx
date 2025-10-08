import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, AlertTriangle } from 'lucide-react';
import './ScreenSizeIndicator.css';

interface ScreenSizeIndicatorProps {
  screenSize: 'medium' | 'small' | 'very-small' | null;
  className?: string;
}

export const ScreenSizeIndicator: React.FC<ScreenSizeIndicatorProps> = ({ 
  screenSize, 
  className = '' 
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fade out animation 1 second before the component is removed
    const timer = setTimeout(() => {
      setIsFadingOut(true);
    }, 5000); // Start fade out at 5 seconds (component removed at 6 seconds)

    return () => clearTimeout(timer);
  }, []);
  if (!screenSize) return null;

  const getIndicator = () => {
    switch (screenSize) {
      case 'very-small':
        return {
          icon: <Smartphone size={20} />,
          message: "Screen too small",
          description: "Some features may not work properly",
          color: 'red'
        };
      case 'small':
        return {
          icon: <Smartphone size={20} />,
          message: "Limited space",
          description: "Advanced features simplified",
          color: 'orange'
        };
      case 'medium':
        return {
          icon: <Monitor size={20} />,
          message: "Compact view",
          description: "Full features available with larger screen",
          color: 'green'
        };
      default:
        return null;
    }
  };

  const indicator = getIndicator();
  if (!indicator) return null;

  return (
    <div className={`screen-size-indicator ${indicator.color} ${isFadingOut ? 'fade-out' : ''} ${className}`}>
      <div className="indicator-icon">
        {indicator.icon}
      </div>
      <div className="indicator-content">
        <div className="indicator-message">{indicator.message}</div>
        <div className="indicator-description">{indicator.description}</div>
      </div>
      <div className="indicator-visual">
        <div className="screen-representation">
          <div className="screen-outline">
            <div className="screen-content">
              <div className="content-bars">
                <div className="bar bar-1"></div>
                <div className="bar bar-2"></div>
                <div className="bar bar-3"></div>
              </div>
            </div>
          </div>
          {screenSize === 'very-small' && (
            <div className="cramped-indicator">
              <AlertTriangle size={12} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenSizeIndicator;
