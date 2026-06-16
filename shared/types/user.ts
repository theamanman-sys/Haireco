export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PROFESSIONAL = 'PROFESSIONAL',
  SALON_OWNER = 'SALON_OWNER',
  SHOP = 'SHOP',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  bio?: string;
  yearsOfExperience: number;
  specializations: string[];
  portfolioImages: string[];
  resumeUrl?: string;
  verificationBadge: boolean;
  averageRating: number;
  totalReviews: number;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  loyaltyPoints: number;
  totalBookings: number;
  totalSpent: number;
}

export interface SalonOwnerProfile {
  id: string;
  userId: string;
  salonIds: string[];
  subscriptionTier: SubscriptionTier;
  subscriptionExpiry?: string;
}

export interface ShopProfile {
  id: string;
  userId: string;
  shopName: string;
  businessLicense?: string;
  commissionRate: number;
}
