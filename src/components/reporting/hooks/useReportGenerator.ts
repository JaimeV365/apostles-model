import { useState, useCallback, useEffect } from 'react';
import type { DataPoint, ScaleFormat } from '../../../types/base';
import type { DataReport, ActionsReport } from '../types';
import { generateDataReport } from '../utils/dataReportGenerator';
import { generateActionsReport } from '../utils/actionsReportGenerator';
import { formatDataReportForExport, formatActionsReportForExport, downloadAsFile } from '../utils/exportHelpers';

interface UseReportGeneratorProps {
  data: DataPoint[];
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  activeEffects: Set<string>;
}

export const useReportGenerator = ({
  data,
  satisfactionScale,
  loyaltyScale,
  activeEffects
}: UseReportGeneratorProps) => {
  const [dataReport, setDataReport] = useState<DataReport | null>(null);
  const [actionsReport, setActionsReport] = useState<ActionsReport | null>(null);
  const [isOutOfSync, setIsOutOfSync] = useState(false);
  const [lastGeneratedHash, setLastGeneratedHash] = useState<string>('');

  const getCurrentStateHash = useCallback(() => {
    return JSON.stringify({
      dataLength: data.length,
      excluded: data.filter(d => d.excluded).length,
      scales: `${satisfactionScale}-${loyaltyScale}`,
      effects: Array.from(activeEffects).sort().join(',')
    });
  }, [data, satisfactionScale, loyaltyScale, activeEffects]);

  const handleGenerateReports = useCallback(async () => {
  try {
    console.log('🔄 useReportGenerator: About to generate reports');
    console.log('🔄 Data length:', data.length);
    console.log('🔄 First 3 data points:', data.slice(0, 3));
    console.log('🔄 Current state hash:', getCurrentStateHash());
    
    const dataReportContent = await generateDataReport(data, satisfactionScale, loyaltyScale);
      const actionsReportContent = await generateActionsReport(data, activeEffects);
      
      setDataReport(dataReportContent);
      setActionsReport(actionsReportContent);
      setLastGeneratedHash(getCurrentStateHash());
      setIsOutOfSync(false);
    } catch (error) {
      console.error('Error generating reports:', error);
    }
  }, [data, satisfactionScale, loyaltyScale, activeEffects, getCurrentStateHash]);

  // Auto-regenerate reports when data changes
useEffect(() => {
  if (data.length > 0) {
    handleGenerateReports();
  }
}, [data, satisfactionScale, loyaltyScale, activeEffects, handleGenerateReports]);

  // Check for out of sync state
  useEffect(() => {
    const currentHash = getCurrentStateHash();
    setIsOutOfSync(currentHash !== lastGeneratedHash);
  }, [getCurrentStateHash, lastGeneratedHash]);

  const handleCustomizeReport = useCallback((reportType: 'data' | 'actions') => {
    console.log('Customizing report:', reportType);
  }, []);

  const handleExportReport = useCallback((reportType: 'data' | 'actions') => {
    if (reportType === 'data' && dataReport) {
      const content = formatDataReportForExport(dataReport);
      downloadAsFile(content, `data-report-${new Date().toISOString().split('T')[0]}`);
    } else if (reportType === 'actions' && actionsReport) {
      const content = formatActionsReportForExport(actionsReport);
      downloadAsFile(content, `actions-report-${new Date().toISOString().split('T')[0]}`);
    }
  }, [dataReport, actionsReport]);

  const handleShareReport = useCallback((reportType: 'data' | 'actions') => {
    console.log('Sharing report:', reportType);
  }, []);

  return {
    dataReport,
    actionsReport,
    isOutOfSync,
    setIsOutOfSync,
    handleGenerateReports,
    handleCustomizeReport,
    handleExportReport,
    handleShareReport
  };
};