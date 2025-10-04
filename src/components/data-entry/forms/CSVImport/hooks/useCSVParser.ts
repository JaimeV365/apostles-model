import { useState, useCallback, startTransition } from 'react';
import Papa from 'papaparse';
import { 
  CSVRow, 
  HeaderScales, 
  ValidationErrorData, 
  ProgressState,
  DuplicateReport,
  DateIssueReport
} from '../types';
import { 
  validateFile, 
  validateDataRows, 
  formatFileSize
} from '../utils';

// Import from utils/headerProcessing directly to avoid conflicts
import { processHeaders, processHeadersWithDataAnalysis, isMetadataRow, EnhancedHeaderProcessingResult } from '../utils/headerProcessing';

interface UseCSVParserProps {
  onComplete: (
    data: any[], 
    headerScales: HeaderScales, 
    fileName: string,
    hasDateIssues: boolean,
    hasDateWarnings: boolean
  ) => boolean;
  onDuplicatesFound: (duplicates: DuplicateReport) => void;
  onError: (error: ValidationErrorData) => void;
  satisfactionScale: string;
  loyaltyScale: string;
  scalesLocked: boolean;
  existingIds: string[];
  setPendingFileData: (data: {file: File, headerScales: HeaderScales, validatedData?: any[], headerResult?: any} | null) => void;
  showImportModeDialog: () => void;
}

