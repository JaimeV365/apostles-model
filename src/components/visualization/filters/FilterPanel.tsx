import React, { useState, useEffect, useMemo } from 'react';
import { Filter, X, Calendar, ChevronDown, Check, Sliders } from 'lucide-react';
import { DataPoint } from '@/types/base';
import { FrequencySlider } from '../controls/FrequencyControl/FrequencySlider';
import { Switch } from '../../ui/Switch/Switch';
import './FilterPanel.css';

// Types for filter state
interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
  preset?: string;
}

interface AttributeFilter {
  field: string;
  values: Set<string | number>;
  availableValues: Array<{value: string | number, count: number}>;
  expanded?: boolean;
}

interface FilterState {
  dateRange: DateRange;
  attributes: AttributeFilter[];
  isActive: boolean;
}

interface FilterPanelProps {
  data: DataPoint[];
  onFilterChange: (filteredData: DataPoint[], filters: any[]) => void;
  onClose: () => void;
  isOpen: boolean;
  showPointCount?: boolean;
  onTogglePointCount?: (show: boolean) => void;
  hideHeader?: boolean;
  contentOnly?: boolean;
  // Frequency controls
  frequencyFilterEnabled?: boolean;
  frequencyThreshold?: number;
  onFrequencyFilterEnabledChange?: (enabled: boolean) => void;
  onFrequencyThresholdChange?: (threshold: number) => void;
  frequencyData?: {
    maxFrequency: number;
    hasOverlaps: boolean;
  };
}

const DATE_PRESETS = [
  { label: 'All Time', key: 'all' },
  { label: 'Today', key: 'today' },
  { label: 'Yesterday', key: 'yesterday' },
  { label: 'Last 7 Days', key: 'last7days' },
  { label: 'Last 30 Days', key: 'last30days' },
  { label: 'This Month', key: 'thisMonth' },
  { label: 'Last Month', key: 'lastMonth' },
  { label: 'This Year', key: 'thisYear' },
  { label: 'Last Year', key: 'lastYear' },
  { label: 'Custom Range', key: 'custom' },
];

