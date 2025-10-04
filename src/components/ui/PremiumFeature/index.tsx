import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';


interface PremiumFeatureProps {
  children: React.ReactNode;
  isPremium: boolean;
  onPreview?: () => void;
  description?: string;
  previewDuration?: number;
  feature?: string;
}

const PremiumFeature: React.FC<PremiumFeatureProps> = ({
  children,
  isPremium,
  onPreview,
  description = "Premium feature",
  previewDuration = 2,
  feature
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [isEnabled, setIsEnabled] = useState(isPremium);
  
  

  const handleClick = () => {
    if (!isEnabled && onPreview && !isPreview) {
      setIsPreview(true);
      onPreview();
      setTimeout(() => setIsPreview(false), previewDuration * 1000);
    }
  };

  return (
    <div 
      className={`relative ${!isEnabled && !isPreview ? 'opacity-50' : ''} 
        transition-opacity duration-200`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${description}${!isEnabled ? ' (Premium feature)' : ''}`}
    >
      {!isEnabled && !isPreview && (
        <div className="absolute -top-2 -right-2 z-10">
          <Lock 
            className="w-4 h-4 text-gray-500" 
            aria-hidden="true"
          />
        </div>
      )}
      <div className={`${!isEnabled && !isPreview ? 'cursor-pointer' : ''}`}>
        {children}
      </div>
      {!isEnabled && !isPreview && (
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-5 
          transition-colors duration-200 rounded flex items-center justify-center">
          <span className="sr-only">{description}</span>
          {feature && (
            <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm">
              Premium Feature
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PremiumFeature;