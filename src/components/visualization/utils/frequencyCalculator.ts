import { DataPoint } from '../../../types/base';

export interface FrequencyStats {
  maxFrequency: number;
  hasOverlaps: boolean;
  frequencyMap: Map<string, number>;
}

export function calculatePointFrequencies(data: DataPoint[]): FrequencyStats {
    const frequencies = new Map<string, number>();
    
    data.filter(point => !point.excluded).forEach(point => {
      const key = `${point.satisfaction}-${point.loyalty}`;
      frequencies.set(key, (frequencies.get(key) || 0) + 1);
    });
  
    const maxFrequency = frequencies.size === 0 ? 0 : Math.max(...Array.from(frequencies.values()));
    
    return {
      maxFrequency,
      hasOverlaps: maxFrequency > 1,
      frequencyMap: frequencies
    };
  }

export interface SizeConfig {
  MIN_SIZE: number;
  MAX_SIZE: number;
  SCALE_FACTOR: number;
}

const SIZE_CONFIG: SizeConfig = {
  MIN_SIZE: 8,
  MAX_SIZE: 20,
  SCALE_FACTOR: 1.5
};

export function calculateDotSize(
  frequency: number, 
  maxFrequency: number,
  config: SizeConfig = SIZE_CONFIG
): number {
  if (maxFrequency <= 1) return config.MIN_SIZE;

  const scaledSize = config.MIN_SIZE + 
    ((frequency - 1) / (maxFrequency - 1)) * 
    (config.MAX_SIZE - config.MIN_SIZE) * 
    config.SCALE_FACTOR;

  return Math.max(config.MIN_SIZE, Math.min(config.MAX_SIZE, scaledSize));
}

export function shouldDisplayPoint(
  frequency: number,
  threshold: number,
  filterEnabled: boolean
): boolean {
  if (!filterEnabled) return true;
  return frequency >= threshold;
}

export function getFrequencyForPoint(
  satisfaction: number,
  loyalty: number,
  frequencyMap: Map<string, number>
): number {
  const key = `${satisfaction}-${loyalty}`;
  return frequencyMap.get(key) || 1;
}