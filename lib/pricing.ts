export interface PricingConfig {
  advertiserPrice: number;
  userEarn: number;
  platformFee: number;
}

/**
 * Mapping of platform/category IDs to their respective pricing models.
 * Ensure these IDs match the ones used in the advertisement forms.
 */
export const TASK_PRICING: Record<string, PricingConfig> = {
  // SOCIAL MICRO TASKS
  "instagram": { advertiserPrice: 30, userEarn: 20, platformFee: 10 },
  "tiktok": { advertiserPrice: 30, userEarn: 20, platformFee: 10 },
  "twitter": { advertiserPrice: 30, userEarn: 20, platformFee: 10 },
  "facebook": { advertiserPrice: 30, userEarn: 20, platformFee: 10 },
  
  // HIGH ENGAGEMENT SOCIAL
  "youtube": { advertiserPrice: 50, userEarn: 30, platformFee: 20 },
  "whatsapp": { advertiserPrice: 100, userEarn: 50, platformFee: 50 },
  "telegram": { advertiserPrice: 100, userEarn: 50, platformFee: 50 },
  
  // CPA - MEDIUM VALUE
  "website": { advertiserPrice: 150, userEarn: 100, platformFee: 50 },
  "app_install": { advertiserPrice: 150, userEarn: 100, platformFee: 50 },
  
  // CPA - HIGH VALUE
  "betting": { advertiserPrice: 400, userEarn: 270, platformFee: 130 },
  "loan": { advertiserPrice: 600, userEarn: 400, platformFee: 200 },
  "bank": { advertiserPrice: 600, userEarn: 400, platformFee: 200 },

  // LEGACY NAMES (Fallback support)
  "App Download": { advertiserPrice: 150, userEarn: 100, platformFee: 50 },
  "Website Registration": { advertiserPrice: 150, userEarn: 100, platformFee: 50 },
};

/**
 * Helper to fetch the pricing config for a specific platform ID.
 */
export const getPricingForCategory = (category: string): PricingConfig => {
  const cleanCategory = category?.toLowerCase();
  return TASK_PRICING[cleanCategory] || TASK_PRICING[category] || { advertiserPrice: 200, userEarn: 100, platformFee: 100 };
};
