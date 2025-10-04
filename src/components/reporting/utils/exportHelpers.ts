import type { DataReport, ActionsReport, RecommendationSection } from '../types';

export const formatDataReportForExport = (report: DataReport): string => {
  const content = `
Data Report
Date: ${new Date(report.date).toLocaleDateString()}

Scales Used:
- Satisfaction: ${report.satisfactionScale}
- Loyalty: ${report.loyaltyScale}

Total Entries: ${report.totalEntries}
Excluded Entries: ${report.excludedEntries}

Statistics:
Satisfaction:
- Average: ${report.statistics.satisfaction.average}
- Median: ${report.statistics.satisfaction.median}
- Mode: ${report.statistics.satisfaction.mode}
- Max: ${report.statistics.satisfaction.max}
- Min: ${report.statistics.satisfaction.min}

Loyalty:
- Average: ${report.statistics.loyalty.average}
- Median: ${report.statistics.loyalty.median}
- Mode: ${report.statistics.loyalty.mode}
- Max: ${report.statistics.loyalty.max}
- Min: ${report.statistics.loyalty.min}

Distribution:
- Loyalists: ${report.distribution.loyalists}
- Defectors: ${report.distribution.defectors}
- Mercenaries: ${report.distribution.mercenaries}
- Hostages: ${report.distribution.hostages}
- Apostles: ${report.distribution.apostles}
- Near-Apostles: ${report.distribution.nearApostles}
`;
  return content;
};

export const formatActionsReportForExport = (report: ActionsReport): string => {
  const content = `
Actions Report
Date: ${new Date(report.date).toLocaleDateString()}

Priority Actions:
${report.priorityActions.map((action: string, index: number) => 
  `${index + 1}. ${action}`
).join('\n')}

Key Insights:
${report.insights.map((insight: string, index: number) => 
  `${index + 1}. ${insight}`
).join('\n')}

Recommendations:
${report.recommendations.map((rec: RecommendationSection) => `
Category: ${rec.category}
Meaning: ${rec.meaning}
Actions:
${rec.actions.map((action: string) => `- ${action}`).join('\n')}
`).join('\n')}
`;
  return content;
};

export const downloadAsFile = (content: string, filename: string, type: 'txt' | 'pdf' = 'txt') => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${type}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};