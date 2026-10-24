import { Platform } from 'react-native';
import { Product, Category, Order, User } from '../types';

declare const __DEV__: boolean;

// Production API URL for DG E-Commerce on Render
export const PRODUCTION_API_URL = 'https://dge-ak8u.onrender.com/api/v1';


export const getApiBaseUrl = (): string => {
  // 1. Explicit runtime or build-time environment override if provided
  if (typeof process !== 'undefined' && process.env?.API_URL) {
    return process.env.API_URL;
  }
  // 2. In development, Android emulator connects to host machine via 10.0.2.2; iOS/web via localhost
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/v1' : 'http://localhost:5000/api/v1';
  }
  // 3. In release / production builds:
  return PRODUCTION_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();


async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const data: any = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data as T;
  } catch (err: any) {
    console.warn(`[API] Error on ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    const res = await request<{ success: boolean; data: Category[] }>('/categories');
    return res.data;
  },

  createCategory: async (categoryData: { name: string; description?: string }, token: string): Promise<Category> => {
    const res = await request<{ success: boolean; data: Category }>('/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(categoryData),
    });
    return res.data;
  },

  updateCategory: async (id: string, categoryData: { name?: string; description?: string }, token: string): Promise<Category> => {
    const res = await request<{ success: boolean; data: Category }>(`/categories/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(categoryData),
    });
    return res.data;
  },

  deleteCategory: async (id: string, token: string): Promise<void> => {
    await request<{ success: boolean }>(`/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Products
  getProducts: async (category?: string, search?: string, includeUnavailable?: boolean): Promise<Product[]> => {
    let endpoint = '/products?limit=100';
    if (category && category !== 'All') {
      endpoint += `&category=${encodeURIComponent(category)}`;
    }
    if (search && search.trim() !== '') {
      endpoint += `&search=${encodeURIComponent(search.trim())}`;
    }
    if (includeUnavailable) {
      endpoint += '&includeUnavailable=true';
    }
    const res = await request<{ success: boolean; data: Product[] }>(endpoint);
    return res.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const res = await request<{ success: boolean; data: Product }>(`/products/${id}`);
    return res.data;
  },

  createProduct: async (productData: any, token: string): Promise<Product> => {
    const res = await request<{ success: boolean; data: Product }>('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(productData),
    });
    return res.data;
  },

  updateProduct: async (id: string, productData: any, token: string): Promise<Product> => {
    const res = await request<{ success: boolean; data: Product }>(`/products/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(productData),
    });
    return res.data;
  },

  deleteProduct: async (id: string, token: string): Promise<void> => {
    await request<{ success: boolean }>(`/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Orders
  createOrder: async (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: any;
    items: { productId: string; quantity: number; variationDetails?: string }[];
    userId?: string;
  }): Promise<{
    id: string;
    orderReference: string;
    totalAmount: number;
    subtotal: number;
    deliveryFee: number;
    status: string;
    paymentStatus: string;
    whatsappUrl?: string;
  }> => {
    const res = await request<{ success: boolean; data: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return res.data;
  },

  getOrders: async (token?: string, statusFilter?: string, paymentStatusFilter?: string): Promise<Order[]> => {
    let endpoint = '/orders';
    const params: string[] = [];
    if (statusFilter && statusFilter !== 'all') params.push(`status=${statusFilter}`);
    if (paymentStatusFilter && paymentStatusFilter !== 'all') params.push(`paymentStatus=${paymentStatusFilter}`);
    if (params.length > 0) endpoint += `?${params.join('&')}`;

    const res = await request<{ success: boolean; data: Order[] }>(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  },

  getOrderById: async (id: string, token?: string): Promise<any> => {
    const res = await request<{ success: boolean; data: any }>(`/orders/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  },

  updateOrderStatus: async (id: string, status: string, token: string): Promise<any> => {
    const res = await request<{ success: boolean; data: any }>(`/orders/${id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  verifyPayment: async (
    id: string,
    paymentStatus: string,
    notes: string,
    token: string
  ): Promise<any> => {
    const res = await request<{ success: boolean; data: any }>(`/orders/${id}/verify-payment`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ paymentStatus, notes }),
    });
    return res.data;
  },

  // Admin Reports & Metrics
  getAdminReports: async (token: string): Promise<any> => {
    const res = await request<{ success: boolean; data: any }>('/orders/admin/reports', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getAdminCustomers: async (token: string): Promise<any[]> => {
    const res = await request<{ success: boolean; data: any[] }>('/orders/admin/customers', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Legacy metric alias
  getSellerMetrics: async (token: string): Promise<{
    totalOrders: number;
    pendingOrders: number;
    awaitingPayment: number;
    totalRevenueRwf: number;
  }> => {
    const reports = await api.getAdminReports(token);
    return {
      totalOrders: reports.totalOrders,
      pendingOrders: reports.pendingFulfillment,
      awaitingPayment: reports.awaitingPayment,
      totalRevenueRwf: reports.totalRevenueRwf,
    };
  },

  // Auth
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const res = await request<{ success: boolean; data: { user: User; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return res.data;
  },

  register: async (
    fullName: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ user: User; token: string }> => {
    const res = await request<{ success: boolean; data: { user: User; token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, phone }),
    });
    return res.data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string,
    token: string
  ): Promise<{ user: User; token: string }> => {
    const res = await request<{ success: boolean; data: { user: User; token: string }; message: string }>(
      '/auth/change-password',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      }
    );
    return res.data;
  },

  // Notifications
  getNotifications: async (
    token: string,
    limit: number = 30,
    offset: number = 0
  ): Promise<{
    notifications: Array<{
      id: string;
      userId: string;
      title: string;
      message: string;
      type: string;
      orderId?: string | null;
      orderReference?: string | null;
      isRead: boolean;
      readAt?: string | null;
      createdAt: string;
    }>;
    total: number;
    unreadCount: number;
  }> => {
    const res = await request<{
      success: boolean;
      data: {
        notifications: any[];
        total: number;
        unreadCount: number;
      };
    }>(`/notifications?limit=${limit}&offset=${offset}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getUnreadNotificationCount: async (token: string): Promise<number> => {
    const res = await request<{
      success: boolean;
      data: { unreadCount: number };
    }>('/notifications/unread-count', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.unreadCount;
  },

  markNotificationAsRead: async (
    id: string,
    token: string
  ): Promise<{ notification: any; unreadCount: number }> => {
    const res = await request<{
      success: boolean;
      data: { notification: any; unreadCount: number };
    }>(`/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  markAllNotificationsAsRead: async (token: string): Promise<{ unreadCount: number }> => {
    const res = await request<{
      success: boolean;
      data: { unreadCount: number };
    }>('/notifications/mark-all-read', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  registerPushToken: async (token: string, pushToken: string): Promise<void> => {
    await request<{ success: boolean }>('/notifications/device-token', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ token: pushToken, platform: Platform.OS }),
    });
  },
};
