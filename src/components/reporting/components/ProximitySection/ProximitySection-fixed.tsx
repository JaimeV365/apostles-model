// src/components/reporting/components/ProximitySection/ProximitySection.tsx

import React, { useMemo, useEffect } from 'react';
import { DataPoint, ScaleFormat } from '../../../../types/base';
import { useQuadrantAssignment } from '../../../visualization/context/QuadrantAssignmentContext';
import { EnhancedProximityClassifier } from '../../services/EnhancedProximityClassifier';
import { Card } from '../../../ui/card';
import './ProximitySection.css';

interface ProximitySectionProps {
  data: DataPoint[];
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  isPremium: boolean;
  showSpecialZones?: boolean;
  showNearApostles?: boolean;
}

const ProximitySection: React.FC<ProximitySectionProps> = ({
  data,
  satisfactionScale,
  loyaltyScale,
  isPremium,
  showSpecialZones = false,
  showNearApostles = false
}) => {
  
  // ✅ FIXED: Connect to QuadrantAssignmentContext - single source of truth (same as DistributionSection)
  const { 
    getQuadrantForPoint, 
    distribution: contextDistribution, 
    midpoint,
    getDisplayNameForQuadrant,
    manualAssignments,
    apostlesZoneSize,
    terroristsZoneSize
  } = useQuadrantAssignment();

  console.log('🎯 ProximitySection: Using context distribution:', contextDistribution);

  // ✅ Calculate total customers from context distribution FIRST
  const totalCustomersFromContext = contextDistribution.loyalists + 
                                   contextDistribution.mercenaries + 
                                   contextDistribution.hostages + 
                                   contextDistribution.defectors +
                                   (contextDistribution.apostles || 0) +
                                   (contextDistribution.terrorists || 0) +
                                   (contextDistribution.near_apostles || 0);

  console.log('🔍 Context distribution totals:', {
    loyalists: contextDistribution.loyalists,
    apostles: contextDistribution.apostles,
    total_loyalist_area: contextDistribution.loyalists + (contextDistribution.apostles || 0),
    totalFromContext: totalCustomersFromContext
  });

  // DEBUG: Let's manually count what getQuadrantForPoint assigns
  const manualCounts = useMemo(() => {
    const counts = data.filter(point => !point.excluded).reduce((acc, point) => {
      const quadrant = getQuadrantForPoint(point);
      acc[quadrant] = (acc[quadrant] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalFromManual = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    console.log('🔍 MANUAL COUNT from getQuadrantForPoint:', counts);
    console.log('🔍 DISCREPANCY ANALYSIS:', {
      contextSaysLoyalists: contextDistribution.loyalists,
      manualCountLoyalists: counts.loyalists || 0,
      contextSaysApostles: contextDistribution.apostles,
      manualCountApostles: counts.apostles || 0,
      contextTotal: totalCustomersFromContext,
      manualTotal: totalFromManual,
      difference: `Context: ${totalCustomersFromContext}, Manual: ${totalFromManual}`
    });
    
    return counts;
  }, [data, getQuadrantForPoint, contextDistribution, totalCustomersFromContext]);

  // ✅ FIXED: Use EnhancedProximityClassifier (same as DistributionSection)
  const proximityAnalysis = useMemo(() => {
    console.log('🔄 PROXIMITY ANALYSIS USEMEMO RECALCULATING with dependencies:', {
      dataLength: data.length,
      satisfactionScale,
      loyaltyScale,
      midpointSat: midpoint.sat,
      midpointLoy: midpoint.loy,
      contextDistributionTotal: Object.values(contextDistribution).reduce((sum, val) => sum + (val || 0), 0),
      manualAssignmentsSize: manualAssignments.size,
      apostlesZoneSize,
      terroristsZoneSize,
      isPremium,
      showSpecialZones,
      showNearApostles,
      getQuadrantForPointType: typeof getQuadrantForPoint
    });

    console.log('🔍 Proximity analysis recalculating with:', {
      dataLength: data.length,
      midpoint,
      contextDistribution,
      manualAssignments: manualAssignments.size
    });

    // Use EnhancedProximityClassifier (same as DistributionSection)
    console.log('🔍 Creating EnhancedProximityClassifier with:', {
      satisfactionScale,
      loyaltyScale,
      midpoint
    });
    const enhancedClassifier = new EnhancedProximityClassifier(
      satisfactionScale,
      loyaltyScale,
      midpoint
    );

    // Analyze proximity using context assignments as starting point (same as DistributionSection)
    const result = enhancedClassifier.analyzeProximity(
      data,
      getQuadrantForPoint, // Use context's authoritative assignment function
      isPremium,
      undefined, // Use default threshold for now
      showSpecialZones,
      showNearApostles
    );

    console.log('📊 Proximity analysis result:', result);
    console.log('🔍 DETAILED RESULT INSPECTION FROM ENHANCEDPROXIMITY:', {
      resultType: typeof result,
      isAvailable: result.settings.isAvailable,
      totalCustomersInResult: result.summary.totalProximityCustomers,
      unavailabilityReason: result.settings.unavailabilityReason,
      fullSummary: result.summary
    });
    console.log('🔍 DETAILED RESULT INSPECTION:', {
      isAvailable: result.settings.isAvailable,
      totalCustomersInResult: result.summary.totalProximityCustomers,
      unavailabilityReason: result.settings.unavailabilityReason
    });
    console.log('🔍 FINAL RESULT BEING RETURNED FROM USEMEMO:', {
      totalProximityCustomers: result.summary.totalProximityCustomers,
      isAvailable: result.settings.isAvailable,
      objectReference: result
    });
    return result;

  }, [
    data, 
    satisfactionScale, 
    loyaltyScale, 
    midpoint.sat,
    midpoint.loy,
    contextDistribution,
    manualAssignments,
    isPremium, 
    showSpecialZones,
    showNearApostles,
    getQuadrantForPoint
  ]);

  // Handle unavailable proximity analysis
  if (!proximityAnalysis.settings.isAvailable) {
    return (
      <div className="proximity-section">
        <div className="proximity-header">
          <h3 className="proximity-title">Proximity Analysis</h3>
          <p className="proximity-subtitle">Customers near quadrant boundaries</p>
        </div>
        <Card className="proximity-unavailable">
          <h4>Proximity Analysis Unavailable</h4>
          <p className="proximity-unavailable-reason">
            {proximityAnalysis.settings.unavailabilityReason}
          </p>
          <p className="proximity-empty-hint">
            Try using a larger scale (1-5 or above) for proximity analysis.
          </p>
        </Card>
      </div>
    );
  }

  console.log('🔍 ABOUT TO USE proximityAnalysis.summary:', {
    totalProximityCustomers: proximityAnalysis.summary.totalProximityCustomers,
    isAvailable: proximityAnalysis.settings.isAvailable,
    source: 'proximityAnalysis.summary'
  });

  const summary = proximityAnalysis.summary;
  
  // ✅ Use raw analysis results - no artificial capping
  const correctedSummary = summary;
  
  return (
    <div className="proximity-section">
      <div className="proximity-header">
        <h3 className="proximity-title">Proximity Analysis</h3>
        <p className="proximity-subtitle">
          Distance-based proximity to quadrant boundaries
        </p>
      </div>

      <div className="proximity-content">
        {/* Proximity Distribution Grid */}
        <div className="proximity-grid">
          {/* Hostages Quadrant */}
          <div className="proximity-quadrant hostages">
            <div className="quadrant-header">
              <h4>{getDisplayNameForQuadrant('hostages')}</h4>
              <span className="quadrant-total">
                {contextDistribution.hostages}
              </span>
            </div>
            <div className="quadrant-breakdown">
              <div className="proximity-item">
                <span className="proximity-label">Close to Loyalists</span>
                <span className="proximity-count">
                  {proximityAnalysis.analysis.hostages_close_to_loyalists.customerCount}
                </span>
              </div>
              <div className="proximity-item">
                <span className="proximity-label">Close to Defectors</span>
                <span className="proximity-count">
                  {proximityAnalysis.analysis.hostages_close_to_defectors.customerCount}
                </span>
              </div>
              <div className="solid-item">
                <span className="solid-label">Safe Zone</span>
                <span className="solid-count">
                  {contextDistribution.hostages - 
                   proximityAnalysis.analysis.hostages_close_to_loyalists.customerCount -
                   proximityAnalysis.analysis.hostages_close_to_defectors.customerCount}
                </span>
              </div>
            </div>
          </div>

          {/* Loyalists Quadrant */}
          <div className="proximity-quadrant loyalists">
            <div className="quadrant-header">
              <h4>{getDisplayNameForQuadrant('loyalists')}</h4>
              <span className="quadrant-total">{contextDistribution.loyalists}</span>
            </div>
            <div className="quadrant-breakdown">
              <div className="proximity-item">
                <span className="proximity-label">Close to Hostages</span>
                <span className="proximity-count">
                  {proximityAnalysis.analysis.loyalists_close_to_hostages.customerCount}
                </span>
              </div>
              <div className="proximity-item">
                <span className="proximity-label">Close to Mercenaries</span>
                <span className="proximity-count">
                  {proximityAnalysis.analysis.loyalists_close_to_mercenaries.customerCount}
                </span>
              </div>
              <div className="solid-item">
                <span className="solid-label">Safe Zone</span>
                <span className="solid-count">
                  {contextDistribution.loyalists - 
                   proximityAnalysis.analysis.loyalists_close_to_hostages.customerCount -
                   proximityAnalysis.analysis.loyalists_close_to_mercenaries.customerCount}
                </span>
              </div>
            </div>
          </div>

          {/* Defectors Quadrant */}
          <div className="proximity-quadrant defectors">
            <div className="quadrant-header">
              <h4>{getDisplayNameForQuadrant('defectors')}</h4>
              <span className="quadrant-total">{contextDistribution.defectors}</span>
            </div>
            <div className="quadrant-breakdown">
              <div className="proximity-item">
                <span className="proximity-label">Close to Hostages</span>
                <span className="proximity-count">
                  {proximityAnalysis.analysis.defectors_close_to_hostages.customerCount}
                </span>
              </div>
              <div className="proximity-item">
                <span className="proximity-label">Close to Mercenaries</span>
                <span className="proximity-count">
                  {proximityAnalysis.analysis.defectors_close_to_mercenaries.customerCount}
                </span>
              </div>
              <div className="solid-item">
                <span className="solid-label">Safe Zone</span>
                <span className="solid-count">
                  {contextDistribution.defectors - 
                   proximityAnalysis.analysis.defectors_close_to_hostages.customerCount -
                   proximityAnalysis.analysis.defectors_close_to_mercenaries.customerCount}
                </span>
              </div>
            </div>
          </div>

          {/* Mercenaries Quadrant */}
          <div className="proximity-quadrant mercenaries">
            <div className="quadrant-header">
              <h4>{getDisplayNameForQuadrant('mercenaries')}</h4>
              <span className="quadrant-total">{contextDistribution.mercenaries}</span>
            </div>
            <div className="quadrant-breakdown">
              <div className="proximity-item">
                <span className="proximity-label">Close to Loyalists</span>
                <span className="proximity-count">
                  {proximityAnalysis.analysis.mercenaries_close_to_loyalists.customerCount}
                </span>
              </div>
              <div className="proximity-item">
                <span className="proximity-label">Close to Defectors</span>
                <span className="proximity-count">
                  {proximityAnalysis.analysis.mercenaries_close_to_defectors.customerCount}
                </span>
              </div>
              <div className="solid-item">
                <span className="solid-label">Safe Zone</span>
                <span className="solid-count">
                  {contextDistribution.mercenaries - 
                   proximityAnalysis.analysis.mercenaries_close_to_loyalists.customerCount -
                   proximityAnalysis.analysis.mercenaries_close_to_defectors.customerCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Zones Section (when enabled) */}
        {showSpecialZones && 'specialZones' in proximityAnalysis && proximityAnalysis.specialZones && (
          <div className="special-zones-section">
            <h4>Special Groups Proximity</h4>
            <div className="special-groups-grid">
              {contextDistribution.apostles > 0 && (
                <div className="special-group">
                  <span className="group-label">Apostles</span>
                  <span className="group-count">{contextDistribution.apostles}</span>
                </div>
              )}
              {contextDistribution.terrorists > 0 && (
                <div className="special-group">
                  <span className="group-label">Terrorists</span>
                  <span className="group-count">{contextDistribution.terrorists}</span>
                </div>
              )}
              {showNearApostles && contextDistribution.near_apostles > 0 && (
                <div className="special-group">
                  <span className="group-label">Near Apostles</span>
                  <span className="group-count">{contextDistribution.near_apostles}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Section */}
        <div className="proximity-summary">
          <h4>Proximity Summary</h4>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Total Customers Near Boundaries</span>
              <span className="summary-value">{correctedSummary.totalProximityCustomers}</span>
              <span className="summary-percent">
                ({((correctedSummary.totalProximityCustomers / totalCustomersFromContext) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Unique Positions</span>
              <span className="summary-value">{correctedSummary.totalProximityPositions}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Average Risk Score</span>
              <span className="summary-value">{correctedSummary.averageRiskScore.toFixed(1)}</span>
              <span className="summary-percent">out of 100</span>
            </div>
          </div>

          {/* Strategic Indicators */}
          {correctedSummary.crisisIndicators.length > 0 && (
            <div className="strategic-indicators crisis">
              <h5>🚨 CRISIS Indicators</h5>
              <ul>
                {correctedSummary.crisisIndicators.map((indicator, index) => (
                  <li key={index}>{indicator}</li>
                ))}
              </ul>
            </div>
          )}

          {correctedSummary.opportunityIndicators.length > 0 && (
            <div className="strategic-indicators opportunity">
              <h5>✅ OPPORTUNITY Indicators</h5>
              <ul>
                {correctedSummary.opportunityIndicators.map((indicator, index) => (
                  <li key={index}>{indicator}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Debug Information (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="proximity-debug">
            <details>
              <summary>Debug: Context vs Manual Count vs Proximity Totals</summary>
              <pre>{JSON.stringify({
                contextTotals: {
                  loyalists: contextDistribution.loyalists,
                  mercenaries: contextDistribution.mercenaries,
                  hostages: contextDistribution.hostages,
                  defectors: contextDistribution.defectors,
                  apostles: contextDistribution.apostles,
                  total: totalCustomersFromContext
                },
                manualCounts: manualCounts,
                proximityTotals: {
                  totalProximityCustomers: correctedSummary.totalProximityCustomers,
                  totalProximityPositions: correctedSummary.totalProximityPositions,
                  averageRiskScore: correctedSummary.averageRiskScore
                },
                settings: {
                  showSpecialZones,
                  showNearApostles,
                  isPremium
                }
              }, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProximitySection;




