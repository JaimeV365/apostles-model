import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { DataPoint } from '@/types/base';

// Filter state interfaces
export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
  preset?: string;
}

export interface AttributeFilter {
  field: string;
  values: Set<string | number>;
  availableValues?: Array<{
    value: string | number;
    count: number;
  }>;
  expanded?: boolean;
}

export interface FilterState {
  dateRange: DateRange;
  attributes: AttributeFilter[];
  isActive: boolean;
}

export interface FilterContextType {
  // Current filter state
  filterState: FilterState;
  
  // Filter actions
  setFilterState: (state: FilterState) => void;
  updateDateRange: (dateRange: Partial<DateRange>) => void;
  updateAttributeFilter: (field: string, values: Set<string | number>) => void;
  resetFilters: () => void;
  
  // Filtered data
  filteredData: DataPoint[];
  setFilteredData: (data: DataPoint[]) => void;
  
  // Active filter count
  activeFilterCount: number;
  setActiveFilterCount: (count: number) => void;
  
  // Data source
  data: DataPoint[];
  setData: (data: DataPoint[]) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
  initialData?: DataPoint[];
  initialFilterState?: FilterState;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ 
  children, 
  initialData = [],
  initialFilterState
}) => {
  const [data, setData] = useState<DataPoint[]>(initialData);
  const [filteredData, setFilteredData] = useState<DataPoint[]>(initialData);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  const [filterState, setFilterState] = useState<FilterState>(
    initialFilterState || {
      dateRange: {
        startDate: null,
        endDate: null,
        preset: 'all'
      },
      attributes: [],
      isActive: false
    }
  );

  // Update date range
  const updateDateRange = useCallback((dateRangeUpdate: Partial<DateRange>) => {
    setFilterState(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        ...dateRangeUpdate
      }
    }));
  }, []);

  // Update attribute filter
  const updateAttributeFilter = useCallback((field: string, values: Set<string | number>) => {
    setFilterState(prev => ({
      ...prev,
      attributes: prev.attributes.map(attr => 
        attr.field === field 
          ? { ...attr, values }
          : attr
      )
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilterState({
      dateRange: {
        startDate: null,
        endDate: null,
        preset: 'all'
      },
      attributes: filterState.attributes.map(attr => ({
        ...attr,
        values: new Set()
      })),
      isActive: false
    });
    setFilteredData(data);
    setActiveFilterCount(0);
  }, [data, filterState.attributes]);

  // Initialize attributes based on data
  useEffect(() => {
    if (data.length > 0) {
      const fields = new Map<string, Set<string | number>>();
      
      // Add standard fields
      fields.set('group', new Set());
      fields.set('satisfaction', new Set());
      fields.set('loyalty', new Set());
      
      data.forEach(item => {
        // Add group values
        if (item.group) {
          fields.get('group')?.add(item.group);
        }
        
        // Add satisfaction and loyalty values
        if (item.satisfaction) {
          fields.get('satisfaction')?.add(item.satisfaction);
        }
        
        if (item.loyalty) {
          fields.get('loyalty')?.add(item.loyalty);
        }
        
        // Collect unique values for each field
        Object.entries(item).forEach(([key, value]) => {
          if (
            // Skip base fields
            !['id', 'name', 'satisfaction', 'loyalty', 'excluded', 'date', 'dateFormat'].includes(key) &&
            // Skip empty values
            value !== undefined && value !== null && value !== '' &&
            // Skip function values
            typeof value !== 'function'
          ) {
            if (!fields.has(key)) {
              fields.set(key, new Set());
            }
            fields.get(key)?.add(value);
          }
        });
      });
      
      // Convert to array format with counts
      const availableFields = Array.from(fields.entries())
        .map(([field, valuesSet]) => ({
          field,
          counts: Array.from(valuesSet).map(value => ({
            value,
            count: data.filter(item => (item as any)[field] === value || ((item as any).additionalAttributes && (item as any).additionalAttributes[field] === value)).length
          }))
        }))
        .sort((a, b) => {
          const priorityFields = ['satisfaction', 'loyalty', 'group', 'name', 'email'];
          const aIndex = priorityFields.indexOf(a.field);
          const bIndex = priorityFields.indexOf(b.field);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.field.localeCompare(b.field);
        });
      
      // Initialize attributes if they're empty
      setFilterState(prev => ({
        ...prev,
        attributes: prev.attributes.length === 0 ? availableFields.map(field => ({
          field: field.field,
          values: new Set(),
          availableValues: field.counts,
          expanded: false
        })) : prev.attributes
      }));
    }
  }, [data]);

  // Update data and reset filtered data
  const handleSetData = useCallback((newData: DataPoint[]) => {
    setData(newData);
    setFilteredData(newData);
  }, []);

  const contextValue: FilterContextType = {
    filterState,
    setFilterState,
    updateDateRange,
    updateAttributeFilter,
    resetFilters,
    filteredData,
    setFilteredData,
    activeFilterCount,
    setActiveFilterCount,
    data,
    setData: handleSetData
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

// Hook to use filter context
export const useFilterContext = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
};

// Hook to safely use filter context (returns null if not available)
export const useFilterContextSafe = (): FilterContextType | null => {
  const context = useContext(FilterContext);
  return context || null;
};
