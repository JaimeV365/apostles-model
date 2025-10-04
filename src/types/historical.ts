import { DataPoint, ScaleFormat } from './base';

export type QuadrantType = 'loyalists' | 'mercenaries' | 'hostages' | 'defectors' | 'apostles' | 'terrorists';

export interface HistoricalDataPoint extends DataPoint {
  timestamp: Date;
  actualBehavior?: {
    didRecommend: boolean;
    didRepurchase: boolean;
    date: Date;
  };
}

export interface CustomerTimeline {
  email: string;
  dataPoints: HistoricalDataPoint[];
  movements: QuadrantMovement[];
  significance: SignificanceAnalysis;
}

export interface QuadrantMovement {
  from: QuadrantType;
  to: QuadrantType;
  timestamp: Date;
  magnitude: number;
  significance: SignificanceLevel;
}

export type SignificanceLevel = 'high' | 'medium' | 'low';

export interface SignificanceAnalysis {
  satisfactionChange: number;
  loyaltyChange: number;
  overallSignificance: SignificanceLevel;
  details: string;
}

export interface HistoricalAnalysis {
  customerChanges: CustomerTimeline[];
  populationChanges: {
    period: DateRange;
    distributions: QuadrantDistribution[];
    movements: AggregateMovements;
    significance: SignificanceAnalysis;
  };
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface QuadrantDistribution {
  timestamp: Date;
  loyalists: number;
  mercenaries: number;
  hostages: number;
  defectors: number;
  apostles: number;
  terrorists: number;
}

export interface AggregateMovements {
  improved: number;      // Moved to better quadrant
  declined: number;      // Moved to worse quadrant
  stable: number;        // Stayed in same quadrant
  significant: number;   // Number of significant changes
}

export interface ThresholdConfig {
  satisfaction: number;
  loyalty: number;
  customThresholds?: {
    [key: string]: number;
  };
}

// Storage interfaces
export interface HistoricalState {
  dataPoints: HistoricalDataPoint[];
  analysis: HistoricalAnalysis | null;
  thresholds: ThresholdConfig;
  lastAnalysis: Date | null;
}

// Validation interfaces
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

// Analysis configuration
export interface AnalysisConfig {
  period: 'month' | 'quarter' | 'year';
  requireMultiplePoints: boolean;
  ignoreInsignificantChanges: boolean;
  thresholds: ThresholdConfig;
}