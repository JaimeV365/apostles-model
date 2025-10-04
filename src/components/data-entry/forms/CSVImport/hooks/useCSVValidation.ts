// src/components/data-entry/forms/CSVImport/hooks/useCSVValidation.ts

import { useState } from 'react';
import { ValidationErrorData, DuplicateReport, DateIssueReport } from '../types';

export const useCSVValidation = () => {
  const [error, setError] = useState<ValidationErrorData | null>(null);
  const [duplicateReport, setDuplicateReport] = useState<DuplicateReport | null>(null);
  const [dateIssuesReport, setDateIssuesReport] = useState<DateIssueReport | null>(null);
  const [dateWarningsReport, setDateWarningsReport] = useState<DateIssueReport | null>(null);
  
  const clearValidationState = () => {
    setError(null);
    setDuplicateReport(null);
    setDateIssuesReport(null);
    setDateWarningsReport(null);
  };

  // This ensures validation states are preserved for re-uploads
  const handleDuplicatesFound = (duplicates: DuplicateReport) => {
    setDuplicateReport(duplicates);
  };

  const handleDateIssues = (issues: DateIssueReport) => {
    setDateIssuesReport(issues);
  };

  const handleDateWarnings = (warnings: DateIssueReport) => {
    setDateWarningsReport(warnings);
  };

  return {
    error,
    setError,
    duplicateReport,
    setDuplicateReport: handleDuplicatesFound,
    dateIssuesReport,
    setDateIssuesReport: handleDateIssues,
    dateWarningsReport,
    setDateWarningsReport: handleDateWarnings,
    clearValidationState
  };
};