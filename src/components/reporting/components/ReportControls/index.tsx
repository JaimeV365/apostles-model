import React from 'react';

interface ReportControlsProps {
  onGenerate: () => void;
  isGenerating: boolean;
  hasPremiumAccess: boolean;
}

export const ReportControls: React.FC<ReportControlsProps> = ({
  onGenerate,
  isGenerating,
  hasPremiumAccess
}) => {
  return (
    <div className="report-controls">
      <button 
        onClick={onGenerate}
        disabled={isGenerating}
        className="primary-button"
      >
        {isGenerating ? 'Generating...' : 'Generate Reports'}
      </button>
      {hasPremiumAccess && (
        <button className="secondary-button">
          Premium Options
        </button>
      )}
    </div>
  );
};