import React from 'react';
import { FileText } from 'lucide-react';
import './ProgressIndicator.css';

export interface ProgressState {
  stage: 'reading' | 'validating' | 'processing' | 'complete' | 'error' | 'waiting-for-scale-confirmation';
  progress: number;
  fileName: string;
  fileSize: string;
  message?: string; // 🚀 Added for chunked processing progress messages
}

interface ProgressIndicatorProps {
  progress: ProgressState;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ progress }) => {
  const { stage, progress: progressValue, fileName, fileSize, message } = progress;
  
  const getStatusText = () => {
    switch (stage) {
      case 'reading': return 'Reading file...';
      case 'validating': return 'Validating data...';
      case 'processing': return 'Processing...';
      case 'complete': return 'Complete!';
      case 'error': return 'Error';
      default: return 'Processing...';
    }
  };
  
  const getProgressBarColor = () => {
    switch (stage) {
      case 'error': return '#EF4444'; // Red
      case 'complete': return '#10B981'; // Green
      default: return '#4F46E5'; // Indigo
    }
  };
  
  return (
    <div className="csv-progress-indicator">
      <div className="csv-progress-indicator__label">
        <span className="csv-progress-indicator__status">
          {getStatusText()}
        </span>
        <span className="csv-progress-indicator__percentage">
          {progressValue}%
        </span>
      </div>
      <div className="csv-progress-indicator__bar">
        <div 
          className="csv-progress-indicator__fill"
          style={{ 
            width: `${progressValue}%`,
            backgroundColor: getProgressBarColor()
          }}
        />
      </div>
      {/* 🚀 PERFORMANCE OPTIMIZATION: Show detailed progress message */}
      {message && (
        <div className="csv-progress-indicator__message">
          {message}
        </div>
      )}
      <div className="csv-progress-indicator__file-info">
        <FileText size={16} className="csv-progress-indicator__file-info-icon" />
        <div className="csv-progress-indicator__file-info-details">
          <span className="csv-progress-indicator__file-info-name">{fileName}</span>
          <span className="csv-progress-indicator__file-info-meta">{fileSize}</span>
        </div>
      </div>
    </div>
  );
};