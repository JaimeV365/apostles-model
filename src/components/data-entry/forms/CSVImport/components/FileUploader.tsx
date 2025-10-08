import React, { useRef, useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';
import './FileUploader.css';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onTemplateDownload: () => void;
  processing: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  onTemplateDownload,
  processing
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    if (processing) return;
    
    const file = event.dataTransfer.files[0];
    if (file && (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel')) {
      onFileSelect(file);
    } else if (file && file.name.toLowerCase().endsWith('.seg')) {
      // Show error for .seg files in CSV tab
      alert('Please use the "Load Project" tab to load .seg files.');
      return;
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || processing) return;
    
    if (file.name.toLowerCase().endsWith('.seg')) {
      // Show error for .seg files in CSV tab
      alert('Please use the "Load Project" tab to load .seg files.');
      return;
    }
    
    onFileSelect(file);
  };

  return (
    <div className="csv-file-uploader">
      <div className="csv-file-uploader__header">
        <div>
          <div className="csv-file-uploader__title">Import Data</div>
          <div className="csv-file-uploader__description">
            Upload a CSV file with, at least, Satisfaction and Loyalty data. You can also add dates, emails, names, countries, languages... Anything you'd like!
          </div>
          <div className="csv-file-uploader__note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>Supported Satisfaction scales: <b>1-3, 1-5, 1-7</b>. Supported Loyalty scales: <b>1-5, 1-7, 1-10, 0-10</b>.</span>
          </div>
        </div>
        <span
          onClick={onTemplateDownload}
          className="csv-file-uploader__template-button"
          role="button"
          tabIndex={0}
        >
          <FileText size={16} />
          Download template
        </span>
      </div>

      <div
        className={`csv-file-uploader__dropzone ${isDragging ? 'csv-file-uploader__dropzone--dragging' : 'csv-file-uploader__dropzone--normal'} ${processing ? 'csv-file-uploader__dropzone--disabled' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!processing) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !processing && fileInputRef.current?.click()}
      >
        <div className="csv-file-uploader__dropzone-icon">
          <UploadCloud size={24} stroke="#3a863e" />
        </div>
        <div className="csv-file-uploader__dropzone-text">
          {processing 
            ? 'Processing file...' 
            : 'Drop your CSV file here or click to browse'}
        </div>
        <div className="csv-file-uploader__dropzone-subtext">
          Supports CSV files up to 10MB
        </div>
      </div>

      <input 
        ref={fileInputRef}
        type="file" 
        accept=".csv" 
        onChange={handleFileChange} 
        className="csv-file-uploader__file-input"
        disabled={processing}
      />
    </div>
  );
};