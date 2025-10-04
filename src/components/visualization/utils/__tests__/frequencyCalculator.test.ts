import { 
    calculatePointFrequencies,
    calculateDotSize,
    shouldDisplayPoint,
    getFrequencyForPoint
  } from '../frequencyCalculator';
  import { DataPoint } from '../../../../types/base';
  
  describe('frequencyCalculator', () => {
    const sampleData: DataPoint[] = [
      { id: '1', name: 'A', satisfaction: 4, loyalty: 4, group: 'test' },
      { id: '2', name: 'B', satisfaction: 4, loyalty: 4, group: 'test' },
      { id: '3', name: 'C', satisfaction: 3, loyalty: 3, group: 'test' },
      { id: '4', name: 'D', satisfaction: 3, loyalty: 3, group: 'test' },
      { id: '5', name: 'E', satisfaction: 5, loyalty: 5, group: 'test', excluded: true }
    ];
  
    describe('calculatePointFrequencies', () => {
      it('should calculate correct frequencies excluding excluded points', () => {
        const result = calculatePointFrequencies(sampleData);
        
        expect(result.maxFrequency).toBe(2);
        expect(result.hasOverlaps).toBe(true);
        expect(result.frequencyMap.get('4-4')).toBe(2);
        expect(result.frequencyMap.get('3-3')).toBe(2);
        expect(result.frequencyMap.get('5-5')).toBeUndefined();
      });
  
      it('should handle empty data set', () => {
        const result = calculatePointFrequencies([]);
        
        expect(result.maxFrequency).toBe(0);
        expect(result.hasOverlaps).toBe(false);
        expect(result.frequencyMap.size).toBe(0);
      });
    });
  
    describe('calculateDotSize', () => {
      it('should return minimum size when no frequency variation', () => {
        expect(calculateDotSize(1, 1)).toBe(8); // MIN_SIZE
      });
  
      it('should scale dot size based on frequency', () => {
        const size = calculateDotSize(2, 3);
        expect(size).toBeGreaterThan(8); // MIN_SIZE
        expect(size).toBeLessThan(20); // MAX_SIZE
      });
  
      it('should not exceed maximum size', () => {
        expect(calculateDotSize(10, 10)).toBe(20); // MAX_SIZE
      });
    });
  
    describe('shouldDisplayPoint', () => {
      it('should always display when filter disabled', () => {
        expect(shouldDisplayPoint(1, 2, false)).toBe(true);
        expect(shouldDisplayPoint(3, 2, false)).toBe(true);
      });
  
      it('should filter based on threshold when enabled', () => {
        expect(shouldDisplayPoint(1, 2, true)).toBe(false);
        expect(shouldDisplayPoint(2, 2, true)).toBe(true);
        expect(shouldDisplayPoint(3, 2, true)).toBe(true);
      });
    });
  
    describe('getFrequencyForPoint', () => {
      const { frequencyMap } = calculatePointFrequencies(sampleData);
  
      it('should return correct frequency for existing point', () => {
        expect(getFrequencyForPoint(4, 4, frequencyMap)).toBe(2);
        expect(getFrequencyForPoint(3, 3, frequencyMap)).toBe(2);
      });
  
      it('should return 1 for non-existing point', () => {
        expect(getFrequencyForPoint(1, 1, frequencyMap)).toBe(1);
      });
    });
  });