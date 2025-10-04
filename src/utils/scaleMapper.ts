export type ScaleFormat = '1-5' | '1-7' | '1-10';

export interface CellDimensions {
  width: number;      // Width as percentage
  height: number;     // Height as percentage
  maxSat: number;     // Maximum satisfaction value
  maxLoy: number;     // Maximum loyalty value
  midSat: number;     // Midpoint satisfaction value
  midLoy: number;     // Midpoint loyalty value
}

export interface CellPosition {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  width: string;
  height: string;
}

export interface SpecialZones {
  apostles: CellPosition;
  nearApostles: CellPosition[] | null;
  terrorists: CellPosition;
}

export function calculateCellDimensions(
  satisfactionScale: ScaleFormat,
  loyaltyScale: ScaleFormat
): CellDimensions {
  const maxSat = parseInt(satisfactionScale.split('-')[1]);
  const maxLoy = parseInt(loyaltyScale.split('-')[1]);
  
  return {
    width: 100 / (maxSat - 1),
    height: 100 / (maxLoy - 1),
    maxSat,
    maxLoy,
    midSat: Math.ceil(maxSat / 2),
    midLoy: Math.ceil(maxLoy / 2)
  };
}

export function calculateSpecialZones(
  dimensions: CellDimensions
): SpecialZones {
  const { width, height, maxSat, maxLoy } = dimensions;
  
  // Always create Apostles zone (top-right cell)
  const apostles: CellPosition = {
    top: '0',
    right: '0',
    width: `${width}%`,
    height: `${height}%`
  };

  // Create Near-Apostles zone if scale allows (need 5x5 minimum)
  const nearApostles = maxSat >= 5 && maxLoy >= 5 ? [
    // Cell 1E (second from right, top row)
    {
      top: '0',
      right: `${width}%`,
      width: `${width}%`,
      height: `${height}%`
    },
    // Cell 2E (second from right, second row) - Label cell
    {
      top: `${height}%`,
      right: `${width}%`,
      width: `${width}%`,
      height: `${height}%`
    },
    // Cell 2F (rightmost, second row)
    {
      top: `${height}%`,
      right: '0',
      width: `${width}%`,
      height: `${height}%`
    }
  ] : null;

  // Always create Terrorists zone (bottom-left cell)
  const terrorists: CellPosition = {
    bottom: '0',
    left: '0',
    width: `${width}%`,
    height: `${height}%`
  };

  return { apostles, nearApostles, terrorists };
}

export function calculatePosition(value: number, scale: ScaleFormat): number {
  const maxValue = parseInt(scale.split('-')[1]);
  return Number((((value - 1) / (maxValue - 1)) * 100).toFixed(3));
}

export function determineQuadrant(
  satisfaction: number,
  loyalty: number,
  dimensions: CellDimensions,
  showNearApostles: boolean = false
): string {
  const { maxSat, maxLoy, midSat, midLoy } = dimensions;

  // Check special zones first
  if (satisfaction === maxSat && loyalty === maxLoy) {
    return 'apostle';
  }

  if (showNearApostles && maxSat >= 5 && maxLoy >= 5) {
    if (satisfaction >= maxSat - 2 && satisfaction <= maxSat - 1 &&
        loyalty >= maxLoy - 2 && loyalty <= maxLoy - 1) {
      return 'nearApostle';
    }
  }

  if (satisfaction === 1 && loyalty === 1) {
    return 'terrorist';
  }

  // Standard quadrants
  if (satisfaction >= midSat) {
    return loyalty >= midLoy ? 'loyalist' : 'mercenary';
  } else {
    return loyalty >= midLoy ? 'hostage' : 'defector';
  }
}