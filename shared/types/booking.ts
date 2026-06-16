export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export interface Booking {
  id: string;
  salonId: string;
  customerId: string;
  professionalId?: string;
  serviceId: string;
  status: BookingStatus;
  startTime: string;
  endTime: string;
  depositAmount: number;
  depositPaid: boolean;
  totalAmount: number;
  notes?: string;
  queuePosition?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookingDeposit {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  status: DepositStatus;
  paidAt?: string;
  refundedAt?: string;
}

export enum PaymentMethod {
  TELEBIRR = 'TELEBIRR',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
  CASH = 'CASH',
}

export enum DepositStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FORFEITED = 'FORFEITED',
}

export interface QueueEntry {
  id: string;
  salonId: string;
  customerId: string;
  serviceId: string;
  professionalId?: string;
  position: number;
  estimatedWaitTime: number;
  checkedInAt: string;
  status: QueueStatus;
}

export enum QueueStatus {
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  IN_SERVICE = 'IN_SERVICE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  salonId: string;
  professionalId?: string;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: string;
}
