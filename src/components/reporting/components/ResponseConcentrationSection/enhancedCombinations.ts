import { getTierSize, type TierNumber } from './tierSizes';
// Enhanced combinations that support custom frequency thresholds and multi-tier visualization
interface Combination {
  satisfaction: number;
  loyalty: number;
  count: number;
  percentage: number;
}

interface CombinationWithTier extends Combination {
  tier?: number; // 1 = highest frequency, 2 = secondary, 3 = tertiary
  opacity?: number; // For visual differentiation between tiers
  size?: number; // For visual size differentiation
}

interface EnhancedCombinationOptions {
  frequencyThreshold?: number; // Custom minimum frequency
  showTiers?: boolean; // Enable multi-tier visualization
  maxTiers?: number; // Number of tiers to show (1-3)
  isPremium?: boolean; // Premium feature access
}

const getEnhancedCombinations = (
  data: any[], 
  options: EnhancedCombinationOptions = {}
): CombinationWithTier[] => {
  if (!data || data.length === 0) return [];
  
  const {
    frequencyThreshold = 2,
    showTiers = false,
    maxTiers = 2,
    isPremium = false
  } = options;
  
  const combinationMap = new Map<string, { count: number, satisfaction: number, loyalty: number }>();
  
  // Count combinations
  data.filter(d => !d.excluded).forEach(d => {
    const key = `${d.satisfaction}-${d.loyalty}`;
    if (!combinationMap.has(key)) {
      combinationMap.set(key, {
        count: 1,
        satisfaction: d.satisfaction,
        loyalty: d.loyalty
      });
    } else {
      const current = combinationMap.get(key)!;
      current.count++;
    }
  });

  // Convert to combinations array
  const totalFilteredData = data.filter(d => !d.excluded).length;
  const allCombinations: CombinationWithTier[] = Array.from(combinationMap.values())
    .map(combo => ({
      satisfaction: combo.satisfaction,
      loyalty: combo.loyalty,
      count: combo.count,
      percentage: (combo.count / totalFilteredData) * 100
    }))
    .sort((a, b) => b.count - a.count); // Sort by frequency

  if (allCombinations.length === 0) return [];

  const maxCount = allCombinations[0].count;
  
  // Apply frequency threshold filter
  let filteredCombinations = allCombinations.filter(combo => 
    combo.count >= frequencyThreshold
  );

  // If premium and multi-tier is enabled
  if (isPremium && showTiers && filteredCombinations.length > 0) {
    return applyTierLogic(filteredCombinations, maxCount, maxTiers);
  }

  // Standard filtering logic (existing behavior enhanced)
  if (maxCount >= 3) {
    // High-frequency combinations: show top tier only
    const threshold = Math.max(3, maxCount * 0.8);
    return filteredCombinations
      .filter(combo => combo.count >= threshold)
      .slice(0, 6)
      .map(combo => ({ ...combo, tier: 1, opacity: 1, size: 1 }));
  } else if (maxCount >= 2) {
    // Moderate frequency: show combinations that appear 2+ times
    return filteredCombinations
      .filter(combo => combo.count >= Math.max(2, frequencyThreshold))
      .slice(0, 8)
      .map(combo => ({ ...combo, tier: 1, opacity: 1, size: 1 }));
  } else {
    // Low frequency: fall back to top combinations
    return filteredCombinations
      .slice(0, 2)
      .map(combo => ({ ...combo, tier: 1, opacity: 1, size: 1 }));
  }
};

const applyTierLogic = (
  combinations: CombinationWithTier[], 
  maxCount: number, 
  maxTiers: number
): CombinationWithTier[] => {
  const result: CombinationWithTier[] = [];
  
 // Get unique frequency levels and sort them descending
  const uniqueFrequencies = Array.from(new Set(combinations.map(c => c.count))).sort((a, b) => b - a);
  
  // Use actual frequency levels as tier thresholds instead of percentages
  const tierThresholds = uniqueFrequencies.slice(0, 3); // Take up to 3 unique frequencies

  // Assign tiers and visual properties
  for (let tier = 1; tier <= maxTiers && tier <= tierThresholds.length; tier++) {
    const currentFrequency = tierThresholds[tier - 1];
    const tierCombinations = combinations.filter(combo => combo.count === currentFrequency);

   

    // Add visual properties for each tier
    const tierWithVisuals = tierCombinations.map(combo => ({
      ...combo,
      tier,
      opacity: tier === 1 ? 1 : tier === 2 ? 0.7 : 0.5,
      size: getTierSize(tier as TierNumber)
    }));

    result.push(...tierWithVisuals);

    // Limit combinations per tier to avoid clutter
    const maxPerTier = tier === 1 ? 6 : tier === 2 ? 4 : 3;
    if (result.length >= maxPerTier * tier) {
      break;
    }
  }

  return result.slice(0, Math.min(15, combinations.length)); // Overall limit
};

export { getEnhancedCombinations, type CombinationWithTier, type EnhancedCombinationOptions };