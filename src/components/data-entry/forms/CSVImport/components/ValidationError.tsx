import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './ValidationError.css';

export interface ValidationErrorData {
  title: string;
  message: string;
  details?: string;
  fix?: string;
}

interface ValidationErrorProps {
  error: ValidationErrorData;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({ error }) => {
  return (
    <div className="csv-validation-error">
      <div className="csv-validation-error__title">
        <AlertTriangle size={16} />
        {error.title}
      </div>
      <p className="csv-validation-error__message">{error.message}</p>
      {error.details && (
        <div className="csv-validation-error__details">{error.details}</div>
      )}
      {error.fix && (
        <div className="csv-validation-error__fix">
          <strong>How to fix:</strong> {error.fix}
        </div>
      )}
    </div>
  );
};