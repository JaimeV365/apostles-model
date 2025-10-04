import React, { useState, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import { DataPoint, ScaleFormat } from '@/types/base';
import { useNotification } from '../../NotificationSystem';
import { FileUploader } from './components/FileUploader';
import { ProgressIndicator } from './components/ProgressIndicator';

import { UploadHistory, UploadHistoryItem } from './components/UploadHistory';
import { ImportModeModal, ImportMode } from './components/ImportModeModal';
import { ScaleConfirmationModal } from './components/ScaleConfirmationModal';
import { applyConfirmedScales, isMetadataRow } from './utils/headerProcessing';
import ReportArea from './components/ReportArea';
import { 
  generateDuplicateCSV, 
  generateTemplateCSV,
  generateDateIssuesCSV,
  validateDataRows,
  detectDuplicates
} from './utils';
import { useCSVParser, useCSVValidation } from './hooks';
import { HeaderScales } from './types';
import './styles/index.css';

interface CSVImportProps {
  onImport: (
    data: Array<{ 
      id: string; 
      name: string; 
      satisfaction: number; 
      loyalty: number;
      date?: string;
      email?: string;
      [key: string]: any;
    }>, 
    headerScales: HeaderScales,
    overwrite?: boolean
  ) => string[];
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  existingIds: string[];
  existingData: DataPoint[]; 
  scalesLocked: boolean;
  uploadHistory: UploadHistoryItem[];
  onUploadSuccess: (fileName: string, count: number, ids: string[], wasOverwrite?: boolean) => void;
  lastManualEntryTimestamp?: number; // New prop to track manual entries
}

export const CSVImport: React.FC<CSVImportProps> = ({ 
  onImport, 
  satisfactionScale, 
  loyaltyScale, 
  existingIds,
  existingData,
  scalesLocked,
  uploadHistory,
  onUploadSuccess,
  lastManualEntryTimestamp = 0
}) => {
  const { showNotification } = useNotification();
  const [showImportModeModal, setShowImportModeModal] = useState(false);
  const [pendingFileData, setPendingFileData] = useState<{
    file: File, 
    headerScales: HeaderScales,
    validatedData?: any[],
    headerResult?: any
  } | null>(null);
  const [showScaleConfirmationModal, setShowScaleConfirmationModal] = useState(false);
  
  const {
    error,
    setError,
    duplicateReport,
    setDuplicateReport,
    dateIssuesReport,
    setDateIssuesReport,
    dateWarningsReport,
    setDateWarningsReport,
    clearValidationState
  } = useCSVValidation();

  // Add this new effect to listen for clear warnings event
  useEffect(() => {
    const handleClearWarnings = () => {
      clearValidationState();
    };

    document.addEventListener('clear-csv-warnings', handleClearWarnings);
    return () => {
      document.removeEventListener('clear-csv-warnings', handleClearWarnings);
    };
  }, [clearValidationState]);

  // Clear pending data when component unmounts
  useEffect(() => {
    return () => {
      setPendingFileData(null);
    };
  }, []);
  
  // Clear validation state when a manual entry is made
  useEffect(() => {
    if (lastManualEntryTimestamp > 0) {
      clearValidationState();
    }
  }, [lastManualEntryTimestamp, clearValidationState]);

  // Handle scale confirmation modal display
  useEffect(() => {
    if (pendingFileData?.headerResult?.needsUserConfirmation) {
      setShowScaleConfirmationModal(true);
    }
  }, [pendingFileData]);

  const showImportModeDialog = useCallback(() => {
    console.log("Opening import mode dialog");
    setShowImportModeModal(true);
  }, []);

  // This function processes a valid CSV file that passed initial validations
  const processParsedData = useCallback((
    validatedData: any[], 
    headerScales: HeaderScales, 
    fileName: string,
    forceOverwrite: boolean = false
  ) => {
    console.log("processParsedData called:", {
      dataLength: validatedData.length,
      headerScales,
      fileName,
      forceOverwrite
    });
    
    // Check for internal duplicates within the file (needed in both modes)
    const internalDuplicates = validatedData
      .map(item => item.id)
      .filter((id, index, array) => array.indexOf(id) !== index);
    
    console.log("Internal duplicates check:", internalDuplicates);
    
    if (internalDuplicates.length > 0) {
      console.log("Found internal duplicates, showing error");
      // Create a unique list without using spread on a Set
      const uniqueDuplicateIds = Array.from(new Set(internalDuplicates));
      
      setError({
        title: 'Duplicate IDs Found',
        message: 'Your CSV contains entries with duplicate IDs.',
        details: 'Duplicate IDs: ' + uniqueDuplicateIds.join(', '),
        fix: 'Please ensure all IDs in your CSV are unique'
      });
      setProgress(null); // Clear progress to unblock the upload area
      return false;
    }
    
    // Validation based on mode
    if (!forceOverwrite) {
      // Append mode - check for conflicts with existing data
      console.log("Append mode - checking conflicts with existing data");
      
      // Find IDs that exist in both datasets
      const conflictingIds = validatedData
        .map(item => item.id)
        .filter(id => existingIds.includes(id));
      
      console.log("Conflicting IDs:", conflictingIds);
      
      if (conflictingIds.length > 0) {
        console.log("Found conflicts with existing data");
        // Create unique list of conflicting IDs
        const uniqueConflictIds = Array.from(new Set(conflictingIds));
        
        if (uniqueConflictIds.length > 0) {
          setError({
            title: 'Duplicate entries detected',
            message: `${uniqueConflictIds.length} entries in your CSV already exist in the system.`,
            details: 'Duplicate IDs: ' + uniqueConflictIds.join(', '),
            fix: 'Please use unique IDs or choose to replace all data instead.'
          });
          setProgress(null); // Clear progress to unblock the upload area
          return false;
        }
      }
      
      // Validate scales if existing data is present (only in append mode)
      if (scalesLocked) {
        console.log("Scales locked, checking compatibility");
        if (headerScales.satisfaction !== satisfactionScale) {
          console.log("Satisfaction scale mismatch");
          setError({
            title: 'Scale mismatch',
            message: `CSV uses different Satisfaction scale (${headerScales.satisfaction}) than current (${satisfactionScale})`,
            fix: 'Please adjust your CSV file scales to match the current settings or use replace mode'
          });
          setProgress(null);
          return false;
        }

        if (headerScales.loyalty !== loyaltyScale) {
          console.log("Loyalty scale mismatch");
          setError({
            title: 'Scale mismatch',
            message: `CSV uses different Loyalty scale (${headerScales.loyalty}) than current (${loyaltyScale})`,
            fix: 'Please adjust your CSV file scales to match the current settings or use replace mode'
          });
          setProgress(null);
          return false;
        }
      }
    } else {
      console.log("Overwrite mode - bypassing all existing data validations");
    }
    
    try {
      console.log("All checks passed, calling onImport");
      // Process the import
      const importedIds = onImport(validatedData, headerScales, forceOverwrite);
      console.log("Import successful, got IDs:", importedIds.length);
      
      onUploadSuccess(fileName, validatedData.length, importedIds, forceOverwrite);
      
      showNotification({
        title: 'Success',
        message: `Successfully ${forceOverwrite ? 'replaced all data' : 'imported'} ${validatedData.length} entries from ${fileName}`,
        type: 'success'
      });
      
      console.log("Clearing progress state");
      setProgress(null); // Clear progress state to unblock the upload area
      
      // Instead of clearing all validation states, only clear errors
      // This preserves warnings like duplicates
      setError(null); 
      return true;
    } catch (err) {
      console.error('Import Error:', err);
      setError({
        title: 'Import Error',
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        fix: 'Please try again or contact support'
      });
      setProgress(null); // Clear progress state even on error
      return false;
    }
  }, [onImport, onUploadSuccess, satisfactionScale, loyaltyScale, scalesLocked, setError, showNotification, existingIds, clearValidationState]);

  const handleCompleteImport = useCallback((
    validatedData: any[], 
    headerScales: HeaderScales, 
    fileName: string,
    hasDateIssues: boolean = false,
    hasDateWarnings: boolean = false
  ) => {
    console.log("handleCompleteImport called:", {
      dataLength: validatedData.length,
      headerScales,
      fileName,
      hasDateIssues,
      hasDateWarnings
    });
    
    // Always check for all types of duplicates and set reports
    console.log("Checking for duplicates");
    const duplicateInfo = detectDuplicates(validatedData, existingData);
    console.log("Duplicate info:", duplicateInfo);
    
    if (duplicateInfo.count > 0) {
      console.log("Setting duplicate report with count:", duplicateInfo.count);
      setDuplicateReport(duplicateInfo);
    }
    
    // Only show Add/Replace if there's existing data - regardless of duplicate status
    if (existingIds.length > 0) {
      console.log("Existing data found, showing import mode dialog");
      // Store data to be used after mode selection
      setPendingFileData({ 
        file: new File([], fileName), // Placeholder file since we already have the data
        headerScales,
        validatedData
      });
      showImportModeDialog();
      return false;
    }
    
    // If no existing data, proceed with import as "add"
    console.log("No existing data, proceeding with import");
    return processParsedData(validatedData, headerScales, fileName, false);
  }, [existingIds, existingData, setDuplicateReport, processParsedData, showImportModeDialog]);

  const {
    progress,
    parseFile,
    dateIssuesReport: parserDateIssues,
    dateWarningsReport: parserDateWarnings,
    setProgress
  } = useCSVParser({
    onComplete: handleCompleteImport,
    onDuplicatesFound: setDuplicateReport,
    onError: setError,
    satisfactionScale,
    loyaltyScale,
    scalesLocked,
    existingIds,
    setPendingFileData,
    showImportModeDialog
  });

  // FIXED: Updated handleScaleConfirmation to prevent infinite loop
  const handleScaleConfirmation = useCallback((confirmedScales: { satisfaction?: ScaleFormat; loyalty?: ScaleFormat }) => {
    console.log("Scale confirmation received:", confirmedScales);
    
    if (!pendingFileData?.headerResult) {
      console.error("No pending file data with header result");
      return;
    }
    
    // Apply confirmed scales to the header result
    const finalHeaderScales = applyConfirmedScales(pendingFileData.headerResult, confirmedScales);
    console.log("Final header scales:", finalHeaderScales);
    
    // Close the modal immediately
    setShowScaleConfirmationModal(false);
    
    // If we have validated data already, use it directly
    if (pendingFileData.validatedData) {
      console.log("Using existing validated data");
      const validatedData = pendingFileData.validatedData;
      const fileName = pendingFileData.file.name || 'data.csv';
      
      // Clear pending data first to prevent re-triggering
      setPendingFileData(null);
      
      // Complete the import with confirmed scales
      const success = processParsedData(validatedData, finalHeaderScales.scales, fileName, false);
      if (success) {
        setProgress(null);
      }
      return;
    }
    
    // If we don't have validated data, we need to continue processing from where we left off
    console.log("Continuing with scale-confirmed processing");
    
    // Read the file data again but with confirmed scales
    const file = pendingFileData.file;
    
    // Clear pending data to prevent re-triggering
    setPendingFileData(null);
    
    // Parse the file content directly without going through the full parseFile cycle
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          console.log("Re-parsing with confirmed scales complete");
          
          // Filter out metadata rows
          const cleanedData = results.data.filter(row => !isMetadataRow(row));
          
          // Get headers for validation
          const headers = Object.keys(results.data[0] || {});
          const headerResult = pendingFileData.headerResult;
          
          if (!headerResult?.satisfactionHeader || !headerResult?.loyaltyHeader) {
            console.error("Missing header information");
            setError({
              title: 'Processing Error',
              message: 'Missing header information for validation',
              fix: 'Please try uploading the file again'
            });
            setProgress(null);
            return;
          }
          
          // Validate data with confirmed scales
          console.log("Validating data with confirmed scales:", finalHeaderScales.scales);
          const validationResult = validateDataRows(
            cleanedData,
            headerResult.satisfactionHeader,
            headerResult.loyaltyHeader,
            finalHeaderScales.scales.satisfaction,
            finalHeaderScales.scales.loyalty
          );
          
          const validatedData = validationResult.data;
          console.log("Scale-confirmed validation complete, rows:", validatedData.length);
          
          // Set reports for UI display
          if (validationResult.rejectedReport.count > 0) {
            setDateIssuesReport(validationResult.rejectedReport);
          }
          
          if (validationResult.warningReport.count > 0) {
            setDateWarningsReport(validationResult.warningReport);
          }
          
          // Complete the import process
          const success = handleCompleteImport(
            validatedData,
            finalHeaderScales.scales,
            file.name,
            validationResult.rejectedReport.count > 0,
            validationResult.warningReport.count > 0
          );
          
          if (success) {
            setProgress(null);
          }
          
        } catch (err) {
          console.error('Scale confirmation processing error:', err);
          setError({
            title: 'Processing Error',
            message: err instanceof Error ? err.message : 'Unknown error occurred',
            fix: 'Please try uploading the file again'
          });
          setProgress(null);
        }
      },
      error: (error: Error) => {
        console.error('Scale confirmation re-parsing error:', error);
        setError({
          title: 'File Processing Error',
          message: 'Could not process the file with confirmed scales',
          details: error.message,
          fix: 'Please try uploading the file again'
        });
        setProgress(null);
      }
    });
  }, [pendingFileData, handleCompleteImport, processParsedData, setDateIssuesReport, setDateWarningsReport, setError]);

  const handleScaleConfirmationCancel = useCallback(() => {
    console.log("Scale confirmation cancelled");
    setShowScaleConfirmationModal(false);
    setPendingFileData(null);
    setProgress(null);
  }, []);

  // Sync dates issues and warnings from the parser
  useEffect(() => {
    if (parserDateIssues) {
      setDateIssuesReport(parserDateIssues);
    }
    if (parserDateWarnings) {
      setDateWarningsReport(parserDateWarnings);
    }
  }, [parserDateIssues, parserDateWarnings, setDateIssuesReport, setDateWarningsReport]);

  // Clear date warnings when lastManualEntryTimestamp changes (indicating an edit)
  useEffect(() => {
    if (lastManualEntryTimestamp > 0) {
      // Instead of directly using the hooks' setters which expect non-null values
      clearValidationState(); // Use the clearValidationState function which properly resets all states
    }
  }, [lastManualEntryTimestamp, clearValidationState]);

  const handleFileSelect = useCallback((file: File) => {
    console.log("File selected:", file.name);
    clearValidationState();
    setPendingFileData(null); // Reset pending data for new file
    parseFile(file);
  }, [clearValidationState, parseFile]);

  const handleDownloadDuplicateReport = useCallback(() => {
    if (duplicateReport) {
      generateDuplicateCSV(duplicateReport);
    }
  }, [duplicateReport]);

  const handleDownloadDateErrorsReport = useCallback(() => {
    if (dateIssuesReport) {
      generateDateIssuesCSV(dateIssuesReport, 'issues');
    }
  }, [dateIssuesReport]);

  const handleDownloadDateWarningsReport = useCallback(() => {
    if (dateWarningsReport) {
      generateDateIssuesCSV(dateWarningsReport, 'warnings');
    }
  }, [dateWarningsReport]);

  const handleImportModeSelect = (mode: ImportMode) => {
    console.log("Import mode selected:", mode);
    setShowImportModeModal(false);
    
    if (!pendingFileData) {
      console.log("No pending file data, clearing progress");
      setProgress(null); // Clear progress to unblock the upload area
      return;
    }
    
    const overwrite = mode === 'overwrite';
    console.log("Mode selected:", overwrite ? "overwrite" : "append");
    
    // If we already have validated data, use it directly
    if (pendingFileData.validatedData) {
      // For overwrite mode, skip the external validation checks
      if (overwrite) {
        console.log("Using validated data, overwrite mode - bypassing external validations");
        processParsedData(
          pendingFileData.validatedData, 
          pendingFileData.headerScales, 
          pendingFileData.file.name || 'data.csv',
          true
        );
        setPendingFileData(null);
        return;
      }
      
      // For append mode, do the validation checks
      console.log("Using validated data, append mode - performing validation checks");
      processParsedData(
        pendingFileData.validatedData, 
        pendingFileData.headerScales, 
        pendingFileData.file.name || 'data.csv',
        false
      );
      setPendingFileData(null);
      return;
    }
    
    console.log("No validated data, re-parsing file");
    // Otherwise, we need to re-parse the file
    clearValidationState();
    
    Papa.parse(pendingFileData.file, {
      complete: (results) => {
        try {
          console.log("Re-parsing complete, processing headers");
          const headers = Object.keys(results.data[0] || {});
          const headerResult = {
            satisfactionHeader: headers.find(h => h.toLowerCase().includes('satisfaction') || h.toLowerCase().includes('sat')) || '',
            loyaltyHeader: headers.find(h => h.toLowerCase().includes('loyalty') || h.toLowerCase().includes('loy')) || '',
          };
          
          // Process data rows
          console.log("Validating data rows");
          const validationResult = validateDataRows(
            results.data, 
            headerResult.satisfactionHeader, 
            headerResult.loyaltyHeader,
            pendingFileData.headerScales.satisfaction,
            pendingFileData.headerScales.loyalty
          );
          
          const validatedData = validationResult.data;
          console.log("Validation complete, rows:", validatedData.length);
          
          // Check for warnings/issues
          if (validationResult.rejectedReport.count > 0) {
            console.log("Setting date issues report");
            setDateIssuesReport(validationResult.rejectedReport);
          }
          
          if (validationResult.warningReport.count > 0) {
            console.log("Setting date warnings report");
            setDateWarningsReport(validationResult.warningReport);
          }
          
          // Process data with the selected mode
          processParsedData(validatedData, pendingFileData.headerScales, pendingFileData.file.name, overwrite);
          setPendingFileData(null);
        } catch (err) {
          console.error('Re-parsing Error:', err);
          setError({
            title: 'Processing Error',
            message: err instanceof Error ? err.message : 'Unknown error occurred',
            fix: 'Please check your file format and try again'
          });
          setPendingFileData(null);
          setProgress(null); // Clear progress on error
        }
      },
      header: true,
      error: (error: Error) => {
        console.error('CSV Re-Parsing Error:', error);
        setError({
          title: 'Invalid CSV Format',
          message: 'Could not parse the CSV file',
          details: error.message,
          fix: 'Make sure your file is a properly formatted CSV'
        });
        setPendingFileData(null);
        setProgress(null); // Clear progress on error
      }
    });
  };

  const handleTemplateDownload = () => {
    generateTemplateCSV(satisfactionScale, loyaltyScale);
  };
  
  return (
    <div className="csv-import">
      <FileUploader 
        onFileSelect={handleFileSelect}
        onTemplateDownload={handleTemplateDownload}
        processing={!!progress || !!pendingFileData}
      />
      
      {progress && (
        <ProgressIndicator progress={progress} />
      )}

      <ReportArea 
        errorReports={dateIssuesReport}
        validationErrors={error}
        warningReports={{
          duplicates: duplicateReport,
          dateWarnings: dateWarningsReport
        }}
        onDownloadDuplicates={handleDownloadDuplicateReport}
        onDownloadDateErrors={handleDownloadDateErrorsReport}
        onDownloadDateWarnings={handleDownloadDateWarningsReport}
      />

      <UploadHistory history={uploadHistory} />

      <ImportModeModal 
        isOpen={showImportModeModal}
        onClose={() => {
          console.log("Import mode modal closed");
          setShowImportModeModal(false);
          setPendingFileData(null);
          setProgress(null); // Clear progress when modal is closed
        }}
        onSelectMode={handleImportModeSelect}
      />

      <ScaleConfirmationModal
        isOpen={showScaleConfirmationModal}
        onConfirm={handleScaleConfirmation}
        onCancel={handleScaleConfirmationCancel}
        scaleDetection={pendingFileData?.headerResult?.scaleDetection || {}}
        basicScales={pendingFileData?.headerScales || { satisfaction: '1-5', loyalty: '1-5' }}
      />
    </div>
  );
};

export type { UploadHistoryItem };