export enum SubscriptionTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  maxStaff: number;
  maxSalons: number;
  hasMarketplace: boolean;
  hasJobBoard: boolean;
  hasAnalytics: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  type: PaymentType;
  status: PaymentStatus;
  reference?: string;
  transactionId?: string;
  createdAt: string;
}

export enum PaymentType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  BOOKING_DEPOSIT = 'BOOKING_DEPOSIT',
  MARKETPLACE = 'MARKETPLACE',
  ADVERTISING = 'ADVERTISING',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Advertisement {
  id: string;
  advertiserId: string;
  title: string;
  type: AdType;
  imageUrl: string;
  targetUrl: string;
  startDate: string;
  endDate: string;
  budget: number;
  impressions: number;
  clicks: number;
  isActive: boolean;
}

export enum AdType {
  BANNER = 'BANNER',
  FEATURED_SALON = 'FEATURED_SALON',
  TRAINING_COURSE = 'TRAINING_COURSE',
  BRAND_PROMO = 'BRAND_PROMO',
}
