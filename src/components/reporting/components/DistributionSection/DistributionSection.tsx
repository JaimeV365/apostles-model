import React, { useMemo, useState, useEffect } from 'react';
import { DataPoint, ScaleFormat } from '../../../../types/base';
import type { QuadrantType } from '../../types';
import { useQuadrantAssignment } from '../../../visualization/context/QuadrantAssignmentContext';
import { Card } from '../../../ui/card';

import ProximityPointInfoBox from './ProximityPointInfoBox';
import QuadrantInfoBox from './QuadrantInfoBox';
import ProximityList from '../ProximityList';
import ProximityDisplayMenu, { ProximityDisplaySettings } from '../ProximityList/ProximityDisplayMenu';
import { EnhancedProximityClassifier } from '../../services/EnhancedProximityClassifier';
import './DistributionSection.css';

interface InsightCardProps {
  label: string;
  value: string | number;
  description?: string;
}

// Component for insight cards
const InsightCard: React.FC<InsightCardProps> = ({ label, value, description }) => (
  <div className="insight-card">
    <div className="insight-card-label">{label}</div>
    <div className="insight-card-value">{value}</div>
    {description && <div className="insight-card-description">{description}</div>}
  </div>
);

interface EdgeClickData {
  points: DataPoint[];
  position: { x: number; y: number };
  quadrant: string;
  proximityType: string;
}

interface DistributionSectionProps {
  distribution: Record<string, number>;
  total: number;
  isPremium: boolean;
  onQuadrantSelect?: (quadrant: QuadrantType) => void;
  onQuadrantMove: (fromIndex: number, toIndex: number) => void;
  data?: DataPoint[];
  satisfactionScale?: ScaleFormat;
  loyaltyScale?: ScaleFormat;
  isClassicModel?: boolean;
  showSpecialZones?: boolean;
  showNearApostles?: boolean;
  midpoint?: { sat: number; loy: number };
}

const DistributionSection: React.FC<DistributionSectionProps> = ({
  distribution,
  total,
  isPremium,
  onQuadrantSelect,
  onQuadrantMove,
  data = [],
  satisfactionScale = '1-5',
  loyaltyScale = '1-5',
  isClassicModel = true,
  showSpecialZones = false,
  showNearApostles = false,
  midpoint: externalMidpoint // Accept external midpoint
}) => {
  
  // DEBUG LOG:
  console.log('🎯 DistributionSection initialized:', {
  dataLength: data?.length,
  showSpecialZones,
  showNearApostles
});

  // Use authoritative midpoint from context to ensure consistency across sections
  // externalMidpoint is ignored to keep a single source of truth

  // State for selected points in main quadrant grid
  const [selectedQuadrantPoints, setSelectedQuadrantPoints] = useState<EdgeClickData | null>(null);
  // State for selected points in proximity chart
  
  // State for proximity display settings
  const [proximityDisplaySettings, setProximityDisplaySettings] = useState<ProximityDisplaySettings>({
    grouping: 'flat',
    showOpportunities: true,
    showWarnings: true,
    showEmptyCategories: false,
    highlightHighImpact: false,
    highImpactMethod: 'smart',
    sortBy: 'customerCount'
  });
  
  // Calculate quadrant distribution and get authoritative midpoint from context
  const { distribution: contextDistribution, getQuadrantForPoint, manualAssignments, midpoint, apostlesZoneSize, terroristsZoneSize } = useQuadrantAssignment();

// DEBUG: Check what getQuadrantForPoint returns for each customer
const customerAssignments = data.map(p => ({
  id: p.id || `${p.satisfaction}-${p.loyalty}`,
  satisfaction: p.satisfaction,
  loyalty: p.loyalty,
  assignedQuadrant: getQuadrantForPoint(p)
}));
console.log('🔍 DISTRIBUTION SECTION - Customer quadrant assignments:');
customerAssignments.forEach(customer => {
  console.log(`  Customer ${customer.id} (${customer.satisfaction},${customer.loyalty}) → ${customer.assignedQuadrant}`);
});

  // Use EnhancedProximityClassifier (same as ProximitySection)
console.log('🚨🚨🚨 DISTRIBUTION SECTION COMPONENT LOADED - THIS SHOULD APPEAR');
// FORCE CALCULATION - Remove useMemo to ensure execution
console.log('🔥🔥🔥 FORCING PROXIMITY ANALYSIS CALCULATION WITHOUT USEMEMO');
const proximityAnalysis = (() => {
  const timestamp = Date.now();
  console.log(`🚨🚨🚨🚨🚨 USEMEMO START - THIS MUST APPEAR - TIMESTAMP: ${timestamp}`);
  console.log('🚨🚨🚨 USEMEMO EXECUTING - COMPONENT IS RUNNING');
  console.log('🚨🚨🚨 DISTRIBUTION SECTION USEMEMO TRIGGERED - THIS SHOULD APPEAR IN LOGS:', {
    dataLength: data.length,
    satisfactionScale,
    loyaltyScale,
    midpoint,
    apostlesZoneSize,
    terroristsZoneSize,
    showSpecialZones,
    showNearApostles,
    mode: showNearApostles ? 'ALL_AREAS' : 'MAIN_AREAS',
    timestamp
  });
  
  // FORCE FRESH CALCULATION - Clear any potential cache
  console.log('🚨🚨🚨 FORCING FRESH PROXIMITY ANALYSIS CALCULATION');
  
  // Add dependency debugging
  console.log('🔍 USEMEMO DEPENDENCIES DEBUG:', {
    data: data.length,
    satisfactionScale,
    loyaltyScale,
    midpointSat: midpoint.sat,
    midpointLoy: midpoint.loy,
    getQuadrantForPoint: typeof getQuadrantForPoint,
    isPremium,
    showSpecialZones,
    showNearApostles,
    apostlesZoneSize,
    terroristsZoneSize,
    manualAssignments: manualAssignments.size
  });
  
  try {
  
  console.log('🔍 DISTRIBUTION SECTION: Creating EnhancedProximityClassifier with:', {
    dataLength: data.length,
    satisfactionScale,
    loyaltyScale,
    midpoint,
    apostlesZoneSize,
    terroristsZoneSize,
    showSpecialZones,
    showNearApostles
  });
  
  const enhancedClassifier = new EnhancedProximityClassifier(
    satisfactionScale,
    loyaltyScale,
    midpoint,
    apostlesZoneSize,
    terroristsZoneSize
  );

  console.log('🔥🔥🔥 DISTRIBUTION SECTION: About to call analyzeProximity...');
  console.log('🔥 THIS LOG SHOULD APPEAR BEFORE CALLING ENHANCED CLASSIFIER');
  console.log('🔥 USEMEMO IS DEFINITELY EXECUTING - TESTING');
  
  const result = enhancedClassifier.analyzeProximity(
    data,
    getQuadrantForPoint,
    isPremium,
    undefined,
    showSpecialZones,
    showNearApostles
  );
  
  console.log('🔍 DISTRIBUTION SECTION: EnhancedProximityClassifier result:', {
    loyalists_close_to_apostles: result.analysis.loyalists_close_to_apostles.customerCount,
    loyalists_close_to_near_apostles: result.analysis.loyalists_close_to_near_apostles.customerCount,
    defectors_close_to_terrorists: result.analysis.defectors_close_to_terrorists.customerCount,
    showSpecialZones: result.settings.showSpecialZones,
    mode: showNearApostles ? 'ALL_AREAS' : 'MAIN_AREAS'
  });
  
  console.log('🚨 DISTRIBUTION SECTION RETURNING RESULT:', result);
  
  return result;
  
  } catch (error) {
    console.error('🚨 ERROR in DistributionSection proximityAnalysis useMemo:', error);
    console.error('🚨 Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      dataLength: data.length,
      satisfactionScale,
      loyaltyScale,
      midpoint
    });
    
    // Return a fallback result to prevent the component from breaking
    return {
      analysis: {
        loyalists_close_to_mercenaries: { customerCount: 0, positionCount: 0, averageDistance: 0, riskLevel: 'LOW' as const, customers: [] },
        loyalists_close_to_hostages: { customerCount: 0, positionCount: 0, averageDistance: 0, riskLevel: 'LOW' as const, customers: [] },
        hostages_close_to_loyalists: { customerCount: 0, positionCount: 0, averageDistance: 0, riskLevel: 'LOW' as const, customers: [] },
        hostages_close_to_defectors: { customerCount: 0, positionCount: 0, averageDistance: 0, riskLevel: 'LOW' as const, customers: [] },
        defectors_close_to_mercenaries: { customerCount: 0, positionCount: 0, averageDistance: 0, riskLevel: 'LOW' as const, customers: [] },
        defectors_close_to_hostages: { customerCount: 0, positionCount: 0, averageDistance: 0, riskLevel: 'LOW' as const, customers: [] },
        mercenaries_close_to_loyalists: { customerCount: 0, positionCount: 0, averageDistance: 0, riskLevel: 'LOW' as const, customers: [] },
        mercenaries_close_to_defectors: { customerCount: 0, positionCount: 0, averageDistance: 0, riskLevel: 'LOW' as const, customers: [] },
        loyalists_close_to_apostles: { customerCount: 0, positionCount: 0, averageDistance: 0, riskLevel: 'LOW' as const, customers: [] },
        loyalists_close_to_near_apostles: { customerCount: 0, positionCount: 0, averageDistance: 0, riskLevel: 'LOW' as const, customers: [] },
        defectors_close_to_terrorists: { customerCount: 0, positionCount: 0, averageDistance: 0, riskLevel: 'LOW' as const, customers: [] }
      },
      summary: { totalCustomers: 0, totalProximityCustomers: 0, totalProximityPositions: 0 },
      settings: { isAvailable: false, totalCustomers: 0 }
    };
  }
})(); // Execute immediately without useMemo

console.log('🔍 DISTRIBUTION SECTION proximityAnalysis result:', {
  loyalists_close_to_mercenaries: proximityAnalysis?.analysis?.loyalists_close_to_mercenaries?.customerCount,
  isAvailable: proximityAnalysis?.settings?.isAvailable,
  totalCustomers: proximityAnalysis?.settings?.totalCustomers
});

