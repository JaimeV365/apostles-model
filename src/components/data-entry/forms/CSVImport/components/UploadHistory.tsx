import React from 'react';
import { FileText } from 'lucide-react';
import './UploadHistory.css';

export interface UploadHistoryItem {
  fileName: string;
  timestamp: Date;
  count: number;
  remainingCount: number;
  associatedIds: string[];
}

interface UploadHistoryProps {
  history: UploadHistoryItem[];
}

export const UploadHistory: React.FC<UploadHistoryProps> = ({ history }) => {
  if (history.length === 0) return null;
  
  return (
    <div className="csv-upload-history">
      <div className="csv-upload-history__title">
        Upload History
      </div>
      <div className="csv-upload-history__list">
        {history.map((upload, index) => (
          <div key={index} className="csv-upload-history__item">
            <div className="csv-upload-history__item-info">
              <FileText size={16} />
              {upload.fileName}
            </div>
            <div>
              {upload.remainingCount === 0 ? (
                <span className="csv-upload-history__deleted">All entries deleted</span>
              ) : upload.remainingCount < upload.count ? (
                `${upload.remainingCount}/${upload.count} entries remaining • ${upload.timestamp.toLocaleTimeString()}`
              ) : (
                `${upload.count} entries • ${upload.timestamp.toLocaleTimeString()}`
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};