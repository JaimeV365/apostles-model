// src/components/visualization/utils/__tests__/ClassificationService.test.ts

import { 
  classifyDataPoint,
  isInApostlesZone,
  isInTerroristsZone,
  isInNearApostlesZone,
  isInNearTerroristsZone,
  calculateGridDimensions,
  getClassificationResult,
  calculateNormalizedPosition,
  getDisplayNameForQuadrant,
  getAvailableQuadrantOptions,
  ClassificationContext,
  GridDimensions,
  QuadrantType
} from '../ClassificationService';
import { DataPoint } from '@/types/base';

// Mock console.log to reduce test noise
const originalLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalLog;
});

describe('ClassificationService', () => {
  // Base test context for a 5x5 grid
  const createTestContext = (
    overrides: Partial<ClassificationContext> = {}
  ): ClassificationContext => {
    const baseContext: ClassificationContext = {
      gridDimensions: {
        cellWidth: 25,
        cellHeight: 25,
        totalCols: 5,
        totalRows: 5,
        midpointCol: 2,
        midpointRow: 2,
        hasNearApostles: true,
        scaleRanges: {
          satisfaction: { min: 1, max: 5 },
          loyalty: { min: 1, max: 5 }
        }
      },
      midpoint: { sat: 3, loy: 3 },
      apostlesZoneSize: 1,
      terroristsZoneSize: 1,
      isClassicModel: true,
      showNearApostles: true,
      satisfactionScale: '1-5',
      loyaltyScale: '1-5'
    };

    return { ...baseContext, ...overrides };
  };

  // Helper to create a basic data point
  const createDataPoint = (id: string, satisfaction: number, loyalty: number): DataPoint => ({
    id,
    name: `Point ${id}`,
    satisfaction,
    loyalty,
    group: 'default'
  });

  describe('classifyDataPoint', () => {
    it('should classify apostles zone correctly', () => {
      const context = createTestContext();
      const point = createDataPoint('test1', 5, 5);
      
      expect(classifyDataPoint(point, context)).toBe('apostles');
    });

    it('should classify terrorists zone correctly', () => {
      const context = createTestContext();
      const point = createDataPoint('test2', 1, 1);
      
      expect(classifyDataPoint(point, context)).toBe('terrorists');
    });

    it('should classify near-apostles zone correctly', () => {
      const context = createTestContext();
      
      // Test cases for near-apostles with apostlesZoneSize = 1
      expect(classifyDataPoint(createDataPoint('near1', 4, 5), context)).toBe('near_apostles');
      expect(classifyDataPoint(createDataPoint('near2', 5, 4), context)).toBe('near_apostles');
      expect(classifyDataPoint(createDataPoint('near3', 4, 4), context)).toBe('near_apostles');
    });

    it('should classify near-terrorists zone correctly', () => {
      const context = createTestContext();
      
      // Test cases for near-terrorists with terroristsZoneSize = 1
      expect(classifyDataPoint(createDataPoint('near1', 2, 1), context)).toBe('near_terrorists');
      expect(classifyDataPoint(createDataPoint('near2', 1, 2), context)).toBe('near_terrorists');
      expect(classifyDataPoint(createDataPoint('near3', 2, 2), context)).toBe('near_terrorists');
    });

    it('should classify standard quadrants correctly', () => {
      const context = createTestContext();
      
      // Loyalists (top-right quadrant)
      expect(classifyDataPoint(createDataPoint('loy1', 4, 3), context)).toBe('loyalists');
      expect(classifyDataPoint(createDataPoint('loy2', 3, 4), context)).toBe('loyalists');
      
      // Mercenaries (bottom-right quadrant)
      expect(classifyDataPoint(createDataPoint('mer1', 4, 2), context)).toBe('mercenaries');
      expect(classifyDataPoint(createDataPoint('mer2', 4, 1), context)).toBe('mercenaries');
      
      // Hostages (top-left quadrant)
      expect(classifyDataPoint(createDataPoint('hos1', 2, 4), context)).toBe('hostages');
      expect(classifyDataPoint(createDataPoint('hos2', 2, 5), context)).toBe('hostages');
      
      // Defectors (bottom-left quadrant)
      expect(classifyDataPoint(createDataPoint('def1', 2, 2), context)).toBe('defectors');
    });

    it('should respect manual assignments when provided', () => {
      const context = createTestContext({
        manualAssignments: new Map([
          ['manual1', 'loyalists'],
          ['manual2', 'mercenaries']
        ])
      });
      
      // Point would normally be a defector but is manually assigned to loyalists
      const point1 = createDataPoint('manual1', 2, 2);
      expect(classifyDataPoint(point1, context)).toBe('loyalists');
      
      // Point would normally be a hostage but is manually assigned to mercenaries
      const point2 = createDataPoint('manual2', 2, 4);
      expect(classifyDataPoint(point2, context)).toBe('mercenaries');
    });

    it('should respect near-apostles setting', () => {
      // First with near zones enabled
      const contextEnabled = createTestContext({ showNearApostles: true });
      expect(classifyDataPoint(createDataPoint('near1', 4, 4), contextEnabled)).toBe('near_apostles');
      
      // Now with near zones disabled
      const contextDisabled = createTestContext({ showNearApostles: false });
      // Should be classified as loyalist when near zones are disabled
      expect(classifyDataPoint(createDataPoint('near1', 4, 4), contextDisabled)).toBe('loyalists');
    });

    it('should handle different apostles zone sizes', () => {
      // With apostlesZoneSize = 2, more cells should be classified as apostles
      const context = createTestContext({ apostlesZoneSize: 2 });
      
      // These should all be apostles with size = 2
      expect(classifyDataPoint(createDataPoint('ap1', 5, 5), context)).toBe('apostles');
      expect(classifyDataPoint(createDataPoint('ap2', 4, 5), context)).toBe('apostles');
      expect(classifyDataPoint(createDataPoint('ap3', 5, 4), context)).toBe('apostles');
      expect(classifyDataPoint(createDataPoint('ap4', 4, 4), context)).toBe('apostles');
      
      // This should be near-apostles now (adjacent to the 2x2 zone)
      expect(classifyDataPoint(createDataPoint('near1', 3, 4), context)).toBe('near_apostles');
    });

    it('should handle different terrorists zone sizes', () => {
      // With terroristsZoneSize = 2, more cells should be classified as terrorists
      const context = createTestContext({ terroristsZoneSize: 2 });
      
      // These should all be terrorists with size = 2
      expect(classifyDataPoint(createDataPoint('t1', 1, 1), context)).toBe('terrorists');
      expect(classifyDataPoint(createDataPoint('t2', 2, 1), context)).toBe('terrorists');
      expect(classifyDataPoint(createDataPoint('t3', 1, 2), context)).toBe('terrorists');
      expect(classifyDataPoint(createDataPoint('t4', 2, 2), context)).toBe('terrorists');
      
      // This should be near-terrorists now (adjacent to the 2x2 zone)
      expect(classifyDataPoint(createDataPoint('near1', 3, 2), context)).toBe('near_terrorists');
    });

    it('should respect priority order for classification', () => {
      const context = createTestContext({
        midpoint: { sat: 2.5, loy: 2.5 } // Half grid position
      });
      
      // Special zones take priority over standard quadrants
      expect(classifyDataPoint(createDataPoint('t1', 1, 1), context)).toBe('terrorists');
      expect(classifyDataPoint(createDataPoint('a1', 5, 5), context)).toBe('apostles');
      
      // Near zones take priority over standard quadrants
      expect(classifyDataPoint(createDataPoint('near1', 4, 4), context)).toBe('near_apostles');
    });
  });

  describe('zone detection functions', () => {
    it('isInApostlesZone should correctly identify apostles zone members', () => {
      const context = createTestContext();
      
      // In apostles zone
      expect(isInApostlesZone(createDataPoint('a1', 5, 5), context)).toBe(true);
      
      // Not in apostles zone
      expect(isInApostlesZone(createDataPoint('a2', 4, 4), context)).toBe(false);
      
      // With larger apostles zone
      const largerContext = createTestContext({ apostlesZoneSize: 2 });
      expect(isInApostlesZone(createDataPoint('a3', 4, 4), largerContext)).toBe(true);
    });

    it('isInTerroristsZone should correctly identify terrorists zone members', () => {
      const context = createTestContext();
      
      // In terrorists zone
      expect(isInTerroristsZone(createDataPoint('t1', 1, 1), context)).toBe(true);
      
      // Not in terrorists zone
      expect(isInTerroristsZone(createDataPoint('t2', 2, 2), context)).toBe(false);
      
      // With larger terrorists zone
      const largerContext = createTestContext({ terroristsZoneSize: 2 });
      expect(isInTerroristsZone(createDataPoint('t3', 2, 2), largerContext)).toBe(true);
    });

    it('isInNearApostlesZone should correctly identify near-apostles zone members', () => {
      const context = createTestContext();
      
      // In near-apostles zone
      expect(isInNearApostlesZone(createDataPoint('na1', 4, 5), context)).toBe(true);
      expect(isInNearApostlesZone(createDataPoint('na2', 5, 4), context)).toBe(true);
      expect(isInNearApostlesZone(createDataPoint('na3', 4, 4), context)).toBe(true);
      
      // Not in near-apostles zone
      expect(isInNearApostlesZone(createDataPoint('na4', 3, 3), context)).toBe(false);
      
      // Should not be near-apostles if it's in apostles
      expect(isInNearApostlesZone(createDataPoint('na5', 5, 5), context)).toBe(false);
      
      // With larger apostles zone, near zone should shift
      const largerContext = createTestContext({ apostlesZoneSize: 2 });
      expect(isInNearApostlesZone(createDataPoint('na6', 3, 4), largerContext)).toBe(true);
    });

    it('isInNearTerroristsZone should correctly identify near-terrorists zone members', () => {
      const context = createTestContext();
      
      // In near-terrorists zone
      expect(isInNearTerroristsZone(createDataPoint('nt1', 2, 1), context)).toBe(true);
      expect(isInNearTerroristsZone(createDataPoint('nt2', 1, 2), context)).toBe(true);
      expect(isInNearTerroristsZone(createDataPoint('nt3', 2, 2), context)).toBe(true);
      
      // Not in near-terrorists zone
      expect(isInNearTerroristsZone(createDataPoint('nt4', 3, 3), context)).toBe(false);
      
      // Should not be near-terrorists if it's in terrorists
      expect(isInNearTerroristsZone(createDataPoint('nt5', 1, 1), context)).toBe(false);
      
      // With larger terrorists zone, near zone should shift
      const largerContext = createTestContext({ terroristsZoneSize: 2 });
      expect(isInNearTerroristsZone(createDataPoint('nt6', 3, 2), largerContext)).toBe(true);
    });
  });

  describe('getDisplayNameForQuadrant', () => {
    it('should return classic terminology when isClassicModel is true', () => {
      expect(getDisplayNameForQuadrant('apostles', true)).toBe('Apostles');
      expect(getDisplayNameForQuadrant('terrorists', true)).toBe('Terrorists');
      expect(getDisplayNameForQuadrant('near_apostles', true)).toBe('Near-Apostles');
      expect(getDisplayNameForQuadrant('near_terrorists', true)).toBe('Near-Terrorists');
    });

    it('should return modern terminology when isClassicModel is false', () => {
      expect(getDisplayNameForQuadrant('apostles', false)).toBe('Advocates');
      expect(getDisplayNameForQuadrant('terrorists', false)).toBe('Trolls');
      expect(getDisplayNameForQuadrant('near_apostles', false)).toBe('Near-Advocates');
      expect(getDisplayNameForQuadrant('near_terrorists', false)).toBe('Near-Trolls');
    });

    it('should return consistent terminology for standard quadrants', () => {
      // Standard quadrants should be the same regardless of isClassicModel
      ['loyalists', 'mercenaries', 'hostages', 'defectors'].forEach(quadrant => {
        const classicName = getDisplayNameForQuadrant(quadrant as QuadrantType, true);
        const modernName = getDisplayNameForQuadrant(quadrant as QuadrantType, false);
        expect(classicName).toBe(modernName);
      });
    });
  });

  describe('calculateNormalizedPosition', () => {
    it('should correctly normalize positions for 1-5 scale', () => {
      const result = calculateNormalizedPosition(
        createDataPoint('p1', 3, 4),
        '1-5',
        '1-5'
      );
      
      expect(result.normalizedSatisfaction).toBeCloseTo(50);
      expect(result.normalizedLoyalty).toBeCloseTo(75);
    });

    it('should correctly normalize positions for 1-7 scale', () => {
      const result = calculateNormalizedPosition(
        createDataPoint('p1', 4, 6),
        '1-7',
        '1-7'
      );
      
      expect(result.normalizedSatisfaction).toBeCloseTo(50);
      expect(result.normalizedLoyalty).toBeCloseTo(83.33, 1);
    });

    it('should correctly normalize positions for mixed scales', () => {
      const result = calculateNormalizedPosition(
        createDataPoint('p1', 3, 4),
        '1-5',
        '1-7'
      );
      
      expect(result.normalizedSatisfaction).toBeCloseTo(50);
      expect(result.normalizedLoyalty).toBeCloseTo(50);
    });
  });

  describe('calculateGridDimensions', () => {
    it('should calculate correct grid dimensions for 1-5 scale', () => {
      const dimensions = calculateGridDimensions(
        '1-5',
        '1-5',
        { sat: 3, loy: 3 }
      );
      
      expect(dimensions.cellWidth).toBeCloseTo(25);
      expect(dimensions.cellHeight).toBeCloseTo(25);
      expect(dimensions.totalCols).toBe(5);
      expect(dimensions.totalRows).toBe(5);
      expect(dimensions.midpointCol).toBe(2);
      expect(dimensions.midpointRow).toBe(2);
      expect(dimensions.hasNearApostles).toBe(true);
    });

    it('should handle different scales correctly', () => {
      const dimensions = calculateGridDimensions(
        '1-7',
        '1-10',
        { sat: 4, loy: 5 }
      );
      
      expect(dimensions.totalCols).toBe(7);
      expect(dimensions.totalRows).toBe(10);
      expect(dimensions.midpointCol).toBe(3);
      expect(dimensions.midpointRow).toBe(4);
    });

    it('should calculate hasNearApostles correctly based on space', () => {
      // Near apostles needs at least 3 cells from midpoint to edge
      
      // This should have enough space
      const dimensionsWithSpace = calculateGridDimensions(
        '1-10',
        '1-10',
        { sat: 3, loy: 3 }
      );
      expect(dimensionsWithSpace.hasNearApostles).toBe(true);
      
      // This should not have enough space
      const dimensionsWithoutSpace = calculateGridDimensions(
        '1-5',
        '1-5',
        { sat: 4, loy: 4 }
      );
      expect(dimensionsWithoutSpace.hasNearApostles).toBe(false);
    });
  });

  describe('getAvailableQuadrantOptions', () => {
    it('should return all options for points at exact midpoint', () => {
      const context = createTestContext();
      const point = createDataPoint('mid', 3, 3); // Exactly at midpoint
      
      const options = getAvailableQuadrantOptions(
        point,
        context.gridDimensions,
        context.midpoint
      );
      
      expect(options.length).toBe(4);
      expect(options.map(o => o.group)).toContain('Loyalists');
      expect(options.map(o => o.group)).toContain('Mercenaries');
      expect(options.map(o => o.group)).toContain('Hostages');
      expect(options.map(o => o.group)).toContain('Defectors');
    });

    it('should return correct options for points on horizontal midpoint line', () => {
      const context = createTestContext();
      
      // Point on horizontal midpoint, right side
      const point1 = createDataPoint('h1', 4, 3);
      const options1 = getAvailableQuadrantOptions(
        point1,
        context.gridDimensions,
        context.midpoint
      );
      
      expect(options1.length).toBe(2);
      expect(options1.map(o => o.group)).toContain('Loyalists');
      expect(options1.map(o => o.group)).toContain('Mercenaries');
      
      // Point on horizontal midpoint, left side
      const point2 = createDataPoint('h2', 2, 3);
      const options2 = getAvailableQuadrantOptions(
        point2,
        context.gridDimensions,
        context.midpoint
      );
      
      expect(options2.length).toBe(2);
      expect(options2.map(o => o.group)).toContain('Hostages');
      expect(options2.map(o => o.group)).toContain('Defectors');
    });

    it('should return correct options for points on vertical midpoint line', () => {
      const context = createTestContext();
      
      // Point on vertical midpoint, top side
      const point1 = createDataPoint('v1', 3, 4);
      const options1 = getAvailableQuadrantOptions(
        point1,
        context.gridDimensions,
        context.midpoint
      );
      
      expect(options1.length).toBe(2);
      expect(options1.map(o => o.group)).toContain('Loyalists');
      expect(options1.map(o => o.group)).toContain('Hostages');
      
      // Point on vertical midpoint, bottom side
      const point2 = createDataPoint('v2', 3, 2);
      const options2 = getAvailableQuadrantOptions(
        point2,
        context.gridDimensions,
        context.midpoint
      );
      
      expect(options2.length).toBe(2);
      expect(options2.map(o => o.group)).toContain('Mercenaries');
      expect(options2.map(o => o.group)).toContain('Defectors');
    });

    it('should return empty array for points not on grid intersection', () => {
      const context = createTestContext();
      const point = createDataPoint('non-inter', 4, 4); // Not on intersection
      
      const options = getAvailableQuadrantOptions(
        point,
        context.gridDimensions,
        context.midpoint
      );
      
      expect(options.length).toBe(0);
    });
  });

  describe('getClassificationResult', () => {
    it('should return complete classification information', () => {
      const context = createTestContext();
      const point = createDataPoint('test', 5, 5); // Apostles
      
      const result = getClassificationResult(point, context);
      
      expect(result.quadrantType).toBe('apostles');
      expect(result.displayName).toBe('Apostles');
      expect(result.color).toBe('#4CAF50');
      expect(result.isSpecialZone).toBe(true);
      expect(result.isNearZone).toBe(false);
    });

    it('should respect isClassicModel setting for display names', () => {
      const classicContext = createTestContext({ isClassicModel: true });
      const modernContext = createTestContext({ isClassicModel: false });
      
      const point = createDataPoint('test', 5, 5); // Apostles
      
      const classicResult = getClassificationResult(point, classicContext);
      const modernResult = getClassificationResult(point, modernContext);
      
      expect(classicResult.displayName).toBe('Apostles');
      expect(modernResult.displayName).toBe('Advocates');
    });
  });

 // Additional integration tests to check for consistency between functions
  describe('classification consistency', () => {
    it('should have consistent classification between individual checks and main classify function', () => {
      const context = createTestContext();
      
      // Test several points to ensure the individual zone check functions
      // are consistent with the main classification function
      
      // Apostles point
      const apostlePoint = createDataPoint('a1', 5, 5);
      expect(isInApostlesZone(apostlePoint, context)).toBe(true);
      expect(classifyDataPoint(apostlePoint, context)).toBe('apostles');
      
      // Terrorists point
      const terroristPoint = createDataPoint('t1', 1, 1);
      expect(isInTerroristsZone(terroristPoint, context)).toBe(true);
      expect(classifyDataPoint(terroristPoint, context)).toBe('terrorists');
      
      // Near-apostles point
      const nearApostlePoint = createDataPoint('na1', 4, 4);
      expect(isInNearApostlesZone(nearApostlePoint, context)).toBe(true);
      expect(classifyDataPoint(nearApostlePoint, context)).toBe('near_apostles');
      
      // Near-terrorists point
      const nearTerroristPoint = createDataPoint('nt1', 2, 2);
      expect(isInNearTerroristsZone(nearTerroristPoint, context)).toBe(true);
      expect(classifyDataPoint(nearTerroristPoint, context)).toBe('near_terrorists');
    });
  
    it('correctly classifies apostles and near-apostles points for 1x1 zone size', () => {
      // Helper function to create test data points
      const makePoint = (id: string, sat: number, loy: number): DataPoint => ({
        id,
        name: `Test Point ${id}`,
        satisfaction: sat,
        loyalty: loy,
        group: 'test'
      });
      
      const context: ClassificationContext = {
        gridDimensions: {
          cellWidth: 25,
          cellHeight: 10,
          totalCols: 5,
          totalRows: 10,
          midpointCol: 2.5,
          midpointRow: 5,
          hasNearApostles: true,
          scaleRanges: {
            satisfaction: { min: 1, max: 5 },
            loyalty: { min: 1, max: 10 }
          }
        },
        midpoint: { sat: 3, loy: 5 },
        apostlesZoneSize: 1,
        terroristsZoneSize: 1,
        isClassicModel: true,
        showNearApostles: true,
        satisfactionScale: '1-5',
        loyaltyScale: '1-10'
      };
      
      // Apostles zone - 2x2 area in top right
      expect(classifyDataPoint(makePoint('ap1', 5, 10), context)).toBe('apostles');
      expect(classifyDataPoint(makePoint('ap2', 4, 10), context)).toBe('apostles');
      expect(classifyDataPoint(makePoint('ap3', 5, 9), context)).toBe('apostles');
      expect(classifyDataPoint(makePoint('ap4', 4, 9), context)).toBe('apostles');
      
      // Near-apostles zone around apostles
      expect(classifyDataPoint(makePoint('near1', 3, 10), context)).toBe('near_apostles');
      expect(classifyDataPoint(makePoint('near2', 3, 9), context)).toBe('near_apostles');
      expect(classifyDataPoint(makePoint('near3', 3, 8), context)).toBe('near_apostles');
      expect(classifyDataPoint(makePoint('near4', 4, 8), context)).toBe('near_apostles');
      expect(classifyDataPoint(makePoint('near5', 5, 8), context)).toBe('near_apostles');
    });
  });
});

