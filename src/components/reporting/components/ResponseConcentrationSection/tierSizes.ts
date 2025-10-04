export const TIER_SIZES = {
  tier1: 1,
  tier2: 0.9,
  tier3: 0.85
} as const;

export type TierNumber = 1 | 2 | 3;

// Helper function to get tier size
export const getTierSize = (tier: TierNumber): number => {
  switch (tier) {
    case 1: return TIER_SIZES.tier1;
    case 2: return TIER_SIZES.tier2;
    case 3: return TIER_SIZES.tier3;
    default: return TIER_SIZES.tier1;
  }
};