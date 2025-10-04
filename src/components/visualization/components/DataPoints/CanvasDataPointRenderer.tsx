import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { GridDimensions, Position, DataPoint, ScaleFormat } from '@/types/base';
import { calculatePointPosition } from '../../utils/positionCalculator';
import { useQuadrantAssignment, QuadrantType } from '../../context/QuadrantAssignmentContext';

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
  const { getQuadrantForPoint } = useQuadrantAssignment();

  // 🕐 PERFORMANCE MEASUREMENT: Start canvas rendering
  console.time('Chart Render');
  console.time('📊 CANVAS_RENDERING');

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
    return data.filter(point => {
      if (point.excluded) return false;
      const key = `${point.satisfaction}-${point.loyalty}`;
      const frequency = pointGroups.get(key)?.length || 0;
      return !frequencyFilterEnabled || frequency >= frequencyThreshold;
    });
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render all points
    canvasPoints.forEach(point => {
      const canvasX = (point.x / 100) * canvas.width;
      const canvasY = canvas.height - (point.y / 100) * canvas.height; // Flip Y axis

      // Draw circle
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, point.size, 0, 2 * Math.PI);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw shadow effect
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
    });
  }, [canvasPoints]);

  // Handle canvas resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
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
    console.timeEnd('Chart Render');
    console.timeEnd('📊 CANVAS_RENDERING');
    console.log('✅ Canvas Rendering: COMPLETE');
  }, [renderPoints]);

  // Basic click detection (Phase 1 - simple implementation)
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onPointSelect) return;

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

    if (closestPoint && onPointSelect) {
      onPointSelect({
        ...closestPoint.originalPoint,
        frequency: closestPoint.count,
        quadrant: getQuadrantDisplayInfo(getQuadrantForPoint(closestPoint.originalPoint), isClassicModel).group,
        normalizedSatisfaction: closestPoint.x,
        normalizedLoyalty: closestPoint.y
      });
    }
  }, [canvasPoints, onPointSelect, getQuadrantForPoint, isClassicModel]);

  return (
    <canvas
      ref={canvasRef}
      className="canvas-data-points"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        pointerEvents: 'auto',
        cursor: 'pointer'
      }}
      onClick={handleClick}
    />
  );
});

export default CanvasDataPointRenderer;