const FilterPanel: React.FC<FilterPanelProps> = ({
  data,
  onFilterChange,
  onClose,
  isOpen,
  showPointCount = true,
  onTogglePointCount,
  hideHeader = false,
  contentOnly = false,
  frequencyFilterEnabled = false,
  frequencyThreshold = 1,
  onFrequencyFilterEnabledChange,
  onFrequencyThresholdChange,
  frequencyData
}) => {
  const [filterState, setFilterState] = useState<FilterState>({
    dateRange: {
      startDate: null,
      endDate: null,
      preset: 'all'
    },
    attributes: [],
    isActive: false,
  });
  
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Extract all available fields and their unique values
  const availableFields = useMemo(() => {
    const fields = new Map<string, Set<string | number>>();
    
    // Add standard fields
    fields.set('group', new Set());
    
    // Add satisfaction and loyalty as first fields for filtering
    fields.set('satisfaction', new Set());
    fields.set('loyalty', new Set());
    
    // Check for dates
    const hasDate = data.some(item => item.date);
    
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
    return Array.from(fields.entries())
      .filter(([_, values]) => values.size > 1) // Only include fields with multiple values
      .map(([field, values]) => {
        const valueArray = Array.from(values);
        return {
          field,
          values: valueArray,
          counts: valueArray.map(value => ({
            value,
            count: data.filter(item => (item as any)[field] === value).length
          }))
        };
      })
      .sort((a, b) => {
        // Custom sort order: satisfaction, loyalty, group, then others alphabetically
        const priorityFields = ['satisfaction', 'loyalty', 'group', 'name', 'email'];
        
        const aIndex = priorityFields.indexOf(a.field);
        const bIndex = priorityFields.indexOf(b.field);
        
        // If both fields are in priority list, sort by priority
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        
        // If only one field is in priority list, it goes first
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        // Otherwise sort alphabetically
        return a.field.localeCompare(b.field);
      });
  }, [data]);

  // Initialize attributes on first render
  useEffect(() => {
    if (availableFields.length > 0 && filterState.attributes.length === 0) {
      setFilterState(prev => ({
        ...prev,
        attributes: availableFields.map(field => ({
          field: field.field,
          values: new Set(),
          availableValues: field.counts,
          expanded: false
        }))
      }));
    }
  }, [availableFields, filterState.attributes.length]);

  // Apply filters when filterState changes
  useEffect(() => {
    applyFilters();
  }, [filterState.dateRange.startDate, filterState.dateRange.endDate, filterState.dateRange.preset, 
      // Use a stringified version of attributes values to avoid infinite loops
      // This will only trigger when the actual selected values change
      JSON.stringify(filterState.attributes.map(a => ({
        field: a.field,
        values: Array.from(a.values)
      })))
  ]);

  // Check if date is in range
  const isDateInRange = (dateStr: string | undefined, range: DateRange): boolean => {
    if (!dateStr || !range.startDate) return true;
    
    // Parse the date string based on format
    let dateValue: Date;
    try {
      dateValue = new Date(dateStr);
      if (isNaN(dateValue.getTime())) {
        // Try parsing in different formats if standard parsing fails
        const parts = dateStr.split(/\/|-/);
        if (parts.length === 3) {
          // Try to detect format
          if (parts[0].length === 4) {
            // yyyy-mm-dd
            dateValue = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
          } else if (parts[2].length === 4) {
            // dd/mm/yyyy or mm/dd/yyyy
            dateValue = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        }
      }
    } catch (e) {
      console.error('Error parsing date:', dateStr, e);
      return false;
    }
    
    // Check range
    if (range.startDate && dateValue < range.startDate) return false;
    if (range.endDate && dateValue > range.endDate) return false;
    
    return true;
  };

  // Apply current filters to data
  const applyFilters = () => {
    const { dateRange, attributes } = filterState;
    
    const filteredData = data.filter(item => {
      // Don't include excluded items
      if (item.excluded) return false;
      
      // Check date range if applicable
      if (dateRange.startDate || dateRange.endDate) {
        if (!isDateInRange(item.date, dateRange)) return false;
      }
      
      // Check attribute filters
      for (const attr of attributes) {
        // Skip if no values selected (include all)
        if (attr.values.size === 0) continue;
        
        // Check if this item matches any selected value for this attribute
        const itemValue = (item as any)[attr.field];
        if (!attr.values.has(itemValue)) return false;
      }
      
      return true;
    });
    
    // Check if filters are active
    const isActive = (
      (dateRange.startDate !== null || dateRange.endDate !== null) ||
      attributes.some(attr => attr.values.size > 0)
    );
    
    // Extract active filters for callback
const activeFilters = attributes
.filter(attr => attr.values.size > 0)
.map(attr => ({
  field: attr.field,
  operator: 'equals', // Default operator
  value: Array.from(attr.values).join(',') // Join multiple values
}));

// Add date filter if active
if (dateRange.startDate || dateRange.endDate) {
activeFilters.push({
  field: 'date',
  operator: 'between',
  value: `${dateRange.startDate?.toISOString() || ''}:${dateRange.endDate?.toISOString() || ''}`
});
}

// Update state and notify parent
setFilterState(prev => ({ ...prev, isActive }));
onFilterChange(filteredData, activeFilters);
  };

  // Convert preset to date range
  const applyDatePreset = (preset: string) => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    
    switch (preset) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
        break;
      case 'last7days':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'last30days':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
        break;
      case 'custom':
        // Don't change dates, just show picker
        setDatePickerVisible(true);
        break;
      case 'all':
      default:
        // Reset dates
        startDate = null;
        endDate = null;
        break;
    }
    
    if (preset !== 'custom') {
      setDatePickerVisible(false);
    }
    
    setFilterState(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        startDate,
        endDate,
        preset
      }
    }));
    
    // Update custom date inputs
    if (startDate) {
      setCustomStartDate(formatDateForInput(startDate));
    }
    if (endDate) {
      setCustomEndDate(formatDateForInput(endDate));
    }
  };

  // Toggle attribute filter
  const toggleAttributeValue = (field: string, value: string | number) => {
    setFilterState(prev => ({
      ...prev,
      attributes: prev.attributes.map(attr => {
        if (attr.field === field) {
          const newValues = new Set(attr.values);
          if (newValues.has(value)) {
            newValues.delete(value);
          } else {
            newValues.add(value);
          }
          return { ...attr, values: newValues };
        }
        return attr;
      })
    }));
  };

  // Toggle attribute section expand/collapse
  const toggleAttributeExpanded = (field: string) => {
    setFilterState(prev => ({
      ...prev,
      attributes: prev.attributes.map(attr => {
        if (attr.field === field) {
          return { ...attr, expanded: !attr.expanded };
        }
        return attr;
      })
    }));
  };

  // Reset all filters
  const resetFilters = () => {
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
      isActive: false,
    });
    setDatePickerVisible(false);
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // Apply custom date range
  const applyCustomDateRange = () => {
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    
    if (customStartDate) {
      startDate = new Date(customStartDate);
    }
    
    if (customEndDate) {
      endDate = new Date(customEndDate);
      // Set to end of day
      endDate.setHours(23, 59, 59);
    }
    
    setFilterState(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        startDate,
        endDate,
        preset: 'custom'
      }
    }));
  };

  // Format date for input field
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Get active filter count
  const getActiveFilterCount = (): number => {
    let count = 0;
    
    // Date range counts as one filter if active
    if (filterState.dateRange.startDate || filterState.dateRange.endDate) {
      count += 1;
    }
    
    // Count selected attribute values
    filterState.attributes.forEach(attr => {
      count += attr.values.size;
    });
    
    return count;
  };

  // Get display name for a field
  const getFieldDisplayName = (field: string): string => {
    // Special cases for field names that need specific formatting
    const specialFieldMap: Record<string, string> = {
      'id': 'ID',
      'satisfaction': 'Satisfaction',
      'loyalty': 'Loyalty',
      'ces': 'CES',
      'nps': 'NPS',
      'csat': 'CSAT',
      'email': 'Email',
      'date': 'Date',
      'name': 'Name',
      'group': 'Group',
      'country': 'Country'
    };
    
    // Check case-insensitive match for special fields
    for (const [fieldKey, display] of Object.entries(specialFieldMap)) {
      if (field.toLowerCase() === fieldKey.toLowerCase()) {
        return display;
      }
    }
    
    // For other fields, just capitalize first letter
    return field.charAt(0).toUpperCase() + field.slice(1);
  };

  // Format date for display
  const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if we have date data
  const hasDateData = useMemo(() => {
    return data.some(item => item.date);
  }, [data]);

  const content = (
    <>
      {/* Header - conditionally rendered */}
      {!hideHeader && !contentOnly && (
        <div className="filter-panel-header">
          <div className="filter-panel-title">
            <Filter size={18} />
            <h3>Filters</h3>
            {filterState.isActive && (
              <span className="filter-badge">{getActiveFilterCount()}</span>
            )}
          </div>
          <button className="filter-panel-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
      )}

      <div className="filter-panel-content">
        {/* Date Filters - only show if we have date data */}
        {hasDateData && (
          <>
            <div className="filter-section-category">Date Filters</div>
            <div className="filter-section">
              <div className="filter-section-header">
                <h4>Date Range</h4>
                {filterState.dateRange.startDate && (
                  <button 
                    className="filter-clear-button" 
                    onClick={() => applyDatePreset('all')}
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <div className="date-preset-buttons">
                {DATE_PRESETS.slice(0, 5).map(preset => (
                  <button
                    key={preset.key}
                    className={`date-preset-button ${filterState.dateRange.preset === preset.key ? 'active' : ''}`}
                    onClick={() => applyDatePreset(preset.key)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              
              <div className="date-preset-buttons">
                {DATE_PRESETS.slice(5).map(preset => (
                  <button
                    key={preset.key}
                    className={`date-preset-button ${filterState.dateRange.preset === preset.key ? 'active' : ''}`}
                    onClick={() => applyDatePreset(preset.key)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              
              {/* Custom date picker */}
              {datePickerVisible && (
                <div className="custom-date-picker">
                  <div className="date-inputs">
                    <div className="date-input-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={e => setCustomStartDate(e.target.value)}
                      />
                    </div>
                    <div className="date-input-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={e => setCustomEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    className="apply-date-button"
                    onClick={applyCustomDateRange}
                  >
                    Apply
                  </button>
                </div>
              )}
              
              {/* Active date range display */}
              {(filterState.dateRange.startDate || filterState.dateRange.endDate) && (
                <div className="active-date-range">
                  <Calendar size={14} />
                  <span>
                    {filterState.dateRange.startDate ? formatDateForDisplay(filterState.dateRange.startDate) : 'All past'} 
                    {' - '} 
                    {filterState.dateRange.endDate ? formatDateForDisplay(filterState.dateRange.endDate) : 'All future'}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Scale Filters */}
        <div className="filter-section-category">Scales</div>
        {filterState.attributes
          .filter(attr => ['satisfaction', 'loyalty'].includes(attr.field))
          .map(attr => (
            <div className="filter-section" key={attr.field}>
              <div 
                className="filter-section-header clickable" 
                onClick={() => toggleAttributeExpanded(attr.field)}
              >
                <h4>{getFieldDisplayName(attr.field)}</h4>
                <div className="filter-section-header-right">
                  {attr.values.size > 0 && (
                    <button 
                      className="filter-clear-button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterState(prev => ({
                          ...prev,
                          attributes: prev.attributes.map(a => 
                            a.field === attr.field ? {...a, values: new Set()} : a
                          )
                        }));
                      }}
                    >
                      Clear
                    </button>
                  )}
                  <ChevronDown 
                    size={16} 
                    className={`chevron-icon ${attr.expanded ? 'expanded' : ''}`} 
                  />
                </div>
              </div>
              
              {attr.expanded && (
                <div className="attribute-value-list">
                  {attr.availableValues.map(({value, count}) => (
                    <div 
                      key={`${attr.field}-${value}`}
                      className={`attribute-value-item ${attr.values.has(value) ? 'selected' : ''}`}
                      onClick={() => toggleAttributeValue(attr.field, value)}
                    >
                      <div className="checkbox">
                        {attr.values.has(value) && <Check size={14} />}
                      </div>
                      <div className="attribute-label">{value.toString()}</div>
                      <div className="attribute-count">{count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

        {/* Basic Information Filters */}
        <div className="filter-section-category">Basic Information</div>
        {filterState.attributes
          .filter(attr => ['group', 'name', 'email'].includes(attr.field))
          .map(attr => (
            <div className="filter-section" key={attr.field}>
              <div 
                className="filter-section-header clickable" 
                onClick={() => toggleAttributeExpanded(attr.field)}
              >
                <h4>{getFieldDisplayName(attr.field)}</h4>
                <div className="filter-section-header-right">
                  {attr.values.size > 0 && (
                    <button 
                      className="filter-clear-button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterState(prev => ({
                          ...prev,
                          attributes: prev.attributes.map(a => 
                            a.field === attr.field ? {...a, values: new Set()} : a
                          )
                        }));
                      }}
                    >
                      Clear
                    </button>
                  )}
                  <ChevronDown 
                    size={16} 
                    className={`chevron-icon ${attr.expanded ? 'expanded' : ''}`} 
                  />
                </div>
              </div>
              
              {attr.expanded && (
                <div className="attribute-value-list">
                  {attr.availableValues.map(({value, count}) => (
                    <div 
                      key={`${attr.field}-${value}`}
                      className={`attribute-value-item ${attr.values.has(value) ? 'selected' : ''}`}
                      onClick={() => toggleAttributeValue(attr.field, value)}
                    >
                      <div className="checkbox">
                        {attr.values.has(value) && <Check size={14} />}
                      </div>
                      <div className="attribute-label">{value.toString()}</div>
                      <div className="attribute-count">{count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

        {/* Additional Attributes */}
        {filterState.attributes
          .filter(attr => {
            const field = attr.field.toLowerCase();
            return !['satisfaction', 'loyalty', 'group', 'name', 'email'].includes(field) &&
                   !field.includes('sat') && 
                   !field.includes('loy');
          })
          .length > 0 && (
            <>
              <div className="filter-section-category">Additional Attributes</div>
              {filterState.attributes
                .filter(attr => {
                  const field = attr.field.toLowerCase();
                  return !['satisfaction', 'loyalty', 'group', 'name', 'email'].includes(field) &&
                         !field.includes('sat') && 
                         !field.includes('loy');
                })
                .map(attr => (
                  <div className="filter-section" key={attr.field}>
                    <div 
                      className="filter-section-header clickable" 
                      onClick={() => toggleAttributeExpanded(attr.field)}
                    >
                      <h4>{getFieldDisplayName(attr.field)}</h4>
                      <div className="filter-section-header-right">
                        {attr.values.size > 0 && (
                          <button 
                            className="filter-clear-button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterState(prev => ({
                                ...prev,
                                attributes: prev.attributes.map(a => 
                                  a.field === attr.field ? {...a, values: new Set()} : a
                                )
                              }));
                            }}
                          >
                            Clear
                          </button>
                        )}
                        <ChevronDown 
                          size={16} 
                          className={`chevron-icon ${attr.expanded ? 'expanded' : ''}`} 
                        />
                      </div>
                    </div>
                    
                    {attr.expanded && (
                      <div className="attribute-value-list">
                        {attr.availableValues.map(({value, count}) => (
                          <div 
                            key={`${attr.field}-${value}`}
                            className={`attribute-value-item ${attr.values.has(value) ? 'selected' : ''}`}
                            onClick={() => toggleAttributeValue(attr.field, value)}
                          >
                            <div className="checkbox">
                              {attr.values.has(value) && <Check size={14} />}
                            </div>
                            <div className="attribute-label">{value.toString()}</div>
                            <div className="attribute-count">{count}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </>
          )}
      </div>
      
      {/* Frequency Controls */}
      {frequencyData?.hasOverlaps && (
        <>
          <div className="filter-section-category">Frequency</div>
          <div className="filter-section">
          <div className="filter-section-header">
            <h4>Point Frequency</h4>
          </div>
          <div className="filter-section-content">
            {onFrequencyFilterEnabledChange && (
              <Switch
                checked={frequencyFilterEnabled}
                onChange={onFrequencyFilterEnabledChange}
                leftLabel="Filter Points"
              />
            )}
            {frequencyFilterEnabled && onFrequencyThresholdChange && frequencyData && (
              <FrequencySlider
                maxFrequency={frequencyData.maxFrequency}
                currentThreshold={frequencyThreshold}
                onThresholdChange={onFrequencyThresholdChange}
              />
            )}
          </div>
        </div>
        </>
      )}
      
      {/* Footer */}
      {!contentOnly && (
        <div className="filter-panel-footer">
          {/* Point count toggle */}
          {onTogglePointCount && (
            <div className="filter-panel-options" style={{ marginBottom: '16px' }}>
              <label className="filter-option" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                cursor: 'pointer',
                userSelect: 'none'
              }}>
                <input 
                  type="checkbox" 
                  checked={showPointCount} 
                  onChange={(e) => onTogglePointCount(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#3a863e'
                  }}
                />
                <span>Show point count</span>
              </label>
            </div>
          )}
          
          <button 
            className="filter-reset-button" 
            onClick={resetFilters}
            disabled={!filterState.isActive}
          >
            Reset All
          </button>
        </div>
      )}
    </>
  );

  // Return content with or without wrapper based on contentOnly prop
  if (contentOnly) {
    return content;
  }

  return (
    <div 
      className={`filter-panel ${isOpen ? 'open' : ''}`} 
      onClick={(e) => e.stopPropagation()}
    >
      {content}
    </div>
  );
};

export { FilterPanel as default };
export { FilterPanel };