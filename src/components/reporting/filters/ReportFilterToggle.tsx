// src/components/reporting/filters/ReportFilterToggle.tsx
import React from 'react';
import { Filter } from 'lucide-react';
import './ReportFilterToggle.css';

interface ReportFilterToggleProps {
  onClick: () => void;
  isActive: boolean;
  filterCount: number;
}

export const ReportFilterToggle: React.FC<ReportFilterToggleProps> = ({
  onClick,
  isActive,
  filterCount
}) => {
  return (
    <button 
      className={`report-filter-toggle ${isActive ? 'active' : ''} ${filterCount > 0 ? 'has-filters' : ''}`}
      onClick={onClick}
      title="Filter data"
      aria-label="Toggle filter panel"
    >
      <Filter size={20} />
      {filterCount > 0 && (
        <span className="filter-count">{filterCount}</span>
      )}
    </button>
  );
};