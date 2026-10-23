/**
 * Core Domain Types for D&G E-Commerce Mobile Application
 */

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  mustChangePassword?: boolean;
  createdAt: string;
}


export type ProductCategory =
  | 'Clothes'
  | 'Shoes'
  | 'Bags'
  | 'Household equipment'
  | 'Jewellery'
  | 'Cosmetics';

export interface Category {
  id: string;
  name: ProductCategory;
  slug: string;
  iconName?: string;
  description?: string;
}

export interface ProductVariation {
  id: string;
  name: string; // e.g. "Size", "Color"
  value: string; // e.g. "M", "Red"
  stock: number;
  priceModifier?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number; // Stored in RWF (integer/exact numeric)
  images: string[];
  stock: number;
  isAvailable: boolean;
  sku?: string;
  brand?: string;
  variations?: ProductVariation[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedVariation?: ProductVariation;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  sector: string;
  streetDetails: string;
  isDefault: boolean;
}

export type OrderStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus =
  | 'awaiting_payment'
  | 'payment_under_review'
  | 'paid'
  | 'payment_rejected'
  | 'refunded';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  unitPrice: number; // Historical snapshot price in RWF
  quantity: number;
  subtotal: number;
  variationDetails?: string;
}

export interface Order {
  id: string;
  orderReference: string; // e.g. DG-2026-8941
  userId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: Address;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number; // In RWF
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
