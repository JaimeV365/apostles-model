# Historical Analysis Technical Implementation Guide

## Component Architecture

### New Components
```
src/components/historical/
├── HistoricalReport/
│   ├── TimelineView/
│   │   ├── CustomerTimeline.tsx
│   │   └── PopulationTimeline.tsx
│   ├── CohortAnalysis/
│   │   ├── CohortComparison.tsx
│   │   └── CohortDetails.tsx
│   ├── BehavioralAnalysis/
│   │   ├── BehaviorComparison.tsx
│   │   └── BehaviorDetails.tsx
│   └── SignificanceIndicators/
│       ├── ChangeIndicator.tsx
│       └── ConfidenceLevel.tsx
├── HistoricalControls/
│   ├── TimeRangeSelector.tsx
│   ├── CohortSelector.tsx
│   └── ComparisonControls.tsx
└── HistoricalVisualizations/
    ├── MovementFlow.tsx
    ├── TrendChart.tsx
    └── ComparisonMatrix.tsx
```

### Modified Components
```
src/components/
├── data-entry/
│   ├── DataEntryModule.tsx      // Add date handling
│   ├── forms/
│   │   ├── CSVImport.tsx        // Update for historical data
│   │   └── DataInput.tsx        // Add date field
│   └── table/
│       └── DataDisplay.tsx      // Add date column
├── visualization/
│   └── QuadrantChart.tsx        // Add time filters
└── reporting/
    ├── DataReport.tsx           // Add historical context
    └── ActionsReport.tsx        // Add trend-based actions
```

## Data Flow Architecture

### Historical Data Flow
```typescript
interface HistoricalDataFlow {
  // Data Input
  input: {
    manual: DataPoint;
    csv: DataPoint[];
    validation: ValidationResult;
  };

  // Processing
  processing: {
    emailNormalization: string;
    dateNormalization: Date;
    customerMatching: CustomerMatch[];
    movementAnalysis: MovementAnalysis;
  };

  // Storage
  storage: {
    dataPoints: DataPoint[];
    customerTimelines: Timeline[];
    analysisCache: AnalysisCache;
  };

  // Output
  output: {
    visualizations: VisualizationData;
    reports: ReportData;
    actions: ActionRecommendations;
  };
}
```

## Implementation Strategy

### Phase 1: Data Structure Updates

1. Update Base Types
```typescript
// src/types/base.ts
export interface DataPoint {
  id: string;
  name: string;
  email?: string;
  timestamp: Date;
  satisfaction: number;
  loyalty: number;
  group: string;
  excluded?: boolean;
  actualBehavior?: ActualBehavior;
}

export interface ActualBehavior {
  didRecommend?: boolean;
  didRepurchase?: boolean;
  date?: Date;
}
```

2. Update Storage Manager
```typescript
// src/utils/storageManager.ts
class StorageManager {
  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  private normalizeDate(date: Date | string): Date {
    return new Date(date);
  }

  async saveDataPoint(point: DataPoint): Promise<void> {
    const normalized = {
      ...point,
      email: point.email ? this.normalizeEmail(point.email) : undefined,
      timestamp: this.normalizeDate(point.timestamp)
    };
    // Storage logic
  }
}
```

### Phase 2: Analysis Implementation

1. Movement Analysis
```typescript
// src/utils/movementAnalysis.ts
export class MovementAnalyzer {
  analyzeMovement(
    previousPoint: DataPoint,
    currentPoint: DataPoint
  ): Movement {
    return {
      type: this.getMovementType(previousPoint, currentPoint),
      magnitude: this.calculateMagnitude(previousPoint, currentPoint),
      significance: this.assessSignificance(previousPoint, currentPoint)
    };
  }

  private assessSignificance(
    prev: DataPoint,
    curr: DataPoint
  ): SignificanceLevel {
    const change = Math.abs(curr.satisfaction - prev.satisfaction) +
                  Math.abs(curr.loyalty - prev.loyalty);
    
    if (change > 2) return 'high';
    if (change > 1) return 'medium';
    return 'low';
  }
}
```

2. Cohort Analysis
```typescript
// src/utils/cohortAnalysis.ts
export class CohortAnalyzer {
  analyzeCohorts(
    previousPeriod: DataPoint[],
    currentPeriod: DataPoint[]
  ): CohortAnalysis {
    const retained = this.getRetainedCustomers(
      previousPeriod,
      currentPeriod
    );
    
    return {
      retained: this.analyzeRetained(retained),
      new: this.analyzeNew(currentPeriod, retained),
      lost: this.analyzeLost(previousPeriod, retained)
    };
  }
}
```

