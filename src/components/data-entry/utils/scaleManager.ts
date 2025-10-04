import { ScaleFormat, ScaleState } from '../../../types';

export class ScaleManager {
  private static instance: ScaleManager;
  private defaultScale: ScaleFormat = '1-5';

  private constructor() {}

  public static getInstance(): ScaleManager {
    if (!ScaleManager.instance) {
      ScaleManager.instance = new ScaleManager();
    }
    return ScaleManager.instance;
  }

  public validateScales(
    currentState: ScaleState,
    importedSatisfactionScale: ScaleFormat,
    importedLoyaltyScale: ScaleFormat
  ): { isValid: boolean; error?: string } {
    if (currentState.isLocked) {
      if (importedSatisfactionScale !== currentState.satisfactionScale) {
        return {
          isValid: false,
          error: `CSV file uses different Satisfaction scale (${importedSatisfactionScale}) than currently selected (${currentState.satisfactionScale}). Please adjust the Satisfaction scale in your CSV file to match the current settings.`
        };
      }
      if (importedLoyaltyScale !== currentState.loyaltyScale) {
        return {
          isValid: false,
          error: `CSV file uses different Loyalty scale (${importedLoyaltyScale}) than currently selected (${currentState.loyaltyScale}). Please adjust the Loyalty scale in your CSV file to match the current settings.`
        };
      }
    }
    return { isValid: true };
  }

  public getDefaultScales(): ScaleState {
    return {
      satisfactionScale: this.defaultScale,
      loyaltyScale: this.defaultScale,
      isLocked: false
    };
  }

  public getNewScaleState(
    hasData: boolean,
    importedSatisfactionScale?: ScaleFormat,
    importedLoyaltyScale?: ScaleFormat
  ): ScaleState {
    if (!hasData && importedSatisfactionScale && importedLoyaltyScale) {
      return {
        satisfactionScale: importedSatisfactionScale,
        loyaltyScale: importedLoyaltyScale,
        isLocked: true
      };
    }

    if (!hasData) {
      return this.getDefaultScales();
    }

    return {
      satisfactionScale: importedSatisfactionScale || this.defaultScale,
      loyaltyScale: importedLoyaltyScale || this.defaultScale,
      isLocked: true
    };
  }

  public validateDataPoint(
    currentState: ScaleState,
    satisfaction: number,
    loyalty: number
  ): { isValid: boolean; error?: string } {
    const maxSatisfaction = parseInt(currentState.satisfactionScale.split('-')[1]);
    const maxLoyalty = parseInt(currentState.loyaltyScale.split('-')[1]);
  
    if (satisfaction > maxSatisfaction) {
      return {
        isValid: false,
        error: `Cannot add data with Satisfaction ${satisfaction} as current scale is ${currentState.satisfactionScale}. Delete all existing data first if you need to use a different scale.`
      };
    }
    if (loyalty > maxLoyalty) {
      return {
        isValid: false,
        error: `Cannot add data with Loyalty ${loyalty} as current scale is ${currentState.loyaltyScale}. Delete all existing data first if you need to use a different scale.`
      };
    }
    return { isValid: true };
  }
}

export const scaleManager = ScaleManager.getInstance();