import React from 'react';
import { ScaleFormat } from '@/types/base';
import { ScaleDetectionResult } from '../utils/headerProcessing';
import './ScaleConfirmationModal.css';

interface ScaleConfirmationModalProps {
  isOpen: boolean;
  onConfirm: (confirmedScales: { satisfaction?: ScaleFormat; loyalty?: ScaleFormat }) => void;
  onCancel: () => void;
  scaleDetection: {
    satisfaction?: ScaleDetectionResult;
    loyalty?: ScaleDetectionResult;
  };
  basicScales: {
    satisfaction: ScaleFormat;
    loyalty: ScaleFormat;
  };
}

export const ScaleConfirmationModal: React.FC<ScaleConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  scaleDetection,
  basicScales
}) => {
  const [selectedScales, setSelectedScales] = React.useState<{
    satisfaction?: ScaleFormat;
    loyalty?: ScaleFormat;
  }>({});

  React.useEffect(() => {
    if (isOpen) {
      // Reset selections when modal opens
      setSelectedScales({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      satisfaction: selectedScales.satisfaction || basicScales.satisfaction,
      loyalty: selectedScales.loyalty || basicScales.loyalty
    });
  };

  const hasLoyaltyChoice = scaleDetection.loyalty?.needsUserInput;
  const hasSatisfactionChoice = scaleDetection.satisfaction?.needsUserInput;
  
  // Check if user has made required selections
  const hasRequiredSelections = 
    (!hasLoyaltyChoice || selectedScales.loyalty) && 
    (!hasSatisfactionChoice || selectedScales.satisfaction);

  return (
    <div className="scale-confirmation-overlay">
      <div className="scale-confirmation-modal">
        <div className="scale-confirmation-header">
          <h3>Confirm Scale Settings</h3>
          <button className="scale-confirmation-close" onClick={onCancel}>&times;</button>
        </div>

        <div className="scale-confirmation-content">
          <p className="scale-confirmation-explanation">
            We detected a scale that could be interpreted in different ways. Please choose which scale format you want to use:
          </p>

          {hasSatisfactionChoice && (
            <div className="scale-choice-section">
              <h4>Satisfaction Scale</h4>
              <p>Data range: {scaleDetection.satisfaction!.dataRange.min} - {scaleDetection.satisfaction!.dataRange.max}</p>
              
              <div className="scale-choice-buttons">
                {scaleDetection.satisfaction!.possibleScales.map(scale => (
                  <div 
                    key={scale}
                    className={`scale-choice-button ${selectedScales.satisfaction === scale ? 'scale-choice-button--selected' : ''}`}
                    onClick={() => setSelectedScales(prev => ({
                      ...prev,
                      satisfaction: scale
                    }))}
                  >
                    <div className="scale-choice-button-icon">
                      {scale.startsWith('0-') ? '0—·—·—10' : '1—·—·—10'}
                    </div>
                    <div className="scale-choice-button-title">
                      {scale} Scale
                    </div>
                    <div className="scale-choice-button-description">
                      {scale.startsWith('0-') ? 'Starts from 0 (lowest)' : 'Starts from 1 (lowest)'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasLoyaltyChoice && (
            <div className="scale-choice-section">
              <h4>Loyalty Scale</h4>
              <p>Data range: {scaleDetection.loyalty!.dataRange.min} - {scaleDetection.loyalty!.dataRange.max}</p>
              
              <div className="scale-choice-buttons">
                {scaleDetection.loyalty!.possibleScales.map(scale => (
                  <div 
                    key={scale}
                    className={`scale-choice-button ${selectedScales.loyalty === scale ? 'scale-choice-button--selected' : ''}`}
                    onClick={() => setSelectedScales(prev => ({
                      ...prev,
                      loyalty: scale
                    }))}
                  >
                    <div className="scale-choice-button-icon">
                      {scale.startsWith('0-') ? '0—·—·—10' : '1—·—·—10'}
                    </div>
                    <div className="scale-choice-button-title">
                      {scale} Scale
                    </div>
                    <div className="scale-choice-button-description">
                      {scale.startsWith('0-') ? 'Starts from 0 (lowest)' : 'Starts from 1 (lowest)'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="scale-confirmation-actions">
          <button
            type="button"
            className="scale-confirmation-button scale-confirmation-button--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="scale-confirmation-button scale-confirmation-button--confirm"
            disabled={!hasRequiredSelections}
            onClick={handleConfirm}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};