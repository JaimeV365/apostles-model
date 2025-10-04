import { scaleManager } from '../../../data-entry/utils/scaleManager';
import { ScaleFormat, ScaleState } from '../../../../types/base';

describe('ScaleManager', () => {
  describe('validateScales', () => {
    it('should validate matching scales when locked', () => {
      const currentState: ScaleState = {
        satisfactionScale: '1-5' as ScaleFormat,
        loyaltyScale: '1-5' as ScaleFormat,
        isLocked: true
      };

      const result = scaleManager.validateScales(
        currentState,
        '1-5' as ScaleFormat,
        '1-5' as ScaleFormat
      );

      expect(result.isValid).toBe(true);
    });

    it('should reject mismatched satisfaction scale when locked', () => {
      const currentState: ScaleState = {
        satisfactionScale: '1-5' as ScaleFormat,
        loyaltyScale: '1-5' as ScaleFormat,
        isLocked: true
      };

      const result = scaleManager.validateScales(
        currentState,
        '1-7' as ScaleFormat,
        '1-5' as ScaleFormat
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('different Satisfaction scale');
    });

    it('should reject mismatched loyalty scale when locked', () => {
      const currentState: ScaleState = {
        satisfactionScale: '1-5' as ScaleFormat,
        loyaltyScale: '1-5' as ScaleFormat,
        isLocked: true
      };

      const result = scaleManager.validateScales(
        currentState,
        '1-5' as ScaleFormat,
        '1-7' as ScaleFormat
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('different Loyalty scale');
    });

    it('should allow any scale when unlocked', () => {
      const currentState: ScaleState = {
        satisfactionScale: '1-5' as ScaleFormat,
        loyaltyScale: '1-5' as ScaleFormat,
        isLocked: false
      };

      const result = scaleManager.validateScales(
        currentState,
        '1-7' as ScaleFormat,
        '1-10' as ScaleFormat
      );

      expect(result.isValid).toBe(true);
    });
  });
});