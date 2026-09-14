export type UserRole = 'farmer' | 'customer' | 'bulk_buyer';

export type Language = 'en' | 'ta' | 'hi';

export interface LivePhotoMetadata {
  photoUrl: string;
  capturedAt: string; // ISO string
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  isLiveVerified: boolean;
  distanceFromFarmMeters?: number;
  verificationReason?: string;
  source: 'live_camera' | 'upload_fallback';
}

export type FreshnessBadgeLevel = 'fresh' | 'moderate' | 'expiring_soon' | 'expired';

export interface FreshnessDetails {
  score: number; // 0 to 100
  level: FreshnessBadgeLevel;
  badgeLabel: string; // "Farm Fresh" | "Selling Fast / Still Fresh" | "Expiring Soon" | "Expired"
  expiryDate: string; // ISO date
  daysRemaining: number;
  hoursRemaining: number;
  isExpired: boolean;
  isEligibleForDiscount: boolean;
}

export interface UserAddress {
  villageOrTown: string;
  district: string;
  state: string;
  pincode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  farmerProfileId?: string;
  deliveryAddress?: UserAddress;
}

export interface CropJourneyUpdate {
  id: string;
  stage: 'Sowing' | 'Growth' | 'Flowering' | 'Pre-Harvest' | 'Harvested' | 'Packaging';
  title: string;
  description: string;
  date: string;
  photoUrl: string;
  videoUrl?: string;
  inputsUsed: string; // e.g. "Panchagavya organic fertilizer, drip irrigation"
  photoMetadata?: LivePhotoMetadata;
}

export interface FarmerProfile {
  id: string;
  name: string;
  farmName: string;
  location: string;
  villageOrTown?: string;
  district: string;
  state: string;
  pincode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  fpoId: string;
  fpoName: string;
  isVerified: boolean;
  verificationDate?: string;
  experienceYears: number;
  farmSizeAcres: number;
  soilType: string;
  farmingPhilosophy: string;
  phone: string;
  profilePhoto: string;
  coverPhoto: string;
  qrCodeUrl?: string;
  totalOrdersDelivered: number;
  rating: number;
  reviewCount: number;
  journeyUpdates: CropJourneyUpdate[];
}

export type CropCategory =
  | 'Fruits'
  | 'Vegetables'
  | 'Grains'
  | 'Pulses'
  | 'Masala/Spices'
  | 'Greens'
  | 'Dairy';

export interface CropListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  location: string;
  district: string;
  name: string;
  tamilName?: string;
  category: CropCategory;
  quantityAvailable: number; // in kg or units
  unit: string; // 'kg' | 'bunch' | 'dozen' | 'liter'
  pricePerUnit: number; // in INR
  marketPriceComparison: number; // what supermarkets / middlemen charge
  harvestDate: string;
  ttlDays: number; // Time to live in days
  farmingMethod: 'Organic' | 'Conventional';
  organicCertNumber?: string;
  description: string;
  photos: string[];
  photoMetadata?: LivePhotoMetadata[];
  isVerified: boolean;
  shelfLifeDays: number;
  minOrderQuantity: number;
  bulkDiscountPercent?: number;
  discountAppliedPercent?: number; // Spoilage-prevention discount
}

export interface CartItem {
  crop: CropListing;
  quantity: number;
}

export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface RegularCustomerOffer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'flat' | 'free_item' | 'free_delivery';
  discountValue: number; // e.g. 10 for 10%, 100 for ₹100
  minOrderValue: number;
  tierRequired: CustomerTier;
  badgeText: string;
  perkSummary: string;
  validUntil: string;
  categoryRestriction?: CropCategory;
  isPopular?: boolean;
}

export interface CustomerLoyaltyProfile {
  customerId: string;
  tier: CustomerTier;
  tierName: string;
  orderCount: number;
  totalSpent: number;
  kisanPoints: number;
  pointsWorthInr: number;
  nextTierOrdersNeeded: number;
  nextTierName: string;
  isRegularCustomer: boolean;
  perks: string[];
}

