import { useState, useCallback, useEffect } from 'react';

interface ReportCustomization {
  highlightedKPIs: Set<string>;
  chartColors: Record<string, Record<number, string>>;
}

export const useReportCustomization = (isPremium: boolean) => {
  const [customization, setCustomization] = useState<ReportCustomization>({
    highlightedKPIs: new Set(),
    chartColors: {
      satisfaction: {},
      loyalty: {}
    }
  });

  // Load saved customizations
  useEffect(() => {
    if (isPremium) {
      const saved = localStorage.getItem('report-customization');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCustomization(prev => ({
            ...prev,
            highlightedKPIs: new Set(parsed.highlightedKPIs || []),
            chartColors: parsed.chartColors || prev.chartColors
          }));
        } catch (e) {
          console.error('Error loading saved customizations:', e);
        }
      }
    }
  }, [isPremium]);

  // Save customizations
  useEffect(() => {
    if (isPremium) {
      localStorage.setItem('report-customization', JSON.stringify({
        highlightedKPIs: Array.from(customization.highlightedKPIs),
        chartColors: customization.chartColors
      }));
    }
  }, [customization, isPremium]);

  const toggleHighlight = useCallback((kpiId: string) => {
    if (!isPremium) return;
    
    setCustomization(prev => {
      const newHighlights = new Set(prev.highlightedKPIs);
      if (newHighlights.has(kpiId)) {
        newHighlights.delete(kpiId);
      } else {
        newHighlights.add(kpiId);
      }
      return {
        ...prev,
        highlightedKPIs: newHighlights
      };
    });
  }, [isPremium]);

  const setChartColor = useCallback((chart: string, value: number, color: string) => {
    if (!isPremium) return;

    setCustomization(prev => ({
      ...prev,
      chartColors: {
        ...prev.chartColors,
        [chart]: {
          ...prev.chartColors[chart],
          [value]: color
        }
      }
    }));
  }, [isPremium]);

  const isHighlighted = useCallback((kpiId: string) => {
    return customization.highlightedKPIs.has(kpiId);
  }, [customization.highlightedKPIs]);

  return {
    customization,
    toggleHighlight,
    setChartColor,
    isHighlighted,
    getChartColors: (chart: string) => customization.chartColors[chart]
  };
};