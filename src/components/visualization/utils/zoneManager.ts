import { GridDimensions } from '../../../types/base';

export interface SpecialZone {
  size: number;
  position: { x: number; y: number };
}

export interface ZoneConstraints {
  MIN_CELLS: number;
  MAX_CELLS_RATIO: number;
}

const ZONE_CONSTRAINTS: ZoneConstraints = {
  MIN_CELLS: 1,
  MAX_CELLS_RATIO: 0.3  // Max 30% of total grid size
};

export interface ZoneStyle {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  width: string;
  height: string;
  backgroundColor: string;
}

export function calculateMaxZoneSize(dimensions: GridDimensions): number {
  return Math.floor(
    Math.min(dimensions.totalCols, dimensions.totalRows) * 
    ZONE_CONSTRAINTS.MAX_CELLS_RATIO
  );
}

export function validateZoneSize(size: number, maxSize: number): number {
  return Math.max(
    ZONE_CONSTRAINTS.MIN_CELLS,
    Math.min(maxSize, size)
  );
}

export function calculateZoneResize(
  zone: 'apostles' | 'terrorists',
  currentSize: number,
  delta: { x: number; y: number },
  dimensions: GridDimensions
): number {
  const maxSize = calculateMaxZoneSize(dimensions);
  const newSize = currentSize + Math.max(delta.x, delta.y);
  return validateZoneSize(newSize, maxSize);
}

export function getZoneStyles(
  zone: 'apostles' | 'terrorists',
  size: number,
  dimensions: GridDimensions
): ZoneStyle {
  const { cellWidth, cellHeight } = dimensions;
  
  if (zone === 'apostles') {
    return {
      right: '0',
      top: '0',
      width: `${size * cellWidth}%`,
      height: `${size * cellHeight}%`,
      backgroundColor: 'rgba(76, 175, 80, 0.1)'
    };
  }

  return {
    left: '0',
    bottom: '0',
    width: `${size * cellWidth}%`,
    height: `${size * cellHeight}%`,
    backgroundColor: 'rgba(244, 67, 54, 0.1)'
  };
}

export function isInSpecialZone(
  satisfaction: number,
  loyalty: number,
  zone: 'apostles' | 'terrorists',
  zoneSize: number,
  dimensions: GridDimensions
): boolean {
  if (zone === 'apostles') {
    const minSat = dimensions.totalCols - zoneSize;
    const minLoy = dimensions.totalRows - zoneSize;
    return satisfaction >= minSat && loyalty >= minLoy;
  } else {
    return satisfaction <= zoneSize && loyalty <= zoneSize;
  }
}

export interface ZoneLayout {
  hasNearApostles: boolean;
  cellsToMidpoint: number;
}

export function calculateSpecialZones(dimensions: GridDimensions, midpoint: { sat: number; loy: number }) {
  const { totalCols, totalRows } = dimensions;
  
  // Calculate cells from top-right corner to midpoint
  const maxSat = totalCols;
  const maxLoy = totalRows;
  
  // Calculate distance from top-right corner to midpoint
  const horizontalCells = maxSat - midpoint.sat;
  const verticalCells = maxLoy - midpoint.loy;
  
  // Calculate total available cells (minimum of horizontal and vertical space)
  const availableCells = Math.min(horizontalCells, verticalCells);
  
  // Debug logs
  console.log('Available cells:', availableCells, 'Horizontal:', horizontalCells, 'Vertical:', verticalCells);
  
  // Need at least 3 cells for near-apostles (1 for apostles + 2 for near-apostles)
  const hasNearApostles = availableCells >= 3;
  
  return {
    hasNearApostles,
    cellsToMidpoint: availableCells
  };
}

export function calculateNearApostlesPositions(
  dimensions: GridDimensions,
  apostlesZoneSize: number
): Array<{ right: string; top: string; width: string; height: string }> {
  const { cellWidth, cellHeight } = dimensions;

  const hasSpaceForNearApostles = dimensions.totalCols - dimensions.midpointCol > apostlesZoneSize + 1;
  
  if (!hasSpaceForNearApostles) return [];

  // Calculate positions relative to apostles zone
  return [
    // Left cell (C1)
    {
      right: `${cellWidth * apostlesZoneSize}%`,
      top: `0`,
      width: `${cellWidth}%`,
      height: `${cellHeight}%`
    },
    // Bottom cell (D2)
    {
      right: `0`,
      top: `${cellHeight}%`,
      width: `${cellWidth}%`,
      height: `${cellHeight}%`
    },
    // Corner cell (C2)
    {
      right: `${cellWidth * apostlesZoneSize}%`,
      top: `${cellHeight}%`,
      width: `${cellWidth}%`,
      height: `${cellHeight}%`
    }
  ];
}

