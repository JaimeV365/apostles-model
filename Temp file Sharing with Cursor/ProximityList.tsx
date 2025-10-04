import React, { useMemo } from 'react';
import { DataPoint, ScaleFormat } from '../../../../types/base';
import './ProximityList.css';

interface ProximityListProps {
  data: DataPoint[];
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  midpoint: { sat: number; loy: number };
  isClassicModel: boolean;
  showSpecialZones?: boolean;
  hideTitle?: boolean;
}

interface ProximityGroup {
  id: string;
  label: string;
  count: number;
  description: string;
  color: string;
  percentage: number;
  category: 'quadrant_boundary' | 'special_zone' | 'solid';
}

export const ProximityList: React.FC<ProximityListProps> = ({
  data,
  satisfactionScale,
  loyaltyScale,
  midpoint,
  isClassicModel,
  showSpecialZones = false,
  hideTitle = false
}) => {
  // Calculate maximum scale values
  const maxSat = parseInt(satisfactionScale.split('-')[1]);
  const maxLoy = parseInt(loyaltyScale.split('-')[1]);

  // Define threshold for "near" (what constitutes being close to a boundary)
  const PROXIMITY_THRESHOLD = 1;

  // Get terminology based on classic or modern model
  const terminology = {
    apostles: isClassicModel ? 'Apostles' : 'Advocates',
    terrorists: isClassicModel ? 'Terrorists' : 'Trolls',
  };

  // Calculate proximity groups
  const proximityGroups = useMemo(() => {
    // Initialize groups
    const groups: Record<string, number> = {
      // Points near quadrant boundaries
      loyalists_near_mercenaries: 0,
      loyalists_near_hostages: 0,
      mercenaries_near_loyalists: 0,
      mercenaries_near_defectors: 0,
      hostages_near_loyalists: 0,
      hostages_near_defectors: 0,
      defectors_near_mercenaries: 0,
      defectors_near_hostages: 0,
      
      // Points near special zones if enabled
      near_apostles: 0,
      near_terrorists: 0,
      
      // Points firmly in their quadrants (not near any boundary)
      solid_loyalists: 0,
      solid_mercenaries: 0,
      solid_hostages: 0,
      solid_defectors: 0,
    };

    // Process each data point
    data.forEach(point => {
      if (point.excluded) return;
      
      const { satisfaction: sat, loyalty: loy } = point;
      
      // Determine base quadrant
      const isHighSat = sat >= midpoint.sat;
      const isHighLoy = loy >= midpoint.loy;
      
      // Check for special zones first
      if (showSpecialZones) {
        // Check for near apostles
        if (sat >= maxSat - PROXIMITY_THRESHOLD && sat < maxSat && 
            loy >= maxLoy - PROXIMITY_THRESHOLD && loy < maxLoy) {
          groups.near_apostles++;
          return;
        }
        
        // Check for near terrorists
        if (sat <= 1 + PROXIMITY_THRESHOLD && sat > 1 && 
            loy <= 1 + PROXIMITY_THRESHOLD && loy > 1) {
          groups.near_terrorists++;
          return;
        }
      }

      // Determine quadrant and proximity
      if (isHighSat && isHighLoy) {
        // Loyalists quadrant
        if (sat - midpoint.sat <= PROXIMITY_THRESHOLD) {
          groups.loyalists_near_hostages++;
        } else if (loy - midpoint.loy <= PROXIMITY_THRESHOLD) {
          groups.loyalists_near_mercenaries++;
        } else {
          groups.solid_loyalists++;
        }
      } else if (isHighSat && !isHighLoy) {
        // Mercenaries quadrant
        if (sat - midpoint.sat <= PROXIMITY_THRESHOLD) {
          groups.mercenaries_near_defectors++;
        } else if (midpoint.loy - loy <= PROXIMITY_THRESHOLD) {
          groups.mercenaries_near_loyalists++;
        } else {
          groups.solid_mercenaries++;
        }
      } else if (!isHighSat && isHighLoy) {
        // Hostages quadrant
        if (midpoint.sat - sat <= PROXIMITY_THRESHOLD) {
          groups.hostages_near_loyalists++;
        } else if (loy - midpoint.loy <= PROXIMITY_THRESHOLD) {
          groups.hostages_near_defectors++;
        } else {
          groups.solid_hostages++;
        }
      } else {
        // Defectors quadrant
        if (midpoint.sat - sat <= PROXIMITY_THRESHOLD) {
          groups.defectors_near_mercenaries++;
        } else if (midpoint.loy - loy <= PROXIMITY_THRESHOLD) {
          groups.defectors_near_hostages++;
        } else {
          groups.solid_defectors++;
        }
      }
    });

    return groups;
  }, [data, midpoint, maxSat, maxLoy, showSpecialZones]);

  // Format data for display
  const formattedGroups: ProximityGroup[] = useMemo(() => {
    const totalPoints = data.filter(point => !point.excluded).length;
    
    const groupConfigs: Record<string, {
      label: string;
      description: string;
      color: string;
      category: 'quadrant_boundary' | 'special_zone' | 'solid';
    }> = {
      // Points near quadrant boundaries
      loyalists_near_mercenaries: {
        label: 'Loyalists Near Mercenaries',
        description: 'High satisfaction but loyalty approaching threshold',
        color: '#4CAF50', // Green with yellow tint
        category: 'quadrant_boundary'
      },
      loyalists_near_hostages: {
        label: 'Loyalists Near Hostages',
        description: 'High loyalty but satisfaction approaching threshold',
        color: '#4CAF50', // Green with blue tint
        category: 'quadrant_boundary'
      },
      mercenaries_near_loyalists: {
        label: 'Mercenaries Near Loyalists',
        description: 'High satisfaction with loyalty approaching threshold',
        color: '#F7B731', // Yellow with green tint
        category: 'quadrant_boundary'
      },
      mercenaries_near_defectors: {
        label: 'Mercenaries Near Defectors',
        description: 'Low loyalty with satisfaction approaching threshold',
        color: '#F7B731', // Yellow with red tint
        category: 'quadrant_boundary'
      },
      hostages_near_loyalists: {
        label: 'Hostages Near Loyalists',
        description: 'High loyalty with satisfaction approaching threshold',
        color: '#4682B4', // Blue with green tint
        category: 'quadrant_boundary'
      },
      hostages_near_defectors: {
        label: 'Hostages Near Defectors',
        description: 'Low satisfaction with loyalty approaching threshold',
        color: '#4682B4', // Blue with red tint
        category: 'quadrant_boundary'
      },
      defectors_near_mercenaries: {
        label: 'Defectors Near Mercenaries',
        description: 'Low loyalty with satisfaction approaching threshold',
        color: '#DC2626', // Red with yellow tint
        category: 'quadrant_boundary'
      },
      defectors_near_hostages: {
        label: 'Defectors Near Hostages',
        description: 'Low satisfaction with loyalty approaching threshold',
        color: '#DC2626', // Red with blue tint
        category: 'quadrant_boundary'
      },
      
      // Points near special zones
      near_apostles: {
        label: `Near ${terminology.apostles}`,
        description: 'Very high satisfaction and loyalty, but not maximum',
        color: '#10B981', // Emerald green
        category: 'special_zone'
      },
      near_terrorists: {
        label: `Near ${terminology.terrorists}`,
        description: 'Very low satisfaction and loyalty, but not minimum',
        color: '#EF4444', // Bright red
        category: 'special_zone'
      },
      
      // Solid points
      solid_loyalists: {
        label: 'Solid Loyalists',
        description: 'Firmly in Loyalists quadrant',
        color: '#15803D', // Dark green
        category: 'solid'
      },
      solid_mercenaries: {
        label: 'Solid Mercenaries',
        description: 'Firmly in Mercenaries quadrant',
        color: '#B45309', // Dark yellow/amber
        category: 'solid'
      },
      solid_hostages: {
        label: 'Solid Hostages',
        description: 'Firmly in Hostages quadrant',
        color: '#1E40AF', // Dark blue
        category: 'solid'
      },
      solid_defectors: {
        label: 'Solid Defectors',
        description: 'Firmly in Defectors quadrant',
        color: '#991B1B', // Dark red
        category: 'solid'
      },
    };

    // Convert to array, filter out zero counts, and sort by count (descending)
    return Object.entries(proximityGroups)
      .filter(([_, count]) => count > 0)
      .map(([key, count]) => ({
        id: key,
        label: groupConfigs[key].label,
        count,
        description: groupConfigs[key].description,
        color: groupConfigs[key].color,
        percentage: (count / totalPoints) * 100,
        category: groupConfigs[key].category
      }))
      .sort((a, b) => b.count - a.count);
  }, [proximityGroups, terminology, data]);

  // No data case
  if (formattedGroups.length === 0) {
    return (
      <div className="proximity-empty-state">
        <p>No proximity data available</p>
        <p className="proximity-empty-subtext">Try adjusting the midpoint or scales</p>
      </div>
    );
  }

  return (
    <div className="proximity-list">
    {!hideTitle && <h4 className="proximity-list-title">Proximity Details</h4>}
      
      <div className="proximity-groups">
        {formattedGroups.map((group, index) => (
          <div key={index} className="proximity-group-item">
            <div className="proximity-group-bar-container">
              <div 
                className="proximity-group-bar" 
                style={{ 
                  width: `${Math.max(5, group.percentage)}%`,
                  backgroundColor: group.color
                }}
              />
            </div>
            <div className="proximity-group-content">
              <div className="proximity-group-header">
                <span className="proximity-group-label">{group.label}</span>
                <span className="proximity-group-count">{group.count} ({group.percentage.toFixed(1)}%)</span>
              </div>
              <p className="proximity-group-description">{group.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProximityList;