import React from 'react';
import type { QuadrantStatistics, QuadrantType } from '../../types';
import BarChart from '../BarChart';
import type { BarChartData } from '../BarChart';

interface QuadrantDetailsProps {
  quadrant: QuadrantType;
  stats: QuadrantStatistics;
  isPremium: boolean;
  satisfactionScale: string;
  loyaltyScale: string;
}

export const QuadrantDetails: React.FC<QuadrantDetailsProps> = ({
  quadrant,
  stats,
  isPremium,
  satisfactionScale,
  loyaltyScale
}) => {
  const quadrantColors = {
    loyalists: 'border-green-200 bg-green-50',
    hostages: 'border-blue-200 bg-blue-50',
    mercenaries: 'border-yellow-200 bg-yellow-50',
    defectors: 'border-red-200 bg-red-50'
  };

  const quadrantTitles = {
    loyalists: 'Loyalists Analysis',
    hostages: 'Hostages Analysis',
    mercenaries: 'Mercenaries Analysis',
    defectors: 'Defectors Analysis'
  };

  // Transform distribution data to BarChart format
  const transformData = (distribution: Record<number, number>, maxValue: number): BarChartData[] => {
    return Array.from({ length: maxValue }, (_, i) => ({
      value: i + 1,
      count: distribution[i + 1] || 0
    }));
  };

  // Helper function to safely find the most common score
  const getMostCommonScore = (distribution: Record<number, number>): string => {
    const entries = Object.entries(distribution);
    if (entries.length === 0) return 'N/A';
    
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'N/A';
  };

  return (
    <div className={`p-6 border-2 rounded-lg ${quadrantColors[quadrant]}`}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{quadrantTitles[quadrant]}</h3>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.count}</div>
            <div className="text-sm text-gray-600">{stats.percentage.toFixed(1)}% of total</div>
          </div>
        </div>

        {/* Distribution Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Satisfaction Distribution */}
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <h4 className="font-medium">Satisfaction</h4>
              <span className="text-lg font-semibold">
                {stats.satisfaction.average.toFixed(2)}
              </span>
            </div>
            <BarChart
              data={transformData(stats.satisfaction.distribution, parseInt(satisfactionScale.split('-')[1]))}
              showGrid={false}
              showLabels={true}
              interactive={isPremium}
              chartType="mini"
            />
          </div>

          {/* Loyalty Distribution */}
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <h4 className="font-medium">Loyalty</h4>
              <span className="text-lg font-semibold">
                {stats.loyalty.average.toFixed(2)}
              </span>
            </div>
            <BarChart
              data={transformData(stats.loyalty.distribution, parseInt(loyaltyScale.split('-')[1]))}
              showGrid={false}
              showLabels={true}
              interactive={isPremium}
              chartType="mini"
            />
          </div>
        </div>

        {/* Key Findings */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium mb-3">Key Findings</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Most Common Satisfaction Score:</span>
              <span className="font-medium">
                {getMostCommonScore(stats.satisfaction.distribution)}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Most Common Loyalty Score:</span>
              <span className="font-medium">
                {getMostCommonScore(stats.loyalty.distribution)}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Distribution Pattern:</span>
              <span className="font-medium">
                {stats.satisfaction.average > stats.loyalty.average 
                  ? 'Higher Satisfaction' 
                  : 'Higher Loyalty'}
              </span>
            </li>
            {isPremium && (
              <li className="flex justify-between">
                <span>Score Correlation:</span>
                <span className="font-medium">
                  {Math.abs(stats.satisfaction.average - stats.loyalty.average) < 0.5 
                    ? 'Strong' 
                    : 'Weak'}
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Group Insights */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium mb-3">Group Insights</h4>
          <div className="space-y-3 text-sm">
            <p>
              {quadrant === 'loyalists' && 'Consistently positive across both metrics'}
              {quadrant === 'hostages' && 'High loyalty despite low satisfaction'}
              {quadrant === 'mercenaries' && 'Satisfied but prone to switching'}
              {quadrant === 'defectors' && 'Critical improvement area needed'}
            </p>
            {isPremium && (
              <p className="text-gray-600">
                Trend shows {stats.percentage > 25 ? 'significant' : 'moderate'} 
                {' '}presence in this quadrant.
              </p>
            )}
          </div>
        </div>

        {/* Premium Features */}
        {isPremium && (
          <div className="pt-4 border-t border-gray-200">
            <button className="text-sm text-gray-600 hover:text-gray-900">
              Customize Analysis →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuadrantDetails;