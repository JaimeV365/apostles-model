import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataPoint } from '@/types/base';
import { ReportFilterPanel, ReportFilter } from '../../filters/ReportFilterPanel';
import { Settings, X, Filter, Menu } from 'lucide-react';
import { scaleLinear } from 'd3-scale';
import FilterPanel from '../../../visualization/filters/FilterPanel';
import FilterToggle from '../../../visualization/filters/FilterToggle';
import './styles.css';

export interface BarChartData {
  value: number;
  count: number;
}

interface BarChartProps {
  data: BarChartData[];
  showGrid?: boolean;
  showLabels?: boolean;
  interactive?: boolean;
  customColors?: Record<number, string>;
  onColorChange?: (value: number, color: string) => void;
  onGridChange?: (showGrid: boolean) => void;
  className?: string;
  chartType?: 'bar' | 'mini';
  chartId?: string;
  title?: string;
  showLegend?: boolean;
  // Props for filtering
  originalData?: DataPoint[]; // Original data for filtering
  onFilterChange?: (filters: ReportFilter[]) => void;
  activeFilters?: ReportFilter[];
  isPremium?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  showGrid = true,
  showLabels = true,
  interactive = false,
  customColors = {},
  onColorChange,
  onGridChange,
  className = '',
  chartId = '',
  title,
  showLegend = true,
  chartType = 'bar',
  originalData,
  onFilterChange,
  activeFilters = [],
  isPremium = false
}) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [selectedBar] = useState<number | null>(null);
  const [showValues, setShowValues] = useState(true);
  const [internalShowGrid, setInternalShowGrid] = useState(showGrid);
  const [customHexInput, setCustomHexInput] = useState('');
  const [applyToAll, setApplyToAll] = useState(false);
  const [showChartLegend, setShowChartLegend] = useState(showLegend);
  const [selectedBars, setSelectedBars] = useState<Set<number>>(new Set());
  const [lastTabClicked, setLastTabClicked] = useState<string | null>(null);
  
  // Replace separate panel states with unified panel
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [activePanelTab, setActivePanelTab] = useState<'settings' | 'filters'>('settings');
  
  // Update ref to point to the side panel
  const sidePanelRef = useRef<HTMLDivElement>(null);
const cogwheelRef = useRef<HTMLButtonElement>(null);
const settingsTabRef = useRef<HTMLButtonElement>(null);
const filtersTabRef = useRef<HTMLButtonElement>(null);
  
const handleClickOutside = useCallback((event: MouseEvent) => {
  // Only run this logic if the panel is showing
  if (!showSidePanel) return;
  
  const targetElement = event.target as HTMLElement;
  const isBarClick = targetElement.closest('.bar-chart-bar');
  const isPanelClick = targetElement.closest('.filter-panel');
  const isFilterPanelClick = targetElement.closest('.report-filter-panel') || 
                             targetElement.closest('.filter-panel-content');
  const isTabClick = targetElement.closest('.filter-tab');
  const isControlButtonClick = cogwheelRef.current?.contains(targetElement);
  
  console.log('Click outside handler triggered');
  console.log('isPanelClick:', isPanelClick);
  console.log('isFilterPanelClick:', isFilterPanelClick);
  console.log('isTabClick:', isTabClick);
  console.log('Target element:', targetElement);
  console.log('Target classList:', targetElement.classList);
  console.log('Current panel tab:', activePanelTab);
  
  // Close side panel when clicking outside (but not on tabs)
  if (!isPanelClick && !isControlButtonClick && !isTabClick && !isFilterPanelClick) {
    console.log('Closing panel!');
    setShowSidePanel(false);
  }
  
  // Clear selection only if clicking outside bars and not in panel
  if (!isBarClick && !isPanelClick && !isFilterPanelClick && !isTabClick) {
    setSelectedBars(new Set());
    setApplyToAll(false);
  }
}, [showSidePanel, activePanelTab]);
  
useEffect(() => {
  document.addEventListener('mouseup', handleClickOutside);
  return () => {
    document.removeEventListener('mouseup', handleClickOutside);
  };
}, [handleClickOutside]);