export const useCSVParser = ({
  onComplete,
  onDuplicatesFound,
  onError,
  satisfactionScale,
  loyaltyScale,
  scalesLocked,
  existingIds,
  setPendingFileData,
  showImportModeDialog
}: UseCSVParserProps) => {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [dateIssuesReport, setDateIssuesReport] = useState<DateIssueReport | null>(null);
  const [dateWarningsReport, setDateWarningsReport] = useState<DateIssueReport | null>(null);

  // 🚀 PERFORMANCE OPTIMIZATION: Chunked data processing
  const processChunkedData = useCallback(async (
    data: any[], 
    headerResult: any, 
    headerScales: HeaderScales, 
    fileName: string
  ) => {
    const CHUNK_SIZE = 100; // Process 100 rows at a time
    const totalChunks = Math.ceil(data.length / CHUNK_SIZE);
    
    console.log(`🚀 Starting chunked processing: ${data.length} rows in ${totalChunks} chunks of ${CHUNK_SIZE}`);
    
    // Initialize results
    let allValidatedData: any[] = [];
    let allRejectedRows: any[] = [];
    let allWarningRows: any[] = [];
    let allProcessedEmails = new Set<string>();
    let allEmailDuplicates: string[] = [];
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, data.length);
      const chunk = data.slice(start, end);
      
      console.log(`🚀 Processing chunk ${i + 1}/${totalChunks}: rows ${start}-${end}`);
      
      // Update progress
      const chunkProgress = 50 + Math.round((i / totalChunks) * 30); // 50-80% range
      setProgress(prev => prev ? { 
        ...prev, 
        progress: chunkProgress,
        message: `Processing rows ${start}-${end} of ${data.length}...`
      } : null);
      
      // Process chunk in a transition to keep UI responsive
      await new Promise<void>((resolve) => {
        startTransition(() => {
          try {
            const validationResult = validateDataRows(
              chunk, 
              headerResult.satisfactionHeader, 
              headerResult.loyaltyHeader,
              headerScales.satisfaction,
              headerScales.loyalty
            );
            
            // Merge results
            allValidatedData = [...allValidatedData, ...validationResult.data];
            allRejectedRows = [...allRejectedRows, ...validationResult.rejectedReport.items];
            allWarningRows = [...allWarningRows, ...validationResult.warningReport.items];
            
            // Merge email tracking (this is a simplified approach)
            // In a real implementation, you'd need to handle email duplicates across chunks
            validationResult.data.forEach((item: any) => {
              if (item.email) {
                if (allProcessedEmails.has(item.email)) {
                  allEmailDuplicates.push(item.email);
                } else {
                  allProcessedEmails.add(item.email);
                }
              }
            });
            
            resolve();
          } catch (error) {
            console.error('Error processing chunk:', error);
            resolve(); // Continue with next chunk
          }
        });
      });
      
      // Small delay to keep UI responsive (only if not the last chunk)
      if (i < totalChunks - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    console.log(`🚀 Chunked processing complete: ${allValidatedData.length} valid rows, ${allRejectedRows.length} rejected, ${allWarningRows.length} warnings`);
    
    // Return combined results in the same format as the original function
    return {
      data: allValidatedData,
      rejectedReport: {
        count: allRejectedRows.length,
        items: allRejectedRows
      },
      warningReport: {
        count: allWarningRows.length,
        items: allWarningRows
      }
    };
  }, []);

  const parseFile = useCallback(async (file: File) => {
    console.log("parseFile called for:", file.name);
    // Reset state
    setCurrentFileName(file.name);
    setDateIssuesReport(null);
    setDateWarningsReport(null);
    setPendingFileData(null);
    
    // Initialize progress
    setProgress({
      stage: 'reading',
      progress: 0,
      fileName: file.name,
      fileSize: formatFileSize(file.size)
    });

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid && validation.error) {
      console.log("File validation failed:", validation.error);
      onError(validation.error);
      setProgress(null);
      return;
    }

    // Parse CSV
    const parseConfig = { 
      complete: async (results: Papa.ParseResult<CSVRow>) => {
        try {
          console.log("Papa parsing complete, rows:", results.data.length);
          setProgress(prev => prev ? { ...prev, stage: 'validating', progress: 30 } : null);

          if (results.data.length < 2) {
            console.log("Not enough data rows");
            onError({
              title: 'Empty or invalid file',
              message: 'CSV file must contain at least one row of data',
              fix: 'Please check your file contains data rows below the header row'
            });
            setProgress(null);
            return;
          }

          setProgress(prev => prev ? { ...prev, progress: 50 } : null);
          
          // Filter out metadata rows from data (REQUIRED/OPTIONAL)
          const cleanedData = results.data.filter(row => !isMetadataRow(row));
          
         // Process headers with our enhanced utility
          const headers = Object.keys(results.data[0] || {});
          console.log("Processing headers:", headers);
          const headerResult = processHeadersWithDataAnalysis(headers, cleanedData);
          
          if (!headerResult.isValid) {
            console.log("Invalid headers:", headerResult.errors);
            onError({
              title: 'Invalid CSV structure',
              message: 'There are issues with the CSV headers',
              details: headerResult.errors.join('\n'),
              fix: 'Please ensure your CSV has properly formatted Satisfaction and Loyalty columns.'
            });
            setProgress(null);
            return;
          }

          if (!headerResult.satisfactionHeader || !headerResult.loyaltyHeader) {
            console.log("Missing required headers");
            onError({
              title: 'Missing required columns',
              message: 'CSV must contain both Satisfaction and Loyalty columns',
              fix: 'Please add the missing columns or download and use the template provided'
            });
            setProgress(null);
            return;
          }
          
          // Check if enhanced scale detection needs user confirmation
if (headerResult.needsUserConfirmation) {
  console.log("Scale confirmation needed, storing pending data");
  setPendingFileData({
    file,
    headerScales: headerResult.scales,
    validatedData: undefined,
    headerResult
  });
  setProgress(prev => prev ? { ...prev, stage: 'waiting-for-scale-confirmation', progress: 60 } : null);
  return;
}

// Use detected scales
const headerScales = headerResult.scales;
console.log("Detected scales:", headerScales);

          // 🚀 PERFORMANCE OPTIMIZATION: Process data rows with chunked processing
          try {
            console.log("Starting chunked data validation...");
            const validationResult = await processChunkedData(
              cleanedData, 
              headerResult, 
              headerScales, 
              file.name
            );
          
            const validatedData = validationResult.data;
            console.log("Validation complete, valid rows:", validatedData.length);
            
            // Set reports for UI display
            let hasDateIssues = false;
            let hasDateWarnings = false;
            
            if (validationResult.rejectedReport.count > 0) {
              console.log("Date issues found:", validationResult.rejectedReport.count);
              setDateIssuesReport(validationResult.rejectedReport);
              hasDateIssues = true;
            }
            
            if (validationResult.warningReport.count > 0) {
              console.log("Date warnings found:", validationResult.warningReport.count);
              setDateWarningsReport(validationResult.warningReport);
              hasDateWarnings = true;
            }

            setProgress(prev => prev ? { ...prev, progress: 90 } : null);
            
            // Pass the validated data to the parent component for further processing
            console.log("Calling onComplete");
            const result = onComplete(
              validatedData, 
              headerScales, 
              file.name,
              hasDateIssues,
              hasDateWarnings
            );
            console.log("onComplete result:", result);
            
            // If result is true, the import was successful
            if (result) {
              console.log("Import successful, setting complete state");
              setProgress(prev => prev ? { ...prev, stage: 'complete', progress: 100 } : null);
              setTimeout(() => setProgress(null), 2000);
            } else {
              // Import was not completed (e.g., waiting for user confirmation)
              console.log("Import incomplete, waiting for user action");
              setProgress(prev => prev ? { ...prev, stage: 'processing', progress: 95 } : null);
            }
          } catch (err) {
            console.error('Validation Error:', err);
            onError({
              title: 'Validation Error',
              message: err instanceof Error ? err.message : 'Unknown error occurred',
              fix: 'Please check your data and try again'
            });
            setProgress(null);
            return;
          }
          
        } catch (err) {
          console.error('CSV Processing Error:', err);
          onError({
            title: 'Processing Error',
            message: err instanceof Error ? err.message : 'Unknown error occurred',
            fix: 'Please check your file format and try again'
          });
          setProgress(prev => prev ? { ...prev, stage: 'error' } : null);
          setTimeout(() => setProgress(null), 1000);
        }
      },
      header: true,
      skipEmptyLines: true,
      error: (error: Error) => {
        console.error('CSV Parsing Error:', error);
        onError({
          title: 'Invalid CSV Format',
          message: 'Could not parse the CSV file',
          details: error.message,
          fix: 'Make sure your file is a properly formatted CSV'
        });
        setProgress(prev => prev ? { ...prev, stage: 'error' } : null);
        setTimeout(() => setProgress(null), 1000);
      }
    };
    
    // Apply parse config
    Papa.parse(file, parseConfig as Papa.ParseConfig);
  }, [
    onComplete, 
    onError,
    setPendingFileData
  ]);

  return {
    progress,
    currentFileName,
    parseFile,
    dateIssuesReport,
    dateWarningsReport,
    setProgress
  };
};