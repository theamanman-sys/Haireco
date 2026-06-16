export interface Salon {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  phone: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  coverImage?: string;
  logo?: string;
  images: string[];
  workingHours: WorkingHours;
  isActive: boolean;
  isFeatured: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  isClosed: boolean;
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  currency: string;
  category: ServiceCategory;
  isActive: boolean;
}

export enum ServiceCategory {
  HAIRCUT = 'HAIRCUT',
  COLORING = 'COLORING',
  STYLING = 'STYLING',
  TREATMENT = 'TREATMENT',
  BRAIDING = 'BRAIDING',
  EXTENSIONS = 'EXTENSIONS',
  BARBER = 'BARBER',
  MAKEUP = 'MAKEUP',
  NAILS = 'NAILS',
  OTHER = 'OTHER',
}

export interface StaffMember {
  id: string;
  salonId: string;
  userId: string;
  position: string;
  isActive: boolean;
  services: string[];
  schedule: WorkingHours;
}
