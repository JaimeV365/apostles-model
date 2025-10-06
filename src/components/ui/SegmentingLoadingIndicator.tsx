import React from 'react';
import './SegmentingLoadingIndicator.css';

interface SegmentingLoadingIndicatorProps {
  size?: 'small' | 'medium';
  className?: string;
}

export const SegmentingLoadingIndicator: React.FC<SegmentingLoadingIndicatorProps> = ({
  size = 'small',
  className = ''
}) => {
  return (
    <div className={`loading-indicator loading-indicator-${size} ${className}`}>
      <div className={`spinner spinner-${size}`}></div>
      <div className={`loading-text loading-text-${size}`}>
        seg<span className="highlight">m</span>enting<span className="loading-dots">
          <span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </span>
      </div>
    </div>
  );
};

export default SegmentingLoadingIndicator;
