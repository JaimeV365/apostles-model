import React from 'react';
import type { ActionsReport as ActionsReportType } from '../../types';

interface ActionsReportProps {
  report: ActionsReportType | null;
  onCustomize: (reportType: 'actions') => void;
  onExport: (reportType: 'actions') => void;
  onShare: (reportType: 'actions') => void;
}

export const ActionsReport: React.FC<ActionsReportProps> = ({
  report,
  onCustomize,
  onExport,
  onShare
}) => {
  if (!report) return null;

  return (
    <div className="report-card">
      <h3>Actions Report</h3>
      <div className="report-content">
        {/* Report content rendering */}
      </div>
      <div className="report-actions">
        <button onClick={() => onCustomize('actions')}>Customize</button>
        <button onClick={() => onExport('actions')}>Export</button>
        <button onClick={() => onShare('actions')}>Share</button>
      </div>
    </div>
  );
};