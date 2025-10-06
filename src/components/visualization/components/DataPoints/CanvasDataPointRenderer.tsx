import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { GridDimensions, Position, DataPoint, ScaleFormat } from '@/types/base';
import { calculatePointPosition } from '../../utils/positionCalculator';
import { useQuadrantAssignment, QuadrantType } from '../../context/QuadrantAssignmentContext';
import InfoBox from './DataPointInfoBox';

interface CanvasDataPointRendererProps {
  data: DataPoint[];
  dimensions: GridDimensions;
  position: Position;
  frequencyFilterEnabled: boolean;
  frequencyThreshold: number;
  satisfactionScale: ScaleFormat;
  loyaltyScale: ScaleFormat;
  showNearApostles: boolean;
  apostlesZoneSize: number;
  terroristsZoneSize: number;
  isClassicModel: boolean;
  onPointSelect?: (point: DataPoint & {
    frequency: number;
    quadrant: string;
    normalizedSatisfaction: number;
    normalizedLoyalty: number;
  }) => void;
  selectedPointId?: string;
}

interface CanvasPoint {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  count: number;
  originalPoint: DataPoint;
}

const getQuadrantDisplayInfo = (quadrantType: QuadrantType, isClassic: boolean) => {
  switch (quadrantType) {
    case 'apostles':
      return { 
        group: isClassic ? 'Apostles' : 'Advocates', 
        color: '#4CAF50' 
      };
    case 'terrorists':
      return { 
        group: isClassic ? 'Terrorists' : 'Trolls', 
        color: '#CC0000' 
      };
    case 'near_apostles':
      return { 
        group: isClassic ? 'Near-Apostles' : 'Near-Advocates', 
        color: '#4CAF50' 
      };
    case 'loyalists':
      return { group: 'Loyalists', color: '#4CAF50' };
    case 'mercenaries':
      return { group: 'Mercenaries', color: '#F7B731' };
    case 'hostages':
      return { group: 'Hostages', color: '#3A6494' };
    case 'defectors':
      return { group: 'Defectors', color: '#CC0000' };
    case 'neutral':
      return { group: 'Neutral', color: '#9E9E9E' };
    default:
      return { group: 'Unknown', color: '#666666' };
  }
};

export const CanvasDataPointRenderer: React.FC<CanvasDataPointRendererProps> = React.memo(({
  data,
  dimensions,
  position,
  frequencyFilterEnabled,
  frequencyThreshold,
  satisfactionScale,
  loyaltyScale,
  showNearApostles,
  apostlesZoneSize,
  terroristsZoneSize,
  isClassicModel,
  onPointSelect,
  selectedPointId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getQuadrantForPoint, updateManualAssignment, getBoundaryOptions } = useQuadrantAssignment();
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

  // 🕐 PERFORMANCE MEASUREMENT: Start canvas rendering
  console.time('📊 CANVAS_RENDERING');
  console.time('🎯 CANVAS_SETUP');

  // Memoize point groups calculation (same as DOM renderer)
  const pointGroups = useMemo(() => {
    const groups = new Map<string, DataPoint[]>();
    data.forEach(point => {
      if (!point.excluded) {
        const key = `${point.satisfaction}-${point.loyalty}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)?.push(point);
      }
    });
    return groups;
  }, [data]);

  // Memoize filtered data (same as DOM renderer)
  const filteredData = useMemo(() => {
    const filtered = data.filter(point => {
      if (point.excluded) return false;
      const key = `${point.satisfaction}-${point.loyalty}`;
      const frequency = pointGroups.get(key)?.length || 0;
      return !frequencyFilterEnabled || frequency >= frequencyThreshold;
    });
    console.log(`🚀 CANVAS RENDERER: Starting render with ${filtered.length} data points`);
    console.timeEnd('🎯 CANVAS_SETUP');
    return filtered;
  }, [data, pointGroups, frequencyFilterEnabled, frequencyThreshold]);

  // Convert data points to canvas points
  const canvasPoints = useMemo((): CanvasPoint[] => {
    return filteredData.map(point => {
      const normalized = calculatePointPosition(
        point.satisfaction,
        point.loyalty,
        satisfactionScale,
        loyaltyScale
      );
      
      const groupKey = `${point.satisfaction}-${point.loyalty}`;
      const samePoints = pointGroups.get(groupKey) || [];
      const count = samePoints.length;
      const size = Math.min(12 + (count - 1) * 3, 60);
      
      const quadrantType = getQuadrantForPoint(point);
      const displayInfo = getQuadrantDisplayInfo(quadrantType, isClassicModel);
      
      return {
        id: point.id,
        x: normalized.normalizedSatisfaction,
        y: normalized.normalizedLoyalty,
        size: size / 2, // Canvas radius
        color: displayInfo.color,
        count,
        originalPoint: point
      };
    });
  }, [filteredData, pointGroups, satisfactionScale, loyaltyScale, getQuadrantForPoint, isClassicModel]);

  // Render points to canvas
  const renderPoints = useCallback(() => {
    console.time('🎨 CANVAS_DRAW');
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the display size (CSS pixels) for positioning calculations
    const displayWidth = canvas.style.width ? parseInt(canvas.style.width) : canvas.width;
    const displayHeight = canvas.style.height ? parseInt(canvas.style.height) : canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Set up crisp rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Reset shadow properties
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Render all points
    canvasPoints.forEach(point => {
      const canvasX = (point.x / 100) * displayWidth;
      const canvasY = displayHeight - (point.y / 100) * displayHeight; // Flip Y axis

      // Draw main circle (no shadow for crisp appearance)
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, point.size, 0, 2 * Math.PI);
      ctx.fill();

      // Draw crisp white border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
    console.timeEnd('🎨 CANVAS_DRAW');
  }, [canvasPoints]);

  // Handle canvas resize with high DPI support
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    
    // Get device pixel ratio for crisp rendering on high DPI displays
    const dpr = window.devicePixelRatio || 1;
    
    // Set display size (CSS pixels)
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale the drawing context so everything will work at the higher ratio
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      
      // Enable crisp rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    
    renderPoints();
  }, [renderPoints]);

  // Initial render and resize handling
  useEffect(() => {
    handleResize();
    
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvasRef.current?.parentElement || document.body);
    
    return () => resizeObserver.disconnect();
  }, [handleResize]);

  // Re-render when points change
  useEffect(() => {
    renderPoints();
    
    // 🕐 PERFORMANCE MEASUREMENT: Canvas rendering complete
    console.timeEnd('📊 CANVAS_RENDERING');
    console.log(`✅ CANVAS RENDERER: Completed render of ${canvasPoints.length} points`);
  }, [renderPoints]);

  // Enhanced click detection with InfoBox support
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert canvas coordinates to percentage
    const clickX = (x / canvas.width) * 100;
    const clickY = 100 - (y / canvas.height) * 100; // Flip Y axis

    // Find closest point (simple distance check for Phase 1)
    let closestPoint: CanvasPoint | null = null;
    let minDistance = Infinity;

    for (const point of canvasPoints) {
      const distance = Math.sqrt(
        Math.pow(point.x - clickX, 2) + Math.pow(point.y - clickY, 2)
      );
      
      if (distance < minDistance && distance < 5) { // 5% tolerance
        minDistance = distance;
        closestPoint = point;
      }
    }

    if (closestPoint) {
      // Toggle selection (same behavior as SVG renderer)
      setSelectedPoint(selectedPoint === closestPoint.id ? null : closestPoint.id);
      
      // Call onPointSelect if provided
      if (onPointSelect) {
        onPointSelect({
          ...closestPoint.originalPoint,
          frequency: closestPoint.count,
          quadrant: getQuadrantDisplayInfo(getQuadrantForPoint(closestPoint.originalPoint), isClassicModel).group,
          normalizedSatisfaction: closestPoint.x,
          normalizedLoyalty: closestPoint.y
        });
      }
    } else {
      // Clicked on empty space, deselect
      setSelectedPoint(null);
    }
  }, [canvasPoints, onPointSelect, getQuadrantForPoint, isClassicModel, selectedPoint]);

  // Get selected point data for InfoBox
  const selectedPointData = useMemo(() => {
    if (!selectedPoint) return null;
    
    const point = filteredData.find(p => p.id === selectedPoint);
    if (!point) return null;
    
    const normalized = calculatePointPosition(
      point.satisfaction,
      point.loyalty,
      satisfactionScale,
      loyaltyScale
    );
    
    const groupKey = `${point.satisfaction}-${point.loyalty}`;
    const samePoints = pointGroups.get(groupKey) || [];
    const count = samePoints.length;
    
    const quadrantType = getQuadrantForPoint(point);
    const displayInfo = getQuadrantDisplayInfo(quadrantType, isClassicModel);
    
    // Get boundary options (same logic as SVG renderer)
    const availableOptions = getBoundaryOptions(point);
    
    return {
      point,
      normalized: { x: normalized.normalizedSatisfaction, y: normalized.normalizedLoyalty },
      quadrantInfo: displayInfo,
      count,
      samePoints,
      availableOptions
    };
  }, [selectedPoint, filteredData, pointGroups, satisfactionScale, loyaltyScale, getQuadrantForPoint, isClassicModel, showNearApostles, apostlesZoneSize, terroristsZoneSize]);

  return (
    <div style={{ 
      position: 'absolute', 
      inset: 0, 
      zIndex: 40, 
      pointerEvents: 'none',
      overflow: 'visible' // Allow dots to extend outside grid boundaries
    }}>
      {/* Canvas Renderer Indicator */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(76, 175, 80, 0.9)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 100,
        pointerEvents: 'none'
      }}>
        🚀 CANVAS RENDERER
      </div>
      <canvas
        ref={canvasRef}
        className="canvas-data-points"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none', // Don't block other interactions
          cursor: 'pointer',
          overflow: 'visible' // Allow canvas content to extend beyond boundaries
        }}
        onClick={handleClick}
      />
      
      {/* Invisible clickable areas for each dot */}
      {canvasPoints.map((point, index) => {
        const canvasX = (point.x / 100) * 100; // Convert to percentage
        const canvasY = 100 - (point.y / 100) * 100; // Flip Y axis and convert to percentage
        
        return (
          <div
            key={`click-${point.id}-${index}`}
            style={{
              position: 'absolute',
              left: `${canvasX}%`,
              bottom: `${canvasY}%`,
              width: `${point.size * 2}px`,
              height: `${point.size * 2}px`,
              transform: 'translate(-50%, 50%)',
              borderRadius: '50%',
              pointerEvents: 'auto',
              cursor: 'pointer',
              zIndex: 45
            }}
            onClick={() => {
              setSelectedPoint(point.id);
              onPointSelect?.({
                ...point.originalPoint,
                frequency: point.count,
                quadrant: getQuadrantForPoint(point.originalPoint),
                normalizedSatisfaction: point.x,
                normalizedLoyalty: point.y
              });
            }}
          />
        );
      })}
      
      {/* InfoBox for selected point */}
      {selectedPointData && (
        <InfoBox
          point={selectedPointData.point}
          normalized={selectedPointData.normalized}
          quadrantInfo={selectedPointData.quadrantInfo}
          count={selectedPointData.count}
          samePoints={selectedPointData.samePoints}
          availableOptions={selectedPointData.availableOptions}
          onClose={() => setSelectedPoint(null)}
          onGroupChange={(newGroup) => {
            // Map the display name to our QuadrantType (same logic as SVG renderer)
            let quadrantType: QuadrantType = 'defectors'; // default
            
            if (newGroup.group === 'Loyalists') quadrantType = 'loyalists';
            else if (newGroup.group === 'Mercenaries') quadrantType = 'mercenaries';
            else if (newGroup.group === 'Hostages') quadrantType = 'hostages';
            else if (newGroup.group === 'Defectors') quadrantType = 'defectors';
            else if (newGroup.group === 'Apostles' || newGroup.group === 'Advocates') quadrantType = 'apostles';
            else if (newGroup.group === 'Terrorists' || newGroup.group === 'Trolls') quadrantType = 'terrorists';
            else if (newGroup.group === 'Near-Apostles' || newGroup.group === 'Near-Advocates') quadrantType = 'near_apostles';
            else if (newGroup.group === 'Neutral') quadrantType = 'neutral';
            
            // Update ALL customers at this position, not just the clicked one
            selectedPointData.samePoints.forEach(customer => {
              updateManualAssignment(customer.id, quadrantType);
            });
          }}
        />
      )}
    </div>
  );
});

export default CanvasDataPointRenderer;
