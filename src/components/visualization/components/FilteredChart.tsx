import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { DataPoint, SpecialZoneBoundaries } from '@/types/base';
import { QuadrantChartProps } from '../types';
import QuadrantChart from './QuadrantChart';
import { FilterPanel, FilterToggle } from '../filters';
import { calculateSpecialZoneBoundaries } from '../utils/zoneCalculator';
import { WatermarkControlsButton } from '../watermark';
import { UnifiedChartControls } from '../controls/UnifiedChartControls';
import './FilteredChart.css';

// Extend the QuadrantChartProps to create FilteredChartProps
interface FilteredChartProps extends QuadrantChartProps {
  onEffectsChange?: (effects: Set<string>) => void;
  isPremium?: boolean;
}

const FilteredChart: React.FC<FilteredChartProps> = React.memo(({
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
  const [isUnifiedControlsOpen, setIsUnifiedControlsOpen] = useState(false);
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

  // Update filtered data when main data changes - optimized for large datasets
  useEffect(() => {
    const excludedIds = new Set(data.filter(p => p.excluded).map(p => p.id));
    setFilteredData(data.filter(point => !excludedIds.has(point.id)));
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

  const specialZoneBoundaries = useMemo(() => {
    return calculateSpecialZoneBoundaries(
      apostlesZoneSize,
      terroristsZoneSize,
      satisfactionScale,
      loyaltyScale
    );
  }, [apostlesZoneSize, terroristsZoneSize, satisfactionScale, loyaltyScale]);

  // Calculate grid dimensions for watermark controls
  const gridDimensions = useMemo(() => {
    const maxSat = parseInt(satisfactionScale.split('-')[1]);
    const maxLoy = parseInt(loyaltyScale.split('-')[1]);
    const minSat = parseInt(satisfactionScale.split('-')[0]);
    const minLoy = parseInt(loyaltyScale.split('-')[0]);
    return {
      totalCols: maxSat,
      totalRows: maxLoy,
      cellWidth: 40, // Approximate cell width
      cellHeight: 40, // Approximate cell height
      midpointCol: Math.floor(maxSat / 2),
      midpointRow: Math.floor(maxLoy / 2),
      hasNearApostles: showNearApostles,
      scaleRanges: {
        satisfaction: { min: minSat, max: maxSat },
        loyalty: { min: minLoy, max: maxLoy }
      }
    };
  }, [satisfactionScale, loyaltyScale, showNearApostles]);



  return (
    <div className="filtered-chart-container" ref={chartRef}>
      {/* Unified Controls Toggle Button */}
      {data.length > 0 && (
        <button 
            className={`filter-toggle ${isUnifiedControlsOpen ? 'active' : ''} ${activeFilterCount > 0 ? 'has-filters' : ''}`}
            onClick={() => setIsUnifiedControlsOpen(!isUnifiedControlsOpen)}
            title="Unified Controls"
            aria-label="Toggle unified controls panel"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '36px',
              height: '36px',
              backgroundColor: isUnifiedControlsOpen ? '#3a863e' : 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              zIndex: 20,
              transition: 'all 0.2s ease',
              color: isUnifiedControlsOpen ? 'white' : '#3a863e'
            }}
          >
            <Filter size={20} />
            {activeFilterCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {activeFilterCount}
              </span>
            )}
          </button>
      )}
      
      {/* Unified Controls Panel */}
      <UnifiedChartControls
        hasFilterableData={hasFilterableData}
        activeFilterCount={activeFilterCount}
        data={data}
        onFilterChange={handleFilterChange}
        effects={activeEffects}
        onEffectsChange={onEffectsChange || (() => {})}
        dimensions={gridDimensions}
        isPremium={isPremium || false}
        frequencyFilterEnabled={frequencyFilterEnabled}
        frequencyThreshold={frequencyThreshold}
        onFrequencyFilterEnabledChange={onFrequencyFilterEnabledChange}
        onFrequencyThresholdChange={onFrequencyThresholdChange}
        frequencyData={{
          maxFrequency: 10, // This should be calculated from data
          hasOverlaps: true // This should be calculated from data
        }}
        isOpen={isUnifiedControlsOpen}
        onClose={() => setIsUnifiedControlsOpen(false)}
      />
      
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
});

export default FilteredChart;