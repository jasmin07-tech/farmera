import { CropCategory, FreshnessDetails } from '../types';

// Default TTL lookup table in days based on produce categories and specific crops
export const DEFAULT_CATEGORY_TTL_DAYS: Record<CropCategory, number> = {
  Greens: 2,
  Vegetables: 5,
  Fruits: 8,
  Dairy: 3,
  Grains: 90,
  Pulses: 180,
  'Masala/Spices': 365,
};

// Specific crop overrides for high accuracy
export const SPECIFIC_CROP_TTL_DAYS: Record<string, number> = {
  // Leafy Greens (2 days)
  greens: 2,
  spinach: 2,
  moringa: 3,
  coriander_leaves: 2,

  // Vegetables
  tomato: 5,
  brinjal: 6,
  eggplant: 6,
  onion: 15,
  carrot: 14,
  potato: 25,

  // Fruits
  banana: 6,
  papaya: 5,
  mango: 8,
  apple: 21,
  orange: 14,
  pomegranate: 20,
  coconut: 30,

  // Grains
  rice: 120,
  wheat: 180,
  corn: 60,
  maize: 60,

  // Pulses
  toor_dal: 180,
  chana: 180,
  chickpea: 180,
  moong: 180,
  green_gram: 180,

  // Spices
  turmeric: 365,
  chilli: 365,
  chili_powder: 365,
  coriander_seeds: 365,
  cumin: 365,
};

/**
 * Resolves the default TTL days for a crop based on name and category
 */
export function getDefaultTTL(cropName: string, category: CropCategory): number {
  const normalizedName = cropName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  for (const [key, days] of Object.entries(SPECIFIC_CROP_TTL_DAYS)) {
    if (normalizedName.includes(key)) {
      return days;
    }
  }

  return DEFAULT_CATEGORY_TTL_DAYS[category] || 7;
}

/**
 * Computes live freshness details based on harvest date and TTL days
 */
export function calculateFreshness(
  harvestDateStr: string,
  ttlDays: number = 7,
  referenceDate: Date = new Date()
): FreshnessDetails {
  const harvestTime = new Date(harvestDateStr).getTime();
  const now = referenceDate.getTime();
  const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
  const expiryTime = harvestTime + ttlMs;
  const remainingMs = expiryTime - now;

  const expiryDate = new Date(expiryTime).toISOString().split('T')[0];

  // If already expired or invalid
  if (remainingMs <= 0 || ttlMs <= 0) {
    return {
      score: 0,
      level: 'expired',
      badgeLabel: 'Expired (Auto-Archived)',
      expiryDate,
      daysRemaining: 0,
      hoursRemaining: 0,
      isExpired: true,
      isEligibleForDiscount: false,
    };
  }

  // Calculate percentage: 100% just harvested -> 0% at expiry
  const rawScore = (remainingMs / ttlMs) * 100;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  const daysRemaining = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const hoursRemaining = Math.max(1, Math.round(remainingMs / (60 * 60 * 1000)));

  if (score >= 70) {
    return {
      score,
      level: 'fresh',
      badgeLabel: 'Farm Fresh',
      expiryDate,
      daysRemaining,
      hoursRemaining,
      isExpired: false,
      isEligibleForDiscount: false,
    };
  } else if (score >= 30) {
    return {
      score,
      level: 'moderate',
      badgeLabel: 'Selling Fast / Still Fresh',
      expiryDate,
      daysRemaining,
      hoursRemaining,
      isExpired: false,
      isEligibleForDiscount: false,
    };
  } else {
    return {
      score,
      level: 'expiring_soon',
      badgeLabel: 'Expiring Soon',
      expiryDate,
      daysRemaining,
      hoursRemaining,
      isExpired: false,
      isEligibleForDiscount: true,
    };
  }
}

/**
 * Color class utilities for freshness badges
 */
export function getFreshnessBadgeClasses(level: FreshnessDetails['level']): {
  bg: string;
  text: string;
  border: string;
  ring: string;
  dot: string;
  progressColor: string;
} {
  switch (level) {
    case 'fresh':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        ring: 'ring-emerald-500/20',
        dot: 'bg-emerald-500',
        progressColor: 'bg-emerald-500',
      };
    case 'moderate':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        ring: 'ring-amber-500/20',
        dot: 'bg-amber-500',
        progressColor: 'bg-amber-500',
      };
    case 'expiring_soon':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-200',
        ring: 'ring-rose-500/20',
        dot: 'bg-rose-500 animate-ping',
        progressColor: 'bg-rose-500',
      };
    case 'expired':
    default:
      return {
        bg: 'bg-stone-100',
        text: 'text-stone-600',
        border: 'border-stone-300',
        ring: 'ring-stone-400/20',
        dot: 'bg-stone-400',
        progressColor: 'bg-stone-400',
      };
  }
}
