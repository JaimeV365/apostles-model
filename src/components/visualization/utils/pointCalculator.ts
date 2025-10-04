import { DataPoint } from '../../../types/base';

interface PointDimensions {
  MIN_SIZE: number;
  MAX_SIZE: number;
  SCALE_FACTOR: number;
}

const POINT_DIMENSIONS: PointDimensions = {
  MIN_SIZE: 8,
  MAX_SIZE: 20,
  SCALE_FACTOR: 1.5
};

export interface FrequencyMap {
  [key: string]: number;
}

export function calculateFrequencyMap(data: DataPoint[]): FrequencyMap {
  return data.reduce((map, point) => {
    const key = `${point.satisfaction}-${point.loyalty}`;
    map[key] = (map[key] || 0) + 1;
    return map;
  }, {} as FrequencyMap);
}

export function getMaxFrequency(frequencyMap: FrequencyMap): number {
  return Math.max(...Object.values(frequencyMap));
}

export function hasOverlappingPoints(frequencyMap: FrequencyMap): boolean {
  return getMaxFrequency(frequencyMap) > 1;
}

export function calculateDotSize(
  frequency: number,
  maxFrequency: number
): number {
  if (maxFrequency <= 1) return POINT_DIMENSIONS.MIN_SIZE;

  const scaledSize = POINT_DIMENSIONS.MIN_SIZE +
    ((frequency - 1) / (maxFrequency - 1)) *
    (POINT_DIMENSIONS.MAX_SIZE - POINT_DIMENSIONS.MIN_SIZE) *
    POINT_DIMENSIONS.SCALE_FACTOR;

  return Math.max(
    POINT_DIMENSIONS.MIN_SIZE,
    Math.min(POINT_DIMENSIONS.MAX_SIZE, scaledSize)
  );
}

export function getPointKey(satisfaction: number, loyalty: number): string {
  return `${satisfaction}-${loyalty}`;
}

export function shouldShowPoint(
  frequency: number,
  threshold: number,
  filterEnabled: boolean
): boolean {
  if (!filterEnabled) return true;
  return frequency >= threshold;
}

export function getPointStyle(
  normalizedSatisfaction: number,
  normalizedLoyalty: number,
  dotSize: number,
  frequency: number,
  isSelected: boolean
): React.CSSProperties {
  return {
    position: 'absolute',
    left: `${normalizedSatisfaction}%`,
    bottom: `${normalizedLoyalty}%`,
    width: `${dotSize}px`,
    height: `${dotSize}px`,
    transform: `translate(-50%, 50%) scale(${frequency > 1 ? 1.1 : 1})`,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '2px solid white',
    borderRadius: '50%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    zIndex: isSelected ? 30 : 10
  };
}