### Phase 3: Visualization Implementation

1. Timeline Chart
```typescript
// src/components/historical/TimelineChart.tsx
const TimelineChart: React.FC<TimelineProps> = ({
  customerTimeline,
  showConfidence = false
}) => {
  return (
    <LineChart
      data={customerTimeline}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <Line
        type="monotone"
        dataKey="satisfaction"
        stroke="#8884d8"
        activeDot={{ r: 8 }}
      />
      <Line
        type="monotone"
        dataKey="loyalty"
        stroke="#82ca9d"
        activeDot={{ r: 8 }}
      />
      {showConfidence && (
        <ConfidenceBands data={customerTimeline} />
      )}
    </LineChart>
  );
};
```

2. Movement Flow
```typescript
// src/components/historical/MovementFlow.tsx
const MovementFlow: React.FC<MovementFlowProps> = ({
  movements,
  timeRange
}) => {
  return (
    <Sankey
      data={movements}
      link={{ stroke: '#000000' }}
      node={{
        fill: '#8884d8',
        stroke: '#000000'
      }}
    />
  );
};
```

### Phase 4: Report Integration

1. Historical Report
```typescript
// src/components/reporting/HistoricalReport.tsx
const HistoricalReport: React.FC<HistoricalReportProps> = ({
  data,
  timeRange,
  isPremium
}) => {
  if (!isPremium) {
    return <PremiumFeaturePrompt feature="historical-analysis" />;
  }

  return (
    <div className="historical-report">
      <TimelineSection data={data} />
      <CohortSection data={data} />
      <BehaviorSection data={data} />
      <SignificanceSection data={data} />
    </div>
  );
};
```

2. Enhanced Actions Report
```typescript
// src/components/reporting/ActionsReport.tsx
const ActionsReport: React.FC<ActionsReportProps> = ({
  data,
  historical,
  isPremium
}) => {
  const recommendations = useMemo(() => {
    return generateRecommendations(data, historical);
  }, [data, historical]);

  return (
    <div className="actions-report">
      <CurrentActions actions={recommendations.current} />
      {isPremium && (
        <TrendBasedActions actions={recommendations.trending} />
      )}
    </div>
  );
};
```

## Testing Strategy

### Unit Tests
```typescript
// src/utils/__tests__/movementAnalysis.test.ts
describe('MovementAnalyzer', () => {
  it('correctly identifies significant changes', () => {
    const analyzer = new MovementAnalyzer();
    const result = analyzer.assessSignificance(
      { satisfaction: 4, loyalty: 4 },
      { satisfaction: 2, loyalty: 2 }
    );
    expect(result).toBe('high');
  });
});
```

### Integration Tests
```typescript
// src/components/historical/__tests__/HistoricalReport.test.tsx
describe('HistoricalReport', () => {
  it('integrates timeline and cohort analysis', async () => {
    const { container } = render(
      <HistoricalReport data={mockData} isPremium={true} />
    );
    
    expect(container).toHaveTextContent('Timeline Analysis');
    expect(container).toHaveTextContent('Cohort Analysis');
  });
});
```

## Performance Optimization

### Caching Strategy
```typescript
// src/utils/analysisCache.ts
class AnalysisCache {
  private cache: Map<string, CachedAnalysis>;
  private readonly TTL = 1000 * 60 * 5; // 5 minutes

  getCachedAnalysis(key: string): CachedAnalysis | null {
    const cached = this.cache.get(key);
    if (!cached || Date.now() - cached.timestamp > this.TTL) {
      return null;
    }
    return cached.analysis;
  }
}
```

### Data Structure Optimization
```typescript
// src/utils/dataStructures.ts
class TimelineIndex {
  private customerIndex: Map<string, DataPoint[]>;
  
  constructor(data: DataPoint[]) {
    this.buildIndex(data);
  }

  private buildIndex(data: DataPoint[]): void {
    this.customerIndex = new Map();
    for (const point of data) {
      if (!point.email) continue;
      
      const timeline = this.customerIndex.get(point.email) || [];
      timeline.push(point);
      timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      this.customerIndex.set(point.email, timeline);
    }
  }
}
```

## Security Considerations

### Data Protection
```typescript
// src/utils/security.ts
const sensitiveFields = ['email', 'name', 'actualBehavior'];

const sanitizeDataForExport = (data: DataPoint[]): SafeDataPoint[] => {
  return data.map(point => {
    const safe = { ...point };
    for (const field of sensitiveFields) {
      if (field in safe) {
        safe[field] = maskSensitiveData(safe[field]);
      }
    }
    return safe;
  });