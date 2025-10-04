import { ScaleFormat } from '@/types/base';
import { ValidationErrorData } from '../types';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateFile = (file: File): { isValid: boolean; error: ValidationErrorData | null } => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
    
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: {
        title: 'File too large',
        message: `File size (${formatFileSize(file.size)}) exceeds maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`,
        fix: 'Please reduce your file size or split it into smaller files'
      }
    };
  }

  if (file.type && !['text/csv', 'application/vnd.ms-excel'].includes(file.type)) {
    return {
      isValid: false,
      error: {
        title: 'Invalid file type',
        message: 'Only CSV files are supported',
        details: `Received file of type: ${file.type}`,
        fix: 'Please save your file as a CSV and try again'
      }
    };
  }

  return { isValid: true, error: null };
};

export const generateTemplateCSV = (satisfactionScale: ScaleFormat, loyaltyScale: ScaleFormat): void => {
  try {
    // Parse scale values
    const [, satMax] = satisfactionScale.split('-');
const [, loyMax] = loyaltyScale.split('-');
    
    // Create template with required and optional columns - using : instead of -
    const headerRow = `ID,Name,Email,Satisfaction:${satisfactionScale},Loyalty:${loyaltyScale},Date,Country,TrueLoyalist,NumPurchases,NumComplaints`;
    const exampleRow = `ABC123,John Smith,john@example.com,${satMax},${loyMax},01/01/2024,France,Yes,5,0`;
    const notesRow = `optional,optional,optional,REQUIRED,REQUIRED,optional,optional,optional,optional,optional`;
    
    console.log('Generated template CSV with headers:', headerRow);
    
    const template = `${headerRow}\n${exampleRow}\n${notesRow}`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'segmentor_data_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating template CSV:', error);
  }
};