export enum ProductCategory {
  SHAMPOO = 'SHAMPOO',
  CONDITIONER = 'CONDITIONER',
  STYLING = 'STYLING',
  HAIR_COLOR = 'HAIR_COLOR',
  TREATMENT = 'TREATMENT',
  TOOLS = 'TOOLS',
  ACCESSORIES = 'ACCESSORIES',
  SKINCARE = 'SKINCARE',
  MAKEUP = 'MAKEUP',
  OTHER = 'OTHER',
}

export enum SaleType {
  B2C = 'B2C',
  B2B = 'B2B',
  BOTH = 'BOTH',
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  category: ProductCategory;
  price: number;
  wholesalePrice?: number;
  currency: string;
  stock: number;
  images: string[];
  saleType: SaleType;
  minOrderQuantity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  shopId: string;
  items: OrderItem[];
  totalAmount: number;
  commissionAmount: number;
  status: OrderStatus;
  shippingAddress?: string;
  paymentMethod: PaymentMethod;
  paidAt?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
