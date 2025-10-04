import {
    normalizeToPercentage,
    denormalizeFromPercentage,
    calculateMidpointPosition,
    getValidMidpoint,
    calculateScaleMarkers,
    normalizePointPosition
  } from '../positionNormalizer';
  import { ScaleFormat } from '../../../../types/base';
  import { GridDimensions, Midpoint } from '../../types';
  
  describe('positionNormalizer', () => {
    describe('normalizeToPercentage', () => {
      it('should convert scale values to percentages', () => {
        expect(normalizeToPercentage(1, '1-5' as ScaleFormat)).toBe(0);
        expect(normalizeToPercentage(3, '1-5' as ScaleFormat)).toBe(50);
        expect(normalizeToPercentage(5, '1-5' as ScaleFormat)).toBe(100);
        expect(normalizeToPercentage(4, '1-7' as ScaleFormat)).toBe(50);
      });
    });
  
    describe('denormalizeFromPercentage', () => {
      it('should convert percentages back to scale values', () => {
        expect(denormalizeFromPercentage(0, '1-5' as ScaleFormat)).toBe(1);
        expect(denormalizeFromPercentage(50, '1-5' as ScaleFormat)).toBe(3);
        expect(denormalizeFromPercentage(100, '1-5' as ScaleFormat)).toBe(5);
      });
    });
  
    describe('calculateMidpointPosition', () => {
      const dimensions: GridDimensions = {
        cellWidth: 25,
        cellHeight: 25,
        totalCols: 5,
        totalRows: 5,
        midpointCol: 2,
        midpointRow: 2,
        hasNearApostles: true
      };
  
      it('should calculate correct position percentages', () => {
        const midpoint: Midpoint = { sat: 3, loy: 3 };
        const position = calculateMidpointPosition(midpoint, dimensions);
        expect(position.left).toBe('50%');
        expect(position.bottom).toBe('50%');
      });
    });
  
    describe('getValidMidpoint', () => {
      const containerRect = {
        left: 0,
        right: 400,
        top: 0,
        bottom: 400,
        width: 400,
        height: 400,
        x: 0,
        y: 0,
        toJSON: () => {}
      };
  
      it('should constrain midpoint within valid bounds', () => {
        const midpoint = getValidMidpoint(
          200, 200,
          containerRect,
          '1-5' as ScaleFormat,
          '1-5' as ScaleFormat
        );
        
        expect(midpoint.sat).toBeGreaterThan(1);
        expect(midpoint.sat).toBeLessThan(5);
        expect(midpoint.loy).toBeGreaterThan(1);
        expect(midpoint.loy).toBeLessThan(5);
      });
  
      it('should snap to half grid positions', () => {
        const midpoint = getValidMidpoint(
          200, 200,
          containerRect,
          '1-5' as ScaleFormat,
          '1-5' as ScaleFormat
        );
        
        expect(midpoint.sat % 0.5).toBe(0);
        expect(midpoint.loy % 0.5).toBe(0);
      });
    });
  
    describe('calculateScaleMarkers', () => {
      it('should generate correct horizontal markers', () => {
        const markers = calculateScaleMarkers('1-5' as ScaleFormat, true);
        expect(markers).toHaveLength(5);
        expect(markers[0].position).toBe('0%');
        expect(markers[4].position).toBe('100%');
      });
  
      it('should generate correct vertical markers', () => {
        const markers = calculateScaleMarkers('1-5' as ScaleFormat, false);
        expect(markers).toHaveLength(5);
        expect(markers[0].position).toBe('100%');
        expect(markers[4].position).toBe('0%');
      });
    });
  
    describe('normalizePointPosition', () => {
      it('should normalize point coordinates to percentages', () => {
        const position = normalizePointPosition(
          3, 3,
          '1-5' as ScaleFormat,
          '1-5' as ScaleFormat
        );
        
        expect(position.normalizedSatisfaction).toBe(50);
        expect(position.normalizedLoyalty).toBe(50);
      });
    });
  });