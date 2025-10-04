import {
    calculateMaxZoneSize,
    validateZoneSize,
    calculateZoneResize,
    getZoneStyles,
    isInSpecialZone
  } from '../zoneManager';
  import { GridDimensions } from '../../types';
  
  describe('zoneManager', () => {
    const dimensions: GridDimensions = {
      cellWidth: 25,
      cellHeight: 25,
      totalCols: 5,
      totalRows: 5,
      midpointCol: 2,
      midpointRow: 2,
      hasNearApostles: true
    };
  
    describe('calculateMaxZoneSize', () => {
      it('should limit zone size to 30% of grid', () => {
        const maxSize = calculateMaxZoneSize(dimensions);
        expect(maxSize).toBe(1); // 5 * 0.3 rounded down
      });
    });
  
    describe('validateZoneSize', () => {
      it('should constrain size within valid range', () => {
        expect(validateZoneSize(0, 2)).toBe(1); // MIN_CELLS
        expect(validateZoneSize(3, 2)).toBe(2); // maxSize
        expect(validateZoneSize(2, 2)).toBe(2); // valid size
      });
    });
  
    describe('calculateZoneResize', () => {
      it('should calculate new apostles zone size', () => {
        const newSize = calculateZoneResize(
          'apostles',
          1,
          { x: 1, y: 1 },
          dimensions
        );
        expect(newSize).toBeGreaterThanOrEqual(1);
        expect(newSize).toBeLessThanOrEqual(2);
      });
  
      it('should calculate new terrorists zone size', () => {
        const newSize = calculateZoneResize(
          'terrorists',
          1,
          { x: 1, y: 1 },
          dimensions
        );
        expect(newSize).toBeGreaterThanOrEqual(1);
        expect(newSize).toBeLessThanOrEqual(2);
      });
    });
  
    describe('getZoneStyles', () => {
      it('should style apostles zone correctly', () => {
        const styles = getZoneStyles('apostles', 1, dimensions);
        expect(styles.right).toBe('0');
        expect(styles.top).toBe('0');
        expect(styles.width).toBe('25%');
        expect(styles.height).toBe('25%');
      });
  
      it('should style terrorists zone correctly', () => {
        const styles = getZoneStyles('terrorists', 1, dimensions);
        expect(styles.left).toBe('0');
        expect(styles.bottom).toBe('0');
        expect(styles.width).toBe('25%');
        expect(styles.height).toBe('25%');
      });
    });
  
    describe('isInSpecialZone', () => {
      it('should detect points in apostles zone', () => {
        expect(isInSpecialZone(5, 5, 'apostles', 1, dimensions)).toBe(true);
        expect(isInSpecialZone(3, 3, 'apostles', 1, dimensions)).toBe(false);
      });
  
      it('should detect points in terrorists zone', () => {
        expect(isInSpecialZone(1, 1, 'terrorists', 1, dimensions)).toBe(true);
        expect(isInSpecialZone(3, 3, 'terrorists', 1, dimensions)).toBe(false);
      });
    });
  });