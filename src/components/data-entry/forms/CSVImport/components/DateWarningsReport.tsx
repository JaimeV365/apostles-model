// src/components/data-entry/forms/CSVImport/components/DateWarningsReport.tsx

import React from 'react';
import { AlertCircle, Download } from 'lucide-react';
import { DateIssueReport } from '../types';

interface DateWarningsReportProps {
  report: DateIssueReport;
  onDownload: () => void;
}

export const DateWarningsReport: React.FC<DateWarningsReportProps> = ({ 
  report, 
  onDownload 
}) => {
  if (!report || report.count === 0) return null;
  
  return (
    <div className="csv-import__date-warnings">
      <div className="csv-import__date-warnings-header">
        <AlertCircle size={16} className="csv-import__date-warnings-icon" />
        <span>Unusual Dates Found: {report.count} {report.count === 1 ? 'entry' : 'entries'}</span>
      </div>
      <p className="csv-import__date-warnings-message">
        {report.count === 1 
          ? 'One entry contains an unusual date (e.g., very far in the future or past). ' 
          : `${report.count} entries contain unusual dates (e.g., very far in the future or past). `} 
        These entries were imported, but you may want to review them.
      </p>
      <button 
        className="csv-import__download-report"
        onClick={onDownload}
      >
        <Download size={14} />
        Download Report
      </button>
    </div>
  );
};