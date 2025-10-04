import React from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import './DuplicateReport.css';

export interface DuplicateReportData {
  count: number;
  items: Array<{ id: string; name: string; reason: string }>;
}

interface DuplicateReportProps {
  report: DuplicateReportData;
  onDownload: () => void;
}

export const DuplicateReport: React.FC<DuplicateReportProps> = ({ report, onDownload }) => {
  return (
    <div className="csv-duplicate-report">
      <div className="csv-duplicate-report__header">
        <AlertTriangle size={16} className="csv-duplicate-report__icon" />
        <span>Potential duplicates found: {report.count}</span>
      </div>
      <button 
        className="csv-duplicate-report__download"
        onClick={onDownload}
      >
        <Download size={14} />
        Download Duplicate Report
      </button>
    </div>
  );
};