// Extra diagnostics: log full proximity analysis counts used by edges
// (debug) edge counts available from service; keep commented for future diagnostics
// console.log('EDGE COUNTS (service-based):', proximityAnalysis?.analysis);

  // Handle edge clicks - simple implementation
  const handleEdgeClick = (event: React.MouseEvent, quadrant: string, proximityType: string) => {
  event.stopPropagation();
  event.preventDefault(); // Prevent any default behavior
  
  if (validData.length === 0) {
    console.log('🚫 Edge click blocked: no data available');
    return;
  }
  
  console.log('🔍 Edge clicked:', { quadrant, proximityType });
  
  // Get proximity customers from the analysis
  let proximityCustomers: DataPoint[] = [];
  const proximityKey = `${quadrant}_close_to_${proximityType}`;
  
  console.log(`🔍 Looking for proximity key: ${proximityKey}`);
  console.log(`🔍 Available proximity keys:`, Object.keys(proximityAnalysis?.analysis || {}));
  
  if (proximityAnalysis?.analysis && proximityKey in proximityAnalysis.analysis) {
    const proximityDetail = proximityAnalysis.analysis[proximityKey as keyof typeof proximityAnalysis.analysis];
    
    console.log(`🔍 Found proximity detail for ${proximityKey}:`, proximityDetail);
    
    if (proximityDetail && 'customers' in proximityDetail && proximityDetail.customers) {
      // Convert CustomerProximityDetail objects directly to DataPoint objects
      // instead of trying to look them up in the original data array
      proximityCustomers = proximityDetail.customers.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email || '',
        satisfaction: customer.satisfaction,
        loyalty: customer.loyalty,
        // Include any additional properties that might be needed
        ...customer
      })) as DataPoint[];
      
      console.log(`🔍 Retrieved ${proximityCustomers.length} customers for ${proximityKey}:`, 
        proximityCustomers.map(c => `${c.id} at (${c.satisfaction},${c.loyalty})`));
    } else {
      console.log(`🔍 No customers found in proximity detail for ${proximityKey}`);
    }
  } else {
    console.log(`🔍 Proximity key ${proximityKey} not found in analysis`);
  }
  
  console.log('🔍 Found proximity customers:', proximityCustomers.length);
  
  // Set selected points for info box display (using main quadrant state)
  setSelectedQuadrantPoints({
    points: proximityCustomers,
    position: {
      x: event.clientX,
      y: event.clientY
    },
    quadrant: quadrant,
    proximityType: proximityType
  });
};

  console.log('🚨 DISTRIBUTION SECTION PROXIMITY CALCULATIONS:', {
  loyalists_near_mercenaries: proximityAnalysis?.analysis?.loyalists_close_to_mercenaries?.customerCount || 0,
  loyalists_near_hostages: proximityAnalysis?.analysis?.loyalists_close_to_hostages?.customerCount || 0,
  hostages_near_loyalists: proximityAnalysis?.analysis?.hostages_close_to_loyalists?.customerCount || 0,
  hostages_near_defectors: proximityAnalysis?.analysis?.hostages_close_to_defectors?.customerCount || 0
});

// Use context distribution directly - it already handles all layering correctly
const calculatedDistribution = useMemo(() => {
  return {
    loyalists: contextDistribution.loyalists || 0,
    mercenaries: contextDistribution.mercenaries || 0,
    hostages: contextDistribution.hostages || 0,
    defectors: contextDistribution.defectors || 0,
    apostles: contextDistribution.apostles || 0,
    terrorists: contextDistribution.terrorists || 0,
    nearApostles: contextDistribution.near_apostles || 0
  };
}, [contextDistribution]);

// DEBUG: Log the context distribution (should now be used directly)
console.log('🔍 DISTRIBUTION USING CONTEXT DIRECTLY:', {
  showSpecialZones,
  showNearApostles,
  contextDistribution: {
    loyalists: contextDistribution.loyalists,
    apostles: contextDistribution.apostles,
    near_apostles: contextDistribution.near_apostles,
    terrorists: contextDistribution.terrorists,
    mercenaries: contextDistribution.mercenaries,
    hostages: contextDistribution.hostages,
    defectors: contextDistribution.defectors
  },
  finalDistribution: {
    loyalists: calculatedDistribution.loyalists,
    apostles: calculatedDistribution.apostles,
    nearApostles: calculatedDistribution.nearApostles,
    terrorists: calculatedDistribution.terrorists
  }
});
  
  // Total count of points in all quadrants (excluding special zones)
  const calculatedTotal = useMemo(() => {
    if (!data || data.length === 0) {
      return total; // Use provided total if no data
    }
    
    return data.filter(point => !point.excluded).length;
  }, [data, total]);
  
  // Always use the context-based distribution - it's the source of truth
const effectiveDistribution = calculatedDistribution;
  const effectiveTotal = data && data.length > 0 ? calculatedTotal : total;

  // Calculate percentages for each quadrant
  const calculatePercentage = (value: number): string => {
    return ((value / Math.max(1, effectiveTotal)) * 100).toFixed(1);
  };

  // Intelligence data based on distribution
  const insightsData = useMemo(() => {
    const quadrantValues = [
      { type: 'loyalists', value: effectiveDistribution.loyalists || 0 },
      { type: 'hostages', value: effectiveDistribution.hostages || 0 },
      { type: 'mercenaries', value: effectiveDistribution.mercenaries || 0 },
      { type: 'defectors', value: effectiveDistribution.defectors || 0 }
    ];
    
    // Sort quadrants by value (descending)
    const sortedQuadrants = [...quadrantValues].sort((a, b) => b.value - a.value);
    
    // Find largest group(s) - handle ties by collecting all with the max value
    const maxValue = sortedQuadrants[0].value;
    const largestGroups = quadrantValues.filter(q => q.value === maxValue);
    const largestGroupNames = largestGroups.map(g => 
      g.type.charAt(0).toUpperCase() + g.type.slice(1)
    ).join(', ');
    
    // Get second largest if it exists and is different from largest
    const secondLargest = sortedQuadrants.length > 1 && sortedQuadrants[1].value < maxValue 
      ? sortedQuadrants[1] 
      : null;
    
    // Create description for largest group
    let largestGroupDesc = `${maxValue} respondents`;
    if (secondLargest) {
      largestGroupDesc += ` (${secondLargest.type.charAt(0).toUpperCase() + secondLargest.type.slice(1)}: ${secondLargest.value})`;
    }
    
    // Calculate balance (even distribution vs concentrated)
    const totalQuadrantPoints = quadrantValues.reduce((sum, current) => sum + current.value, 0);
    const evenDistribution = totalQuadrantPoints / 4;
    const distributionDifference = quadrantValues.reduce(
      (sum, current) => sum + Math.abs(current.value - evenDistribution), 
      0
    );
    const distributionBalance = distributionDifference > totalQuadrantPoints / 2 
      ? 'Unbalanced' 
      : 'Balanced';
    
    // Create description for distribution balance
    const balanceDesc = distributionBalance === 'Unbalanced'
      ? `${Math.round((distributionDifference / totalQuadrantPoints) * 100)}% variance from even distribution`
      : 'Responses are evenly distributed across quadrants';
    
    // Calculate satisfaction and loyalty trends
    const satisfactionWeight = (effectiveDistribution.loyalists || 0) + (effectiveDistribution.mercenaries || 0);
    const loyaltyWeight = (effectiveDistribution.loyalists || 0) + (effectiveDistribution.hostages || 0);
    
    const satisfactionTrend = satisfactionWeight > totalQuadrantPoints / 2 ? 'Positive' : 'Negative';
    const loyaltyTrend = loyaltyWeight > totalQuadrantPoints / 2 ? 'Strong' : 'Weak';
    
    // Create descriptions for trends
    const satPercent = totalQuadrantPoints > 0 
      ? Math.round((satisfactionWeight / totalQuadrantPoints) * 100) 
      : 0;
    const loyPercent = totalQuadrantPoints > 0 
      ? Math.round((loyaltyWeight / totalQuadrantPoints) * 100) 
      : 0;
    
    const satDesc = `${satPercent}% of responses have high satisfaction`;
    const loyDesc = `${loyPercent}% of responses have high loyalty`;
    
    return [
      { 
        label: 'Largest Group', 
        value: largestGroupNames, 
        description: largestGroupDesc 
      },
      { 
        label: 'Distribution Balance', 
        value: distributionBalance, 
        description: balanceDesc 
      },
      { 
        label: 'Satisfaction Trend', 
        value: satisfactionTrend, 
        description: satDesc 
      },
      { 
        label: 'Loyalty Trend', 
        value: loyaltyTrend, 
        description: loyDesc 
      }
    ];
  }, [effectiveDistribution, effectiveTotal]);

  // Data for special groups section
  const specialGroupsData = [
  { 
    title: isClassicModel ? 'Apostles' : 'Advocates', 
    value: effectiveDistribution.apostles || 0,
    percentage: calculatePercentage(effectiveDistribution.apostles || 0),
    type: 'apostles'
  },
  { 
    title: isClassicModel ? 'Terrorists' : 'Trolls', 
    value: effectiveDistribution.terrorists || 0,
    percentage: calculatePercentage(effectiveDistribution.terrorists || 0),
    type: 'terrorists'
  }
];

// near-apostles if enabled (show even if 0 count)
if (showNearApostles) {
  specialGroupsData.splice(1, 0, {
    title: isClassicModel ? 'Near-Apostles' : 'Near-Advocates', 
    value: effectiveDistribution.nearApostles || 0,
    percentage: calculatePercentage(effectiveDistribution.nearApostles || 0),
    type: 'near_apostles'
  });
}

console.log('🔍 Special Groups Debug:', {
  showNearApostles,
  apostles: effectiveDistribution.apostles,
  near_apostles: effectiveDistribution.nearApostles,
  terrorists: effectiveDistribution.terrorists,
  totalSpecial: (effectiveDistribution.apostles || 0) + (showNearApostles ? (effectiveDistribution.nearApostles || 0) : 0) + (effectiveDistribution.terrorists || 0)
});
console.log('🔍 Full Distribution Object:', distribution);
console.log('🔍 Effective Distribution:', effectiveDistribution);

  // Filter out any excluded data points
  const validData = useMemo(() => {
    return data.filter(point => !point.excluded);
  }, [data]);

  // Get quadrant for a point based on coordinates
  // Note: getQuadrantForPoint is already available from the context above

// We're now using the context's getQuadrantForPoint function
const getPointQuadrant = (point: DataPoint): string => {
  return getQuadrantForPoint(point);
};

  // Handle quadrant clicks in quadrant distribution
  const handleQuadrantClick = (quadrant: string, value: number, event: React.MouseEvent) => {
    if (value === 0) return; // Don't do anything if quadrant is empty
    
    // Get the exact click coordinates for positioning
    const clickX = event.clientX;
    const clickY = event.clientY;
    
    // Filter data points belonging to this quadrant
    const pointsInQuadrant = validData.filter(point => {
      return getPointQuadrant(point) === quadrant;
    });
    
    console.log(`Quadrant ${quadrant} clicked, found ${pointsInQuadrant.length} points, value is ${value}`);
    
    // Set selectedQuadrantPoints even if the array is empty
    setSelectedQuadrantPoints({
      points: pointsInQuadrant,
      position: {
        x: clickX,
        y: clickY
      },
      quadrant,
      proximityType: ''
    });
    
    // Still call the onQuadrantSelect callback if provided
    if (onQuadrantSelect && quadrant as QuadrantType) {
      onQuadrantSelect(quadrant as QuadrantType);
    }
  };

  // Handle proximity display settings changes
  const handleProximitySettingsChange = (newSettings: ProximityDisplaySettings) => {
    setProximityDisplaySettings(newSettings);
  };

  const handleProximitySettingsReset = () => {
    setProximityDisplaySettings({
      grouping: 'flat',
      showOpportunities: true,
      showWarnings: true,
      showEmptyCategories: false,
      highlightHighImpact: false,
      highImpactMethod: 'smart',
      sortBy: 'customerCount'
    });
  };

  return (
  <div className="distribution-container">
        <h2 className="distribution-title">Quadrant Distribution</h2>
        
        <div className="distribution-grid">
          {/* First Pair: Quadrant Distribution + Distribution Insights */}
          <div className="distribution-pair">
            {/* Quadrant Distribution */}
            <div className="pair-item">
              <Card className="distribution-card">
                <h3 className="card-title">Quadrant Distribution</h3>
                <div className="quadrant-grid" style={{ position: 'relative' }}>
                  <div 
  className={`draggable-quadrant hostages`}
  onClick={(e: React.MouseEvent) => handleQuadrantClick('hostages', effectiveDistribution.hostages || 0, e)}
  data-clickable={effectiveDistribution.hostages > 0 ? "true" : "false"}
>
  <div className="quadrant-title">Hostages</div>
  <div className="quadrant-value">{effectiveDistribution.hostages || 0}</div>
  <div className="quadrant-subtext">({(((effectiveDistribution.hostages || 0) / Math.max(1, effectiveTotal)) * 100).toFixed(1)}%)</div>
  {(effectiveDistribution.hostages || 0) > 0 && (
    <div className="premium-hint">Click for details</div>
  )}
</div>
                  <div 
  className={`draggable-quadrant loyalists`}
  onClick={(e: React.MouseEvent) => handleQuadrantClick('loyalists', effectiveDistribution.loyalists, e)}
  data-clickable={effectiveDistribution.loyalists > 0 ? "true" : "false"}
>
  <div className="quadrant-title">Loyalists</div>
  <div className="quadrant-value">{effectiveDistribution.loyalists}</div>
  <div className="quadrant-subtext">({calculatePercentage(effectiveDistribution.loyalists)}%)</div>
  {effectiveDistribution.loyalists > 0 && (
    <div className="premium-hint">Click for details</div>
  )}
</div>

<div 
  className={`draggable-quadrant defectors`}
  onClick={(e: React.MouseEvent) => handleQuadrantClick('defectors', effectiveDistribution.defectors, e)}
  data-clickable={effectiveDistribution.defectors > 0 ? "true" : "false"}
>
  <div className="quadrant-title">Defectors</div>
  <div className="quadrant-value">{effectiveDistribution.defectors}</div>
  <div className="quadrant-subtext">({calculatePercentage(effectiveDistribution.defectors)}%)</div>
  {effectiveDistribution.defectors > 0 && (
    <div className="premium-hint">Click for details</div>
  )}
</div>
                  <div 
  className={`draggable-quadrant mercenaries`}
  onClick={(e: React.MouseEvent) => handleQuadrantClick('mercenaries', effectiveDistribution.mercenaries || 0, e)}
  data-clickable={effectiveDistribution.mercenaries > 0 ? "true" : "false"}
>
  <div className="quadrant-title">Mercenaries</div>
  <div className="quadrant-value">{effectiveDistribution.mercenaries || 0}</div>
  <div className="quadrant-subtext">({(((effectiveDistribution.mercenaries || 0) / Math.max(1, effectiveTotal)) * 100).toFixed(1)}%)</div>
  {(effectiveDistribution.mercenaries || 0) > 0 && (
    <div className="premium-hint">Click for details</div>
  )}
</div>
                  
                  {selectedQuadrantPoints && (
                    <ProximityPointInfoBox
                      points={selectedQuadrantPoints.points}
                      position={selectedQuadrantPoints.position}
                      quadrant={selectedQuadrantPoints.quadrant}
                      proximityType={selectedQuadrantPoints.proximityType}
                      onClose={() => setSelectedQuadrantPoints(null)}
                    />
                  )}
                </div>
              </Card>
            </div>

            {/* Distribution Insights */}
            <div className="pair-item">
              <Card className="distribution-card">
                <h3 className="card-title">Distribution Insights</h3>
                <div className="insights-grid">
                  {insightsData.map((insight, index) => (
                    <InsightCard 
                      key={index} 
                      label={insight.label} 
                      value={insight.value}
                      description={insight.description}
                    />
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Second Pair: Special Groups + Special Groups Insights */}
          {showSpecialZones && (
            <div className="distribution-pair">
              {/* Special Groups */}
              <div className="pair-item">
                <Card className="distribution-card">
                  <h3 className="card-title">Quadrant Distribution: Special Groups</h3>
                  <div className="special-groups-grid">
                    {specialGroupsData.map((group, index) => (
                      <div 
                        key={index} 
                        className={`special-group ${group.type}`}
                      >
                        <h4 className="special-group-title">{group.title}</h4>
                        <div className="special-group-value">{group.value}</div>
                        <div className="special-group-percentage">{group.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Special Groups Insights */}
              <div className="pair-item">
                <Card className="distribution-card">
                  <h3 className="card-title">Quadrant Distribution: Special Groups Insights</h3>
                  <div className="insights-grid">
                    <div className="insight-card">
                      <div className="insight-card-label">Total Special</div>
                      <div className="insight-card-value">
            {((effectiveDistribution.apostles || 0) + (showNearApostles ? (effectiveDistribution.nearApostles || 0) : 0)) + (effectiveDistribution.terrorists || 0)}
          </div>
          <div className="insight-card-description">
            {(((((effectiveDistribution.apostles || 0) + (showNearApostles ? (effectiveDistribution.nearApostles || 0) : 0)) + (effectiveDistribution.terrorists || 0)) / effectiveTotal * 100).toFixed(1))}% of total responses
          </div>
                    </div>
                    
                    <div className="insight-card">
                      <div className="insight-card-label">Dominant Special</div>
                      <div className="insight-card-value">
                        {(effectiveDistribution.apostles || 0) > (effectiveDistribution.terrorists || 0)
                          ? (isClassicModel ? 'Apostles' : 'Advocates')
                          : (isClassicModel ? 'Terrorists' : 'Trolls')
                        }
                      </div>
                      <div className="insight-card-description">
                        Larger special group
                      </div>
                    </div>
                    
                    <div className="insight-card">
                      <div className="insight-card-label">Special Balance</div>
                      <div className="insight-card-value">
                        {Math.abs((effectiveDistribution.apostles || 0) - (effectiveDistribution.terrorists || 0)) <= 1
                          ? 'Balanced'
                          : 'Unbalanced'
                        }
                      </div>
                      <div className="insight-card-description">
                        Special groups distribution
                      </div>
                    </div>
                    
                    <div className="insight-card">
                      <div className="insight-card-label">Special Significance</div>
                      <div className="insight-card-value">
            {(((effectiveDistribution.apostles || 0) + (showNearApostles ? (effectiveDistribution.nearApostles || 0) : 0)) + (effectiveDistribution.terrorists || 0)) > (effectiveTotal * 0.1)
              ? 'High'
              : 'Low'
            }
          </div>
          <div className="insight-card-description">
            {(((effectiveDistribution.apostles || 0) + (showNearApostles ? (effectiveDistribution.nearApostles || 0) : 0)) + (effectiveDistribution.terrorists || 0)) > (effectiveTotal * 0.1)
              ? 'Special zones are significant'
              : 'Special zones are minimal'
            }
          </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Third Pair: Proximity Distribution + Proximity Details */}
          <div className="distribution-pair">
            {/* Proximity Distribution */}
            <div className="pair-item">
              <Card className="distribution-card">
                <h3 className="card-title">Proximity Distribution</h3>
                {validData.length > 0 ? (
                  <div className="quadrant-grid" style={{ position: 'relative' }}>
                    {/* Hostages with proximity information */}
                    <div className="proximity-cell hostages">
                      <div className="quadrant-title">Hostages</div>
                      <div className="quadrant-value">
  {effectiveDistribution.hostages}
</div>
                      <div className="quadrant-subtext">
                        ({((validData.filter(p => 
                          p.satisfaction < midpoint.sat && 
                          p.loyalty >= midpoint.loy).length / validData.length) * 100).toFixed(1)}%)
                      </div>
                      
                      {/* Add proximity edge if there are points near Loyalists boundary (service-based) */}
                      {(proximityAnalysis?.analysis?.hostages_close_to_loyalists?.customerCount || 0) > 0 && (
                        <div 
                          className="proximity-edge right"
                          onClick={(e) => handleEdgeClick(e, 'hostages', 'loyalists')}
                        >
                          <span className="edge-count">
                            {proximityAnalysis?.analysis?.hostages_close_to_loyalists?.customerCount || 0}
                          </span>
                        </div>
                      )}
                      
                      {/* Add proximity edge if there are points near Defectors boundary (service-based) */}
                      {(proximityAnalysis?.analysis?.hostages_close_to_defectors?.customerCount || 0) > 0 && (
                        <div 
                          className="proximity-edge bottom"
                          onClick={(e) => handleEdgeClick(e, 'hostages', 'defectors')}
                        >
                          <span className="edge-count">
                            {proximityAnalysis?.analysis?.hostages_close_to_defectors?.customerCount || 0}
                          </span>
                        </div>
                      )}
                      
                      {/* Add proximity edge if there are hostages near Mercenaries boundary (diagonal) */}
                      {((proximityAnalysis?.analysis as any)?.hostages_close_to_mercenaries?.customerCount || 0) > 0 && (
                        <div 
                          className="proximity-edge bottom-right diagonal"
                          onClick={(e) => handleEdgeClick(e, 'hostages', 'mercenaries')}
                        >
                          <span className="edge-count">
                            {(proximityAnalysis?.analysis as any)?.hostages_close_to_mercenaries?.customerCount || 0}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Loyalists with proximity information */}
                    <div className="proximity-cell loyalists">
                      <div className="quadrant-title">Loyalists</div>
                      <div className="quadrant-value">
  {effectiveDistribution.loyalists + (effectiveDistribution.apostles || 0) + (effectiveDistribution.nearApostles || 0)}
</div>
                      <div className="quadrant-subtext">
                        ({((validData.filter(p => 
                          p.satisfaction >= midpoint.sat && 
                          p.loyalty >= midpoint.loy).length / validData.length) * 100).toFixed(1)}%)
                      </div>
                      
                      {/* Add proximity edge if there are loyalists near Mercenaries boundary */}
{(proximityAnalysis?.analysis?.loyalists_close_to_mercenaries?.customerCount || 0) > 0 && (
<div
className="proximity-edge bottom"
onClick={(e) => handleEdgeClick(e, 'loyalists', 'mercenaries')}
>
<span className="edge-count">
{proximityAnalysis?.analysis?.loyalists_close_to_mercenaries?.customerCount || 0}
</span>
</div>
)}
                      
                      {/* Add proximity edge if there are loyalists near Hostages boundary */}
{(proximityAnalysis?.analysis?.loyalists_close_to_hostages?.customerCount || 0) > 0 && (
  <div 
    className="proximity-edge left"
    onClick={(e) => handleEdgeClick(e, 'loyalists', 'hostages')}
  >
    <span className="edge-count">
      {proximityAnalysis?.analysis?.loyalists_close_to_hostages?.customerCount || 0}
    </span>
  </div>
)}
                      
                      {/* Add proximity edge if there are loyalists near Defectors boundary (diagonal) */}
                      {((proximityAnalysis?.analysis as any)?.loyalists_close_to_defectors?.customerCount || 0) > 0 && (
                        <div 
                          className="proximity-edge bottom-left diagonal"
                          onClick={(e) => handleEdgeClick(e, 'loyalists', 'defectors')}
                        >
                          <span className="edge-count">
                            {(proximityAnalysis?.analysis as any)?.loyalists_close_to_defectors?.customerCount || 0}
                          </span>
                        </div>
                      )}
                      
                      {/* Conditional display: Show loyalists close to apostles OR near-apostles based on setting */}
                      {showSpecialZones && !showNearApostles && 
                        (proximityAnalysis?.analysis?.loyalists_close_to_apostles?.customerCount || 0) > 0 && (
                          <div 
                            className="proximity-edge top-right special"
                            onClick={(e) => handleEdgeClick(e, 'loyalists', 'apostles')}
                          >
                            <span className="edge-count">
                              {proximityAnalysis?.analysis?.loyalists_close_to_apostles?.customerCount || 0}
                            </span>
                          </div>
                      )}
                      
                      {/* Show loyalists close to near-apostles when near-apostles is enabled (takes precedence) */}
                      {showNearApostles && 
                        (proximityAnalysis?.analysis?.loyalists_close_to_near_apostles?.customerCount || 0) > 0 && (
                          <div 
                            className="proximity-edge top-right special"
                            onClick={(e) => handleEdgeClick(e, 'loyalists', 'near_apostles')}
                          >
                            <span className="edge-count">
                              {proximityAnalysis?.analysis?.loyalists_close_to_near_apostles?.customerCount || 0}
                            </span>
                          </div>
                      )}
                    </div>
                    
                    {/* Defectors with proximity information */}
                    <div className="proximity-cell defectors">
                      <div className="quadrant-title">Defectors</div>
                      <div className="quadrant-value">
  {effectiveDistribution.defectors + (effectiveDistribution.terrorists || 0)}
</div>
                      <div className="quadrant-subtext">
                        ({((validData.filter(p => 
                          p.satisfaction < midpoint.sat && 
                          p.loyalty < midpoint.loy).length / validData.length) * 100).toFixed(1)}%)
                      </div>
                      
                      {/* Add proximity edge if there are points near Mercenaries boundary (service-based) */}
                      {(proximityAnalysis?.analysis?.defectors_close_to_mercenaries?.customerCount || 0) > 0 && (
                        <div 
                          className="proximity-edge right"
                          onClick={(e) => handleEdgeClick(e, 'defectors', 'mercenaries')}
                        >
                          <span className="edge-count">
                            {proximityAnalysis?.analysis?.defectors_close_to_mercenaries?.customerCount || 0}
                          </span>
                        </div>
                      )}
                      
                      {/* Add proximity edge if there are points near Hostages boundary (service-based) */}
                      {(proximityAnalysis?.analysis?.defectors_close_to_hostages?.customerCount || 0) > 0 && (
                        <div 
                          className="proximity-edge top"
                          onClick={(e) => handleEdgeClick(e, 'defectors', 'hostages')}
                        >
                          <span className="edge-count">
                            {proximityAnalysis?.analysis?.defectors_close_to_hostages?.customerCount || 0}
                          </span>
                        </div>
                      )}
                      
                      {/* Add proximity edge if there are defectors near Terrorists (special zone) */}
                      {showSpecialZones && 
                        (proximityAnalysis?.analysis?.defectors_close_to_terrorists?.customerCount || 0) > 0 && (
                          <div 
                            className="proximity-edge bottom-left special"
                            onClick={(e) => handleEdgeClick(e, 'defectors', 'terrorists')}
                          >
                            <span className="edge-count">
                              {proximityAnalysis?.analysis?.defectors_close_to_terrorists?.customerCount || 0}
                            </span>
                          </div>
                      )}
                      
                      {/* Add proximity edge if there are defectors near Loyalists boundary (diagonal) */}
                      {((proximityAnalysis?.analysis as any)?.defectors_close_to_loyalists?.customerCount || 0) > 0 && (
                        <div 
                          className="proximity-edge top-right diagonal"
                          onClick={(e) => handleEdgeClick(e, 'defectors', 'loyalists')}
                        >
                          <span className="edge-count">
                            {(proximityAnalysis?.analysis as any)?.defectors_close_to_loyalists?.customerCount || 0}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Mercenaries with proximity information */}
                    <div className="proximity-cell mercenaries">
                      <div className="quadrant-title">Mercenaries</div>
                      <div className="quadrant-value">
  {effectiveDistribution.mercenaries}
</div>
                      <div className="quadrant-subtext">
                        ({((validData.filter(p => 
                          p.satisfaction >= midpoint.sat && 
                          p.loyalty < midpoint.loy).length / validData.length) * 100).toFixed(1)}%)
                      </div>
                      
                      {/* Add proximity edge if there are points near Loyalists boundary (service-based) */}
                      {(proximityAnalysis?.analysis?.mercenaries_close_to_loyalists?.customerCount || 0) > 0 && (
                          <div 
                            className="proximity-edge top"
                            onClick={(e) => handleEdgeClick(e, 'mercenaries', 'loyalists')}
                          >
                            <span className="edge-count">
                              {proximityAnalysis?.analysis?.mercenaries_close_to_loyalists?.customerCount || 0}
                            </span>
                          </div>
                        )}
                        
                        {/* Add proximity edge if there are points near Defectors boundary (service-based) */}
                        {(proximityAnalysis?.analysis?.mercenaries_close_to_defectors?.customerCount || 0) > 0 && (
                          <div 
                            className="proximity-edge left"
                            onClick={(e) => handleEdgeClick(e, 'mercenaries', 'defectors')}
                          >
                            <span className="edge-count">
                              {proximityAnalysis?.analysis?.mercenaries_close_to_defectors?.customerCount || 0}
                            </span>
                          </div>
                        )}
                        
                        {/* Add proximity edge if there are mercenaries near Hostages boundary (diagonal) */}
                        {((proximityAnalysis?.analysis as any)?.mercenaries_close_to_hostages?.customerCount || 0) > 0 && (
                          <div 
                            className="proximity-edge top-left diagonal"
                            onClick={(e) => handleEdgeClick(e, 'mercenaries', 'hostages')}
                          >
                            <span className="edge-count">
                              {(proximityAnalysis?.analysis as any)?.mercenaries_close_to_hostages?.customerCount || 0}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="distribution-basic">
                      <p>Basic distribution only - proximity moved to separate section</p>
                    </div>
                  )}
                </Card>
              </div>
  
              {/* Proximity Details */}
              <div className="pair-item">
                <Card className="distribution-card">
                  <div style={{ 
                    width: '100%', 
                    marginBottom: '1rem', 
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '44px' /* Ensure adequate height for mobile touch targets */
                  }}>
                    <h3 className="card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0, flex: '1', minWidth: 0 }}>
                      Proximity Details
                    </h3>
                    {isPremium && (
                      <ProximityDisplayMenu
                        settings={proximityDisplaySettings}
                        onSettingsChange={handleProximitySettingsChange}
                        onReset={handleProximitySettingsReset}
                      />
                    )}
                  </div>
                  <div className="proximity-details-container">
                    <ProximityList
                      proximityAnalysis={proximityAnalysis}
                      totalCustomers={effectiveTotal}
                      isClassicModel={isClassicModel}
                      isPremium={isPremium}
                      displaySettings={proximityDisplaySettings}
                    />
                  </div>
                </Card>
              </div>
            </div>
            
            
          </div>
    </div>
  );
  };
  
  export default DistributionSection;