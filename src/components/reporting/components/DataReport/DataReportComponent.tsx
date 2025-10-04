import React, { useState, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card } from '../../../ui/card';
import { QuadrantDetails } from './QuadrantDetails';
import { StatisticsSection } from './StatisticsSection';
import { DistributionSection } from '../DistributionSection'; // Fixed import path
import type { DataReport, QuadrantType } from '../../types';
import { HighlightableKPI } from '../HighlightableKPI';

interface DataReportComponentProps {
  report: DataReport | null;
  isPremium?: boolean;
  isClassicModel?: boolean;
  onCustomize: (reportType: 'data') => void;
  onExport: (reportType: 'data') => void;
  onShare: (reportType: 'data') => void;
  originalData?: any[]; // Add originalData prop
}

const DataReportComponent: React.FC<DataReportComponentProps> = ({
  report,
  isPremium = false,
  isClassicModel = true,
  onCustomize,
  onExport,
  onShare,
  originalData = [] // Add default value
}) => {
  const [selectedQuadrant, setSelectedQuadrant] = useState<QuadrantType | null>(null);
  const [customColors, setCustomColors] = useState<Record<string, Record<number, string>>>({});

  const terminology = useMemo(() => ({
    apostles: isClassicModel ? 'Apostles' : 'Advocates',
    terrorists: isClassicModel ? 'Terrorists' : 'Trolls'
  }), [isClassicModel]);

  if (!report) return null;

  const handleColorChange = (metric: string, value: number, color: string) => {
    if (!isPremium) return;
    setCustomColors(prev => ({
      ...prev,
      [metric]: { 
        ...(prev[metric] || {}), 
        [value]: color 
      }
    }));
  };

  const handleQuadrantMove = (fromIndex: number, toIndex: number) => {
    if (!isPremium) return;
    setSelectedQuadrant(null);
  };

  const handleQuadrantSelect = (quadrant: QuadrantType) => {
    setSelectedQuadrant(currentQuadrant => 
      currentQuadrant === quadrant ? null : quadrant
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full space-y-6">
        {/* Basic Statistics */}
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stats-box p-4 rounded-lg bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-600">Total Entries</h4>
              <p className="text-2xl font-bold">{report.totalEntries}</p>
              {report.excludedEntries > 0 && (
                <p className="text-xs text-gray-500">
                  ({report.excludedEntries} excluded)
                </p>
              )}
            </div>
            <div className="stats-box p-4 rounded-lg bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-600">Identified</h4>
              <p className="text-2xl font-bold">{report.identifiedCount}</p>
              <p className="text-xs text-gray-500">
                ({((report.identifiedCount / report.totalEntries) * 100).toFixed(1)}%)
              </p>
            </div>
            <div className="stats-box p-4 rounded-lg bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-600">Anonymous</h4>
              <p className="text-2xl font-bold">{report.anonymousCount}</p>
              <p className="text-xs text-gray-500">
                ({((report.anonymousCount / report.totalEntries) * 100).toFixed(1)}%)
              </p>
            </div>
            {report.mostCommonCombos.length > 0 && (
              <div className="stats-box p-4 rounded-lg bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-600">Most Common</h4>
                <p className="text-xl font-bold">
                  ({report.mostCommonCombos[0].satisfaction}, 
                   {report.mostCommonCombos[0].loyalty})
                </p>
                <p className="text-xs text-gray-500">
                  {report.mostCommonCombos[0].percentage.toFixed(1)}% of total
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Distribution Charts */}
        <StatisticsSection 
          statistics={report.statistics}
          scales={{
            satisfaction: report.satisfactionScale,
            loyalty: report.loyaltyScale
          }}
          totalEntries={report.totalEntries}
          isPremium={isPremium}
        />

        {/* Quadrant Distribution */}
        <DistributionSection
          distribution={report.distribution}
          total={report.totalEntries}
          isPremium={isPremium}
          onQuadrantMove={handleQuadrantMove}
          onQuadrantSelect={handleQuadrantSelect}
          data={originalData}
          satisfactionScale={report.satisfactionScale}
          loyaltyScale={report.loyaltyScale}
          isClassicModel={isClassicModel}
          showSpecialZones={true}
        />

        {/* Quadrant Details */}
        {selectedQuadrant && (
          selectedQuadrant in report.quadrantStats && (
            <QuadrantDetails
              quadrant={selectedQuadrant}
              stats={report.quadrantStats[selectedQuadrant as keyof typeof report.quadrantStats]}
              isPremium={isPremium}
              satisfactionScale={report.satisfactionScale}
              loyaltyScale={report.loyaltyScale}
            />
          )
        )}

        {/* Special Groups */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Special Groups</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <h4 className="font-semibold">{terminology.apostles}</h4>
              <p className="text-2xl font-bold">{report.distribution.apostles}</p>
              <p className="text-sm text-gray-600">
                {((report.distribution.apostles / report.totalEntries) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <h4 className="font-semibold">{terminology.terrorists}</h4>
              <p className="text-2xl font-bold">{report.distribution.terrorists}</p>
              <p className="text-sm text-gray-600">
                {((report.distribution.terrorists / report.totalEntries) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button 
            onClick={() => onCustomize('data')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Customize
          </button>
          <button 
            onClick={() => onExport('data')}
            className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
          >
            Export
          </button>
          <button 
            onClick={() => onShare('data')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Share
          </button>
        </div>
      </div>
    </DndProvider>
  );
};

export default DataReportComponent;