export type OrderStatus = 'placed' | 'confirmed' | 'dispatched' | 'delivered';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: {
    street: string;
    city: string;
    pincode: string;
    coordinates?: { lat: number; lng: number };
  };
  items: {
    cropId: string;
    cropName: string;
    farmerId: string;
    farmerName: string;
    farmName: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    subtotal: number;
    photo: string;
  }[];
  totalAmount: number;
  originalSubtotal?: number;
  discountAmount?: number;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;
  kisanPointsRedeemed?: number;
  kisanPointsDiscount?: number;
  kisanPointsEarned?: number;
  customerTierAtPurchase?: CustomerTier;
  platformFee: number; // ₹0 or minimal
  farmerEarnings: number; // >95% to farmer
  status: OrderStatus;
  createdAt: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  paymentStatus: 'paid' | 'pending' | 'settled_to_farmer';
  trackingStep: number; // 1 to 4
  reviewSubmitted?: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  farmerId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  cropName: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface DemandForecastItem {
  cropName: string;
  category: string;
  currentDemandIndex: number; // 0 - 100
  predictedDemandChange: number; // percentage, e.g. +35%
  predictedPrice: number;
  trend: 'rising' | 'stable' | 'dropping';
  optimalHarvestWindow: string;
  highDemandRegions: string[];
  rationale: string;
  historicalVolumeKg: number[];
  forecastVolumeKg: number[];
}

export interface DeliveryStop {
  id: string;
  orderId: string;
  recipientName: string;
  address: string;
  itemsSummary: string;
  coordinates: { x: number; y: number }; // normalized 0-100 for visual map
  lat: number;
  lng: number;
  status: 'pending' | 'delivered';
  timeSlot: string;
}

export interface RouteOptimizationResult {
  farmHub: {
    name: string;
    coordinates: { x: number; y: number };
  };
  optimizedStops: DeliveryStop[];
  totalStops: number;
  unoptimizedDistanceKm: number;
  optimizedDistanceKm: number;
  distanceSavedKm: number;
  fuelCostSavedInr: number;
  co2SavedKg: number;
  estimatedTotalHours: number;
}

export type SMSRecipientRole = 'farmer' | 'customer' | 'bulk_buyer' | 'driver';
export type SMSCategory = 'order' | 'payment' | 'harvest_ai' | 'otp' | 'dispatch' | 'advisory';

export interface SMSMessage {
  id: string;
  senderId: string; // e.g. "VK-FRMERA", "DM-KISAN", "AX-SBIBNK"
  to: string; // recipient phone number
  recipientName: string;
  recipientRole: SMSRecipientRole;
  category: SMSCategory;
  message: string;
  timestamp: string;
  date: string;
  read: boolean;
  orderId?: string;
  amount?: number;
}

export interface WeatherLocation {
  id: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  isFpoHub?: boolean;
  associatedFarmerName?: string;
  primaryCrops?: string[];
}

export interface HourlyWeatherForecast {
  time: string; // e.g. "10:00 AM" or ISO
  tempC: number;
  precipitationProb: number; // 0 - 100%
  rainMm: number;
  humidityPercent: number;
  windSpeedKmh: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
}

export interface DailyWeatherForecast {
  date: string; // e.g. "2026-09-14"
  dayName: string; // "Today", "Tue", "Wed", etc.
  weatherCode: number;
  weatherDescription: string;
  tempMaxC: number;
  tempMinC: number;
  precipitationProb: number;
  precipitationSumMm: number;
  windSpeedMaxKmh: number;
  uvIndexMax: number;
  farmingAdvisoryTag: string;
}

export interface WeatherAlert {
  id: string;
  severity: 'warning' | 'advisory' | 'watch';
  title: string;
  description: string;
  impactedCrops: string[];
  recommendedAction: string;
}

export interface AgriWeatherAdvisory {
  cropName: string;
  irrigationStatus: 'hold' | 'moderate' | 'full';
  irrigationAdvice: string;
  sprayWindowStatus: 'optimal' | 'caution' | 'unsafe';
  sprayWindowAdvice: string;
  harvestSuitability: 'excellent' | 'moderate' | 'postpone';
  harvestAdvice: string;
  diseaseRisk: 'low' | 'moderate' | 'high';
  diseaseDetails: string;
  recommendedOrganicSolution: string;
}

export interface LiveWeatherData {
  location: WeatherLocation;
  lastUpdated: string;
  currentTempC: number;
  apparentTempC: number;
  weatherCode: number;
  weatherDescription: string;
  humidityPercent: number;
  precipitationMm: number;
  rainProbability: number;
  windSpeedKmh: number;
  windDirectionDegrees: number;
  cloudCoverPercent: number;
  uvIndex: number;
  soilMoistureEstimatePercent: number;
  evapotranspirationMm: number;
  isDay: boolean;
  alerts: WeatherAlert[];
  hourly: HourlyWeatherForecast[];
  daily: DailyWeatherForecast[];
  agriAdvisories: AgriWeatherAdvisory[];
  source: 'open-meteo' | 'fallback_telemetry';
}

