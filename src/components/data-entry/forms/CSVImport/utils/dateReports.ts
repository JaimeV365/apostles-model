// src/components/data-entry/forms/CSVImport/utils/dateReports.ts

import { DateIssueReport } from '../types';

export const generateDateIssuesCSV = (report: DateIssueReport, reportType: 'issues' | 'warnings'): void => {
  const header = 'Row,ID,Reason,Value\n';
  const rows = report.items.map(item => 
    `${item.row},"${item.id}","${item.reason}","${item.value}"`
  ).join('\n');
  
  const content = header + rows;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Create appropriate filename based on report type with segmentor prefix
    const filename = reportType === 'issues' 
      ? 'segmentor_invalid_dates_report.csv' 
      : 'segmentor_unusual_dates_report.csv';
      
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error generating ${reportType} CSV:`, error);
  }
};