import React, { useState, useEffect, useRef } from 'react';
import DataEntryModule from './components/data-entry/DataEntryModule';
import DataDisplay from './components/data-entry/table/DataDisplay';
import { DataPoint, ScaleFormat, ScaleState } from './types/base';
import { QuadrantAssignmentProvider } from './components/visualization/context/QuadrantAssignmentContext';
import { useNotification } from './components/data-entry/NotificationSystem';
import FilteredChart from './components/visualization/components/FilteredChart';
import { ReportingSection } from './components/reporting/ReportingSection';
import './App.css';

interface HeaderScales {
  satisfaction: ScaleFormat;
  loyalty: ScaleFormat;
}

const App: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const notification = useNotification();
  const [scales, setScales] = useState<ScaleState>({
    satisfactionScale: '1-5',
    loyaltyScale: '1-5',
    isLocked: false
  });
  
  const dataEntryRef = useRef<HTMLDivElement>(null);
const visualizationRef = useRef<HTMLDivElement>(null);
  const [activeEffects, setActiveEffects] = useState<Set<string>>(new Set());
  const [hideWatermark, setHideWatermark] = useState(false);
  // Update watermark visibility based on effects
  useEffect(() => {
    setHideWatermark(activeEffects.has('HIDE_WATERMARK'));
  }, [activeEffects]);

  
  const [isPremium, setIsPremium] = useState(false);

// Sync isPremium with activeEffects
useEffect(() => {
  if (isPremium && !activeEffects.has('premium')) {
    setActiveEffects(prev => new Set([...Array.from(prev), 'premium']));
  } else if (!isPremium && activeEffects.has('premium')) {
    setActiveEffects(prev => {
      const newSet = new Set(prev);
      newSet.delete('premium');
      return newSet;
    });
  }
}, [isPremium, activeEffects]);
  
  
  // Chart control states
  const [isClassicModel, setIsClassicModel] = useState(false); // Default to Modern
  const [showNearApostles, setShowNearApostles] = useState(false); // Default to Simple
  const [showSpecialZones, setShowSpecialZones] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isAdjustableMidpoint, setIsAdjustableMidpoint] = useState(false);
  const [frequencyFilterEnabled, setFrequencyFilterEnabled] = useState(false);
  const [frequencyThreshold, setFrequencyThreshold] = useState(1);
  const [apostlesZoneSize, setApostlesZoneSize] = useState(1); // Default to 1
const [terroristsZoneSize, setTerroristsZoneSize] = useState(1); // Default to 1

// Add callbacks to handle zone size changes from the context
const handleApostlesZoneSizeChange = (size: number) => {
  console.log(`🔄 App.tsx: Apostles zone size changed to ${size}`);
  setApostlesZoneSize(size);
};

const handleTerroristsZoneSizeChange = (size: number) => {
  console.log(`🔄 App.tsx: Terrorists zone size changed to ${size}`);
  setTerroristsZoneSize(size);
};




  const handleDataChange = (newData: DataPoint[], headerScales?: HeaderScales) => {
    // Process data to ensure group property
    const processedData = newData.map(point => ({
      ...point,
      group: point.group || 'default'
    }));
  
    // Only set scales on first data entry or when explicitly provided by headerScales
    if (data.length === 0 || headerScales) {
      // If headerScales is explicitly provided, use those exact scales
      if (headerScales) {
        setScales({
          satisfactionScale: headerScales.satisfaction,
          loyaltyScale: headerScales.loyalty,
          isLocked: true
        });
      } else {
        // Only use auto-detection on first data entry with no scales
        const maxSatisfaction = Math.max(...processedData.map(d => d.satisfaction));
        const maxLoyalty = Math.max(...processedData.map(d => d.loyalty));
        
        const newScales: ScaleState = {
          satisfactionScale: maxSatisfaction > 5 ? (maxSatisfaction > 7 ? '1-10' : '1-7') : '1-5',
          loyaltyScale: maxLoyalty > 7 ? '1-10' : maxLoyalty > 5 ? '1-7' : '1-5',
          isLocked: true
        };
        setScales(newScales);
      }
    }
    setData(processedData);
  };

  const handleDeleteDataPoint = (id: string) => {
    const newData = data.filter(item => item.id !== id);
    setData(newData);
    if (newData.length === 0) {
      setScales({
        satisfactionScale: '1-5',
        loyaltyScale: '1-5',
        isLocked: false
      });
    }
  };

  const handleEditDataPoint = (id: string) => {
    // Scroll to the data entry section
    if (dataEntryRef.current) {
      dataEntryRef.current.scrollIntoView({ behavior: 'smooth' });
      
      // Dispatch a custom event to tell the DataEntryModule to start editing
      const editEvent = new CustomEvent('edit-data-point', { detail: { id } });
      document.dispatchEvent(editEvent);
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      setData([]);
      setScales({
        satisfactionScale: '1-5',
        loyaltyScale: '1-5',
        isLocked: false
      });
      
      // Dispatch a custom event to clear CSV warnings
      const clearWarningsEvent = new CustomEvent('clear-csv-warnings');
      document.dispatchEvent(clearWarningsEvent);
    }
  };

  const handleToggleExclude = (id: string) => {
    setData(data.map(item => 
      item.id === id ? { ...item, excluded: !item.excluded } : item
    ));
  };

  

  return (
    <div className="app">
      
        <>
          <header className="app-header">
            <h1>Apostles Model Builder</h1>
            <div className="mode-indicator">
              {isPremium ? (
  <span 
    className="mode-badge mode-badge--premium" 
    title="Click to disable premium mode (testing)"
    role="button"
    onClick={() => {
      setIsPremium(false);
      notification.showNotification({
        title: 'Standard Mode Enabled',
        message: 'Switched to standard mode.',
        type: 'info'
      });
    }}
  >
    👑 Premium Mode
  </span>
) : (
  <span 
    className="mode-badge mode-badge--standard" 
    title="Click to enable premium mode (testing)"
    role="button"
    onClick={() => {
      setIsPremium(true);
      notification.showNotification({
        title: 'Premium Mode Enabled',
        message: 'All premium features are now available.',
        type: 'success'
      });
    }}
  >
    ⚪ Standard Mode
  </span>
)}
            </div>
          </header>
          
          <main className="app-content">
            <div className="section data-entry-section" ref={dataEntryRef}>
              <DataEntryModule 
                onDataChange={handleDataChange}
                satisfactionScale={scales.satisfactionScale}
                loyaltyScale={scales.loyaltyScale}
                data={data}
              />
            </div>

            {data.length > 0 && (
              <div className="section data-table-section">
                <DataDisplay 
                  data={data}
                  satisfactionScale={scales.satisfactionScale}
                  loyaltyScale={scales.loyaltyScale}
                  onDelete={handleDeleteDataPoint}
                  onEdit={handleEditDataPoint}
                  onDeleteAll={handleDeleteAll}
                  onToggleExclude={handleToggleExclude}
                />
              </div>
            )}

            {data.length > 0 && (
              <QuadrantAssignmentProvider
  data={data}
  satisfactionScale={scales.satisfactionScale}
  loyaltyScale={scales.loyaltyScale}
  isClassicModel={isClassicModel}
  showNearApostles={showNearApostles}
  showSpecialZones={showSpecialZones}
  apostlesZoneSize={apostlesZoneSize}
  terroristsZoneSize={terroristsZoneSize}
>
                <div className="section visualization-section" ref={visualizationRef}>
                  <h2 className="visualisation-title">Visualisation</h2>
                  <div className="visualization-content">
                    <FilteredChart
                      data={data}
                      satisfactionScale={scales.satisfactionScale}
                      loyaltyScale={scales.loyaltyScale}
                      isClassicModel={isClassicModel}
                      showNearApostles={showNearApostles}
                      showSpecialZones={showSpecialZones}
                      showLabels={showLabels}
                      showGrid={showGrid}
                      hideWatermark={hideWatermark}
                      showAdvancedFeatures={activeEffects.size > 0}
                      activeEffects={activeEffects}
                      frequencyFilterEnabled={frequencyFilterEnabled}
                      frequencyThreshold={frequencyThreshold}
                      isAdjustableMidpoint={isAdjustableMidpoint}
                      apostlesZoneSize={apostlesZoneSize} 
                      terroristsZoneSize={terroristsZoneSize}
                      onFrequencyFilterEnabledChange={setFrequencyFilterEnabled}
                      onFrequencyThresholdChange={setFrequencyThreshold}
                      onIsAdjustableMidpointChange={setIsAdjustableMidpoint}
                      onIsClassicModelChange={setIsClassicModel}
                      onShowNearApostlesChange={setShowNearApostles}
                      onShowSpecialZonesChange={setShowSpecialZones}
                      onShowLabelsChange={setShowLabels}
                      onShowGridChange={setShowGrid}
                      onEffectsChange={setActiveEffects}
                      isPremium={isPremium}
                    />
                    
                    
                  </div>
                </div>

                <div className="section reporting-section">
                  <ReportingSection
  data={data}
  satisfactionScale={scales.satisfactionScale}
  loyaltyScale={scales.loyaltyScale}
  activeEffects={activeEffects}
  isClassicModel={isClassicModel}
  isPremium={isPremium}
  showSpecialZones={showSpecialZones}
  showNearApostles={showNearApostles}
/>
                </div>
              </QuadrantAssignmentProvider>
            )}
          </main>
           
        </>
      
    </div>
  );
};

export default App;