useEffect(() => {
  console.log("Panel state changed:", { showSidePanel, activePanelTab, lastTabClicked });
}, [showSidePanel, activePanelTab, lastTabClicked]);

useEffect(() => {
  const logAllClicks = (e: MouseEvent) => {
    console.log("Document click:", e.target);
  };
  
  document.body.addEventListener('click', logAllClicks, true);
  
  return () => {
    document.body.removeEventListener('click', logAllClicks, true);
  };
}, []);

  useEffect(() => {
    setInternalShowGrid(showGrid);
  }, [showGrid]);

  useEffect(() => {
    // Update applyToAll based on whether all bars are selected
    setApplyToAll(areAllBarsSelected());
  }, [selectedBars, data.length]);

  const getNiceScale = (maxValue: number): number[] => {
    // Round up maxValue to next nice number
    let step: number;
    let niceMax: number;
    
    if (maxValue <= 5) {
      step = 1;
      niceMax = Math.ceil(maxValue);
    } else if (maxValue <= 20) {
      step = 5;
      niceMax = Math.ceil(maxValue / 5) * 5;
    } else if (maxValue <= 100) {
      step = 10;
      niceMax = Math.ceil(maxValue / 10) * 10;
    } else {
      step = 20;
      niceMax = Math.ceil(maxValue / 20) * 20;
    }
  
    // Create array from 0 to niceMax by step
    return Array.from(
      { length: (niceMax / step) + 1 }, 
      (_, i) => i * step
    );
  };
  
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const yScale = scaleLinear()
    .domain([0, maxCount])
    .nice()
    .range([0, 100]);

  const scaleMarkers = yScale.ticks(5)
    .map(value => ({
      value,
      position: yScale(value)
    }));

  const areAllBarsSelected = () => {
    return selectedBars.size === data.length;
  };

  const handleBarClick = (value: number, event: React.MouseEvent) => {
    if (!interactive) return;
  
    if (event.ctrlKey) {
      // Multi-selection with Ctrl key
      setSelectedBars(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(value)) {
          newSelection.delete(value);
        } else {
          newSelection.add(value);
        }
        return newSelection;
      });
    } else {
      // Single selection/deselection
      setSelectedBars(prev => {
        // If clicking already selected bar, deselect it
        if (prev.has(value) && prev.size === 1) {
          return new Set();
        }
        // Otherwise, select only this bar
        return new Set([value]);
      });
    }
  };
  
  // Format operator for display
  const formatOperator = (operator: string): string => {
    switch (operator) {
      case 'equals': return '=';
      case 'notEquals': return '≠';
      case 'contains': return 'contains';
      case 'greaterThan': return '>';
      case 'lessThan': return '<';
      case 'between': return 'between';
      default: return operator;
    }
  };
  
  // Handle filter changes
  const handleApplyFilters = (filters: ReportFilter[]) => {
    onFilterChange?.(filters);
    setShowSidePanel(false);
  };
  
  // Function to open panel with specific tab
  const handleOpenPanel = (tab: 'settings' | 'filters') => {
    setActivePanelTab(tab);
    setShowSidePanel(true);
  };
  
  return (
    <div className={`bar-chart-container ${showChartLegend ? 'show-legend' : ''} ${className}`} data-chart-id={chartId}>
      {showChartLegend && title && (
        <div className="bar-chart-legend">
          <h4 className="bar-chart-title">{title}</h4>
        </div>
      )}
      
      {/* Updated controls section */}
      {interactive && (
  <div className="bar-chart-controls">
    <button
      ref={cogwheelRef}
      className={`bar-chart-control-button ${showSidePanel ? 'active' : ''} ${activeFilters && activeFilters.length > 0 ? 'has-filters' : ''}`}
      onClick={() => {
        setShowSidePanel(!showSidePanel);
        // Start with filters tab if there are active filters, otherwise settings
        setActivePanelTab(activeFilters && activeFilters.length > 0 ? 'filters' : 'settings');
      }}
      title="Chart settings and filters"
    >
      <Menu size={22} />
{activeFilters && activeFilters.length > 0 && (
  <span className="filter-badge small">{activeFilters.length}</span>
)}
    </button>
  </div>
)}

      {/* Unified side panel using ReportFilterPanel */}
      {showSidePanel && interactive && (
  <div className="filter-overlay" onMouseDown={() => console.log("Overlay mousedown")}>
    <div 
      className="filter-panel open"
      onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up
    >
      <div className="filter-panel-header">
        <div className="filter-panel-tabs">
        <button 
  ref={settingsTabRef}
  className={`filter-tab ${activePanelTab === 'settings' ? 'active' : ''}`}
  onClick={(e) => {
    console.log("Settings tab clicked");
    e.stopPropagation();
    setActivePanelTab('settings');
  }}
>
  Settings
</button>
{isPremium && (
  <button 
  ref={filtersTabRef}
  className={`filter-tab ${activePanelTab === 'filters' ? 'active' : ''}`}
  onClick={(e) => {
    console.log("Filters tab clicked");
    e.stopPropagation();
    setLastTabClicked('filters');
    setActivePanelTab('filters');
  }}
  onMouseDown={(e) => {
    console.log("Filters tab mousedown");
    e.preventDefault(); 
    e.stopPropagation();
  }}
>
    Filters
    {activeFilters && activeFilters.length > 0 && (
      <span className="filter-badge small">{activeFilters.length}</span>
    )}
  </button>
)}
        </div>
        <button className="filter-panel-close" onClick={() => setShowSidePanel(false)}>
          <X size={20} />
        </button>
      </div>
      
      {activePanelTab === 'settings' ? (
        <div className="filter-panel-content">
          <div className="settings-group">
            <div className="settings-title">Display Settings</div>
            <div className="settings-option">
              <input
                type="checkbox"
                id={`show-values-${chartId}`}
                checked={showValues}
                onChange={(e) => setShowValues(e.target.checked)}
              />
              <label htmlFor={`show-values-${chartId}`}>
                Show values
              </label>
            </div>
            <div className="settings-option">
              <input
                type="checkbox"
                id={`show-grid-${chartId}`}
                checked={internalShowGrid}
                onChange={(e) => {
                  setInternalShowGrid(e.target.checked);
                  onGridChange?.(e.target.checked);
                }}
              />
              <label htmlFor={`show-grid-${chartId}`}>
                Show grid
              </label>
            </div>
            <div className="settings-option">
              <input
                type="checkbox"
                id={`show-legend-${chartId}`}
                checked={showChartLegend}
                onChange={(e) => setShowChartLegend(e.target.checked)}
              />
              <label htmlFor={`show-legend-${chartId}`}>
                Show legend
              </label>
            </div>
          </div>
          <div className="divider"></div>
          {isPremium && originalData && activeFilters && activeFilters.length > 0 && (
            <>
              <div className="settings-group">
                <div className="settings-title">Active Filters</div>
                <div className="filters-list">
                  {activeFilters.map((filter, index) => (
                    <div key={index} className="filter-item">
                      <span>{filter.field} {formatOperator(filter.operator)} {filter.value}</span>
                    </div>
                  ))}
                  <button
                    className="filter-manage-button"
                    onClick={() => setActivePanelTab('filters')}
                  >
                    Manage Filters
                  </button>
                </div>
              </div>
              <div className="divider"></div>
            </>
          )}
          <div className="settings-group">
            <div className="settings-title">Bar Colours</div>
            <div className="color-palette">
              {[
                '#3a863e', // Brand green
                '#CC0000', // Red
                '#F7B731', // Yellow
                '#3A6494', // Blue
                '#8b5cf6', // Purple
                '#ec4899', // Pink
                '#78716c', // Warm gray
              ].map((color) => (
                <div
                  key={color}
                  className={`color-swatch ${
                    customColors[selectedBar || 0] === color ? 'selected' : ''
                  } ${selectedBars.size === 0 ? 'disabled' : ''}`}
                  style={{ 
                    backgroundColor: color,
                    pointerEvents: selectedBars.size === 0 ? 'none' : 'auto'
                  }}
                  onClick={() => {
                    if (selectedBars.size === 0) return;
                    selectedBars.forEach(barValue => {
                      onColorChange?.(barValue, color);
                    });
                    setCustomHexInput(color.replace('#', ''));
                  }}
                />
              ))}
            </div>
            <div className="custom-color-input">
              <span className="custom-color-label">Custom hex:</span>
              <span>#</span>
              <input
                type="text"
                value={customHexInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
                  setCustomHexInput(value);
                  if (value.length === 6) {
                    onColorChange?.(selectedBar || 0, '#' + value);
                  }
                }}
                placeholder="3a863e"
                maxLength={6}
              />
            </div>
            <div className="settings-option">
              <input
                type="checkbox"
                id={`apply-all-${chartId}`}
                checked={applyToAll}
                style={{ 
                  cursor: 'pointer',
                  opacity: selectedBars.size === 0 ? 0.5 : 1
                }}
                onChange={(e) => {
                  setApplyToAll(e.target.checked);
                  if (e.target.checked) {
                    setSelectedBars(new Set(data.map(d => d.value)));
                  } else {
                    setSelectedBars(new Set());
                  }
                }}
              />
              <label htmlFor={`apply-all-${chartId}`}>
                Apply to all bars
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div onClick={(e) => {
          console.log("Filter panel container clicked");
          e.stopPropagation();
        }} style={{ width: '100%', height: '100%' }}>
          <FilterPanel
            data={originalData || []}
            onFilterChange={(filteredData, newFilters) => {
              console.log("Filter change triggered", newFilters);
              // Update the local activeFilters state
              if (onFilterChange) {
                onFilterChange(newFilters); // Pass the new filters to the parent
              }
            }}
            onClose={() => {
              console.log("Filter panel close triggered");
              setShowSidePanel(false);
            }}
            isOpen={true}
            showPointCount={true}
            hideHeader={true}
          />
        </div>
      )}
    </div>
  </div>
)}
      
      <div className="bar-chart-wrapper">
        <div className="bar-chart-scale">
          {scaleMarkers.map(marker => (
            <div
              key={marker.value}
              className="bar-chart-scale-marker"
              style={{ 
                '--position': marker.position
              } as React.CSSProperties}
            >
              {marker.value}
            </div>
          ))}
        </div>

        {internalShowGrid && (
          <div className="bar-chart-grid">
            {scaleMarkers.map(marker => (
              <div
                key={marker.value}
                className="bar-chart-grid-line"
                style={{ bottom: `${marker.position}%` }}
              />
            ))}
          </div>
        )}

        <div className="bar-chart-bars">
          {data.map(({ value, count }) => {
            const heightPercent = yScale(count);
            const showValueForBar = showValues || hoveredBar === value;
            
            return (
              <div 
                key={value} 
                className={`bar-chart-bar-container ${showValueForBar ? 'show-value' : ''}`}
              >
                <div
                  className={`bar-chart-bar ${interactive ? 'premium' : ''} ${
                    selectedBars.has(value) ? 'selected-bar' : ''
                  }`}
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: customColors[value] || '#3a863e'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBarClick(value, e);
                  }}
                  onMouseEnter={() => setHoveredBar(value)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {count > 0 && showValues && (
                    <div className="bar-chart-value">
                      {count}
                    </div>
                  )}
                </div>

                {showLabels && (
                  <div className="bar-chart-label">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </div>
                )}

                {hoveredBar === value && (
                  <div className="bar-chart-tooltip">
                    <div className="bar-chart-tooltip-value">
                      Value: {value}
                    </div>
                    <div className="bar-chart-tooltip-count">
                      Count: {count}
                    </div>
                    {interactive && (
                      <div className="bar-chart-tooltip-hint">
                        {selectedBars.size > 0 ? 
                          'Ctrl+Click to select multiple bars' : 
                          'Click to select bar'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BarChart;