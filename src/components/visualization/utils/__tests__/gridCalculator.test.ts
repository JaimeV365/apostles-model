import {
    calculateGrid,
    calculateLayout,
    validateMidpoint,
    determineQuadrant
  } from '../gridCalculator';
  import { GridConfig, GridDimensions, Midpoint, ScaleFormat } from '../../types';
  
  describe('gridCalculator', () => {
    describe('calculateGrid', () => {
      const defaultConfig: GridConfig = {
        satisfactionScale: '1-5' as ScaleFormat,
        loyaltyScale: '1-5' as ScaleFormat,
        midpoint: { sat: 3, loy: 3 },
        apostlesZoneSize: 1,
        terroristsZoneSize: 1
      };
  
      it('should calculate correct cell dimensions for 1-5 scale', () => {
        const grid = calculateGrid(defaultConfig);
        expect(grid.cellWidth).toBe(25); // 100 / (5-1)
        expect(grid.cellHeight).toBe(25);
      });
  
      it('should calculate correct cell dimensions for 1-7 scale', () => {
        const config: GridConfig = {
          ...defaultConfig,
          satisfactionScale: '1-7' as ScaleFormat,
          loyaltyScale: '1-7' as ScaleFormat
        };
        const grid = calculateGrid(config);
        expect(grid.cellWidth).toBe(16.666666666666668); // 100 / (7-1)
        expect(grid.cellHeight).toBe(16.666666666666668);
      });
  
      it('should set hasNearApostles based on available space', () => {
        // Not enough space
        const gridNoSpace = calculateGrid({
          ...defaultConfig,
          midpoint: { sat: 4, loy: 4 }
        });
        expect(gridNoSpace.hasNearApostles).toBe(false);
  
        // Enough space
        const gridWithSpace = calculateGrid({
          ...defaultConfig,
          midpoint: { sat: 2, loy: 2 }
        });
        expect(gridWithSpace.hasNearApostles).toBe(true);
      });
    });
  
    describe('validateMidpoint', () => {
      it('should validate midpoint within scale bounds', () => {
        // Valid midpoint
        expect(validateMidpoint(
          { sat: 3, loy: 3 },
          '1-5',
          '1-5'
        )).toBe(true);
  
        // Invalid - too low
        expect(validateMidpoint(
          { sat: 1, loy: 1 },
          '1-5',
          '1-5'
        )).toBe(false);
  
        // Invalid - too high
        expect(validateMidpoint(
          { sat: 5, loy: 5 },
          '1-5',
          '1-5'
        )).toBe(false);
      });
    });
  
    describe('determineQuadrant', () => {
      const dimensions: GridDimensions = {
        cellWidth: 25,
        cellHeight: 25,
        totalCols: 5,
        totalRows: 5,
        midpointCol: 2,
        midpointRow: 2,
        hasNearApostles: true
      };
  
      it('should correctly identify corner cases', () => {
        expect(determineQuadrant(5, 5, dimensions)).toBe('apostles');
        expect(determineQuadrant(1, 1, dimensions)).toBe('defectors');
      });
  
      it('should correctly identify quadrants', () => {
        // Test each quadrant
        expect(determineQuadrant(4, 4, dimensions)).toBe('apostles');
        expect(determineQuadrant(4, 2, dimensions)).toBe('mercenaries');
        expect(determineQuadrant(2, 4, dimensions)).toBe('hostages');
        expect(determineQuadrant(2, 2, dimensions)).toBe('defectors');
      });
    });
  
    describe('calculateLayout', () => {
      const dimensions: GridDimensions = {
        cellWidth: 25,
        cellHeight: 25,
        totalCols: 5,
        totalRows: 5,
        midpointCol: 2,
        midpointRow: 2,
        hasNearApostles: true
      };
  
      it('should calculate correct layout positions', () => {
        const layout = calculateLayout(dimensions);
  
        // Check apostles zone
        expect(layout.apostles.left).toBe('75%');
        expect(layout.apostles.bottom).toBe('75%');
  
        // Check terrorists zone
        expect(layout.terrorists.left).toBe('0%');
        expect(layout.terrorists.bottom).toBe('0%');
  
        // Check quadrant dimensions
        expect(layout.quadrants.loyalists.width).toBe('50%');
        expect(layout.quadrants.loyalists.height).toBe('50%');
      });
  
      it('should handle nearApostles zones when space available', () => {
        const layout = calculateLayout(dimensions);
        expect(layout.nearApostles).toBeTruthy();
        expect(layout.nearApostles?.length).toBe(3);
      });
  
      it('should not include nearApostles when space unavailable', () => {
        const noSpaceDimensions = {
          ...dimensions,
          hasNearApostles: false
        };
        const layout = calculateLayout(noSpaceDimensions);
        expect(layout.nearApostles).toBeNull();
      });
    });
  });