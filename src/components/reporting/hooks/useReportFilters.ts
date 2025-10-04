// src/components/reporting/hooks/useReportFilters.ts
import { useState, useCallback } from 'react';
import { DataPoint } from '@/types/base';
import { ReportFilter } from '../filters/ReportFilterPanel';

export const useReportFilters = () => {
  const [activeFilters, setActiveFilters] = useState<Record<string, ReportFilter[]>>({});

  const applyFilters = useCallback((widgetId: string, filters: ReportFilter[]) => {
    setActiveFilters(prev => ({
      ...prev,
      [widgetId]: filters
    }));
  }, []);

  const filterData = useCallback((data: DataPoint[], filters: ReportFilter[]): DataPoint[] => {
    if (!filters || filters.length === 0) return data;

    return data.filter(point => {
      // Check if all filters match
      return filters.every(filter => {
        // Skip excluded points
        if (point.excluded) return false;
        
        // Check if the field exists on this data point
        // Use type assertion to tell TypeScript that we're accessing a dynamic property
        const value = (point as Record<string, any>)[filter.field];
        if (value === undefined) return false;

        switch (filter.operator) {
          case 'equals':
            return String(value) === String(filter.value);
          case 'notEquals':
            return String(value) !== String(filter.value);
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'greaterThan':
            return Number(value) > Number(filter.value);
          case 'lessThan':
            return Number(value) < Number(filter.value);
          case 'between':
            if (typeof filter.value !== 'string') return false;
            const [min, max] = filter.value.split(',').map(v => Number(v.trim()));
            return Number(value) >= min && Number(value) <= max;
          default:
            return true;
        }
      });
    });
  }, []);

  const getActiveFilters = useCallback((widgetId: string): ReportFilter[] => {
    return activeFilters[widgetId] || [];
  }, [activeFilters]);

  const clearFilters = useCallback((widgetId: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[widgetId];
      return newFilters;
    });
  }, []);

  return {
    activeFilters,
    applyFilters,
    filterData,
    getActiveFilters,
    clearFilters
  };
};