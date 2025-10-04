import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DataPoint, SpecialZoneBoundaries } from '@/types/base';
import { QuadrantChartProps } from '../types';
import QuadrantChart from './QuadrantChart';
import { FilterPanel, FilterToggle } from '../filters';
import { calculateSpecialZoneBoundaries } from '../utils/zoneCalculator';
import { WatermarkControlsButton } from '../watermark';
import './FilteredChart.css';

// Extend the QuadrantChartProps to create FilteredChartProps
interface FilteredChartProps extends QuadrantChartProps {
  onEffectsChange?: (effects: Set<string>) => void;
  isPremium?: boolean;
}

const FilteredChart: React.FC<FilteredChartProps> = ({
  data,
  satisfactionScale,
  loyaltyScale,
  isClassicModel,
  showNearApostles,
  showSpecialZones = true,
  showLabels,
  showGrid,
  hideWatermark,
  showAdvancedFeatures,
  activeEffects,
  frequencyFilterEnabled,
  frequencyThreshold,
  isAdjustableMidpoint,
  apostlesZoneSize = 1,
  terroristsZoneSize = 1,
  onFrequencyFilterEnabledChange,
  onFrequencyThresholdChange,
  onIsAdjustableMidpointChange,
  onIsClassicModelChange,
  onShowNearApostlesChange,
  onShowSpecialZonesChange,
  onShowLabelsChange,
  onShowGridChange,
  onEffectsChange,
  isPremium
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<DataPoint[]>(data);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [showPointCount, setShowPointCount] = useState(true);
  
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  // const isPremium = activeEffects?.has('premium');

  // Determine if we have filterable data
  const hasFilterableData = useMemo(() => {
    // Check for dates
    const hasDate = data.some(item => item.date);
    
    // Check for custom fields (anything beyond standard fields)
    const hasCustomFields = data.some(item => {
      const standardFields = ['id', 'name', 'satisfaction', 'loyalty', 'excluded', 'date', 'dateFormat', 'group', 'email'];
      return Object.keys(item).some(key => !standardFields.includes(key));
    });
    
    // Check for multiple groups
    const uniqueGroups = new Set(data.map(item => item.group));
    const hasMultipleGroups = uniqueGroups.size > 1;
    
    // Check for satisfaction/loyalty distributions
    const hasSatisfactionDistribution = new Set(data.map(item => item.satisfaction)).size > 1;
    const hasLoyaltyDistribution = new Set(data.map(item => item.loyalty)).size > 1;
    
    return hasDate || hasCustomFields || hasMultipleGroups || hasSatisfactionDistribution || hasLoyaltyDistribution;
  }, [data]);

  // Update filtered data when main data changes
  useEffect(() => {
    setFilteredData(data.filter(point => !point.excluded));
  }, [data]);

  // Handle click outside to close filter panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isFilterPanelOpen &&
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.filter-toggle')
      ) {
        setIsFilterPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterPanelOpen]);

  // Handle escape key to close filter panel
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFilterPanelOpen) {
        setIsFilterPanelOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isFilterPanelOpen]);

  // Toggle filter panel
  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen);
  };

  /// Handle filter changes
const handleFilterChange = (newFilteredData: DataPoint[], newFilters: any[] = []) => {
  setFilteredData(newFilteredData);
  
  // Set active filter count based on the number of filters applied
  setActiveFilterCount(newFilters.length);
};

const maxSat = parseInt(satisfactionScale.split('-')[1]);
const maxLoy = parseInt(loyaltyScale.split('-')[1]);

const specialZoneBoundaries = useMemo(() => {
  return calculateSpecialZoneBoundaries(
    apostlesZoneSize,
    terroristsZoneSize,
    satisfactionScale,
    loyaltyScale
  );
}, [apostlesZoneSize, terroristsZoneSize, satisfactionScale, loyaltyScale]);

console.log('🔍 Special zone boundaries calculated in FilteredChart:', specialZoneBoundaries);


  return (
    <div className="filtered-chart-container" ref={chartRef}>
      {/* Filter Toggle Button - only show if we have filterable data */}
      {hasFilterableData && (
        <FilterToggle
          onClick={toggleFilterPanel}
          activeFilterCount={activeFilterCount}
          isOpen={isFilterPanelOpen}
        />
      )}
      
     {/* Watermark Controls Button */}
      <WatermarkControlsButton
        effects={activeEffects}
        onEffectsChange={onEffectsChange || (() => {})}
        isPremium={isPremium || false}
      />
      
      {/* Filter Panel Overlay */}
      {isFilterPanelOpen && (
        <div
          className="filter-overlay"
          onClick={() => setIsFilterPanelOpen(false)}
        />
      )}
      
      {/* Filter Panel */}
      {hasFilterableData && (
        <div ref={filterPanelRef}>
          <FilterPanel
  data={data}
  onFilterChange={handleFilterChange}
  onClose={() => setIsFilterPanelOpen(false)}
  isOpen={isFilterPanelOpen}
  showPointCount={showPointCount}
  onTogglePointCount={setShowPointCount}
/>
        </div>
      )}
      
      {/* Point Count Display - only show if filter panel is available and checkbox is ON */}
      {hasFilterableData && showPointCount && (
        <div className="point-counter-display">
          {filteredData.length} out of {data.filter(p => !p.excluded).length} {data.filter(p => !p.excluded).length === 1 ? 'data point' : 'data points'}
        </div>
      )}
      
      {/* Chart with Filtered Data */}
      <QuadrantChart
  data={filteredData}
  satisfactionScale={satisfactionScale}
  loyaltyScale={loyaltyScale}
  isClassicModel={isClassicModel}
  showNearApostles={showNearApostles}
  showSpecialZones={showSpecialZones}
  showLabels={showLabels}
  showGrid={showGrid}
  hideWatermark={hideWatermark}
  showAdvancedFeatures={showAdvancedFeatures}
  activeEffects={activeEffects}
  frequencyFilterEnabled={frequencyFilterEnabled}
  frequencyThreshold={frequencyThreshold}
  isAdjustableMidpoint={isAdjustableMidpoint}
  onFrequencyFilterEnabledChange={onFrequencyFilterEnabledChange}
  onFrequencyThresholdChange={onFrequencyThresholdChange}
  onIsAdjustableMidpointChange={onIsAdjustableMidpointChange}
  onIsClassicModelChange={onIsClassicModelChange}
  onShowNearApostlesChange={onShowNearApostlesChange}
  onShowSpecialZonesChange={onShowSpecialZonesChange || (() => {})}
  onShowLabelsChange={onShowLabelsChange}
  onShowGridChange={onShowGridChange}
/>
    </div>
  );
};

export default FilteredChart;