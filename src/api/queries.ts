import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { api } from './client';
import { queryKeys } from './queryClient';
import { Product, Category, Order } from '../types';

// ==========================================
// 1. QUERY HOOKS
// ==========================================

/**
 * Fetch product categories
 * Stale time: 30 minutes (categories rarely change)
 */
export const useCategoriesQuery = (): UseQueryResult<Category[], Error> => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => api.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Fetch products list with optional category, search, and availability filters
 * Stale time: 5 minutes
 */
export const useProductsQuery = (
  category?: string,
  search?: string,
  includeUnavailable?: boolean,
  options?: { refetchInterval?: number | false }
): UseQueryResult<Product[], Error> => {
  return useQuery({
    queryKey: queryKeys.products({ category, search, includeUnavailable }),
    queryFn: async () => {
      const data = await api.getProducts(category, search, includeUnavailable);
      return data.map((p) => ({
        ...p,
        price: Number(p.price),
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: options?.refetchInterval,
  });
};

/**
 * Fetch single product details by ID
 * Stale time: 5 minutes
 */
export const useProductQuery = (
  id: string,
  options?: { refetchInterval?: number | false }
): UseQueryResult<Product, Error> => {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: async () => {
      const data = await api.getProductById(id);
      return {
        ...data,
        price: Number(data.price),
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: Boolean(id),
    refetchInterval: options?.refetchInterval,
  });
};

/**
 * Fetch orders with status filters
 * Sensible auto-refresh: 20 seconds while order list is open
 */
export const useOrdersQuery = (
  token?: string | null,
  statusFilter?: string,
  paymentStatusFilter?: string,
  options?: { refetchInterval?: number | false; enabled?: boolean }
): UseQueryResult<Order[], Error> => {
  return useQuery({
    queryKey: queryKeys.orders({ status: statusFilter, paymentStatus: paymentStatusFilter }),
    queryFn: () => api.getOrders(token || undefined, statusFilter, paymentStatusFilter),
    staleTime: 1000 * 20, // 20 seconds
    enabled: options?.enabled !== undefined ? options.enabled : Boolean(token),
    refetchOnWindowFocus: true,
    refetchInterval: options?.refetchInterval !== undefined ? options.refetchInterval : 20000, // 20s auto-refresh
  });
};

/**
 * Fetch single order details by ID
 * Sensible auto-refresh: 15 seconds for active orders; automatically pauses when delivered/cancelled
 */
export const useOrderQuery = (
  id: string,
  token?: string | null,
  options?: {
    refetchInterval?: number | false | ((query: any) => number | false);
    enabled?: boolean;
  }
): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => api.getOrderById(id, token || undefined),
    staleTime: 1000 * 15, // 15 seconds
    enabled: options?.enabled !== undefined ? options.enabled : Boolean(id && token),
    refetchOnWindowFocus: true,
    refetchInterval:
      options?.refetchInterval !== undefined
        ? options.refetchInterval
        : (query: any) => {
            const order = query.state.data;
            if (!order) return 15000;
            const status = (order.status || '').toLowerCase();
            const payment = (
              order.paymentStatus ||
              order.payment_status ||
              ''
            ).toLowerCase();
            // If order has reached final terminal state, stop polling
            if (
              (status === 'delivered' || status === 'cancelled') &&
              (payment === 'paid' || payment === 'payment_rejected')
            ) {
              return false;
            }
            return 15000; // 15 seconds active tracking
          },
  });
};

/**
 * Fetch admin sales & performance reports
 * Auto-refresh: 45 seconds while admin screen is active
 */
export const useAdminReportsQuery = (
  token?: string | null,
  options?: { refetchInterval?: number | false }
): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: queryKeys.adminReports,
    queryFn: () => api.getAdminReports(token!),
    staleTime: 1000 * 30, // 30 seconds
    enabled: Boolean(token),
    refetchOnWindowFocus: true,
    refetchInterval: options?.refetchInterval !== undefined ? options.refetchInterval : 45000,
  });
};

/**
 * Fetch admin customers directory
 * Stale time: 1 minute
 */
export const useAdminCustomersQuery = (
  token?: string | null,
  options?: { refetchInterval?: number | false }
): UseQueryResult<any[], Error> => {
  return useQuery({
    queryKey: queryKeys.adminCustomers,
    queryFn: () => api.getAdminCustomers(token!),
    staleTime: 1000 * 60, // 1 minute
    enabled: Boolean(token),
    refetchInterval: options?.refetchInterval,
  });
};

/**
 * Fetch seller / admin metrics
 * Auto-refresh: 30 seconds while dashboard is open
 */
export const useSellerMetricsQuery = (
  token?: string | null,
  options?: { refetchInterval?: number | false }
): UseQueryResult<{
  totalOrders: number;
  pendingOrders: number;
  awaitingPayment: number;
  totalRevenueRwf: number;
}, Error> => {
  return useQuery({
    queryKey: queryKeys.sellerMetrics,
    queryFn: () => api.getSellerMetrics(token!),
    staleTime: 1000 * 30, // 30 seconds
    enabled: Boolean(token),
    refetchOnWindowFocus: true,
    refetchInterval: options?.refetchInterval !== undefined ? options.refetchInterval : 30000, // 30s auto-refresh
  });
};

// ==========================================
// 2. MUTATION HOOKS WITH AUTOMATIC CACHE INVALIDATION
// ==========================================

/**
 * Create product mutation
 * Invalidates: products lists, admin reports, seller metrics
 */
export const useCreateProductMutation = (token?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: any) => api.createProduct(productData, token!),
    onSuccess: () => {
      // Invalidate all product queries regardless of filters
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReports });
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerMetrics });
    },
  });
};

/**
 * Update product mutation
 * Invalidates: specific product, product lists, admin reports, seller metrics
 */
export const useUpdateProductMutation = (token?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, productData }: { id: string; productData: any }) =>
      api.updateProduct(id, productData, token!),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.product(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReports });
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerMetrics });
    },
  });
};

/**
 * Delete product mutation
 * Invalidates: specific product, product lists, admin reports, seller metrics
 */
export const useDeleteProductMutation = (token?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteProduct(id, token!),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.product(id) });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReports });
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerMetrics });
    },
  });
};

/**
 * Category Mutations
 * Invalidates: categories list, and product lists (as category associations change)
 */
export const useCategoryMutations = (token?: string | null) => {
  const queryClient = useQueryClient();

  const createCategory = useMutation({
    mutationFn: (categoryData: { name: string; description?: string }) =>
      api.createCategory(categoryData, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, categoryData }: { id: string; categoryData: { name?: string; description?: string } }) =>
      api.updateCategory(id, categoryData, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => api.deleteCategory(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return { createCategory, updateCategory, deleteCategory };
};

/**
 * Order Status Update Mutation
 * Invalidates: specific order, orders list, admin reports, seller metrics, and products (if stock restored)
 */
export const useUpdateOrderStatusMutation = (token?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateOrderStatus(id, status, token!),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.order(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReports });
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerMetrics });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

/**
 * Verify Payment Mutation
 * Invalidates: specific order, orders list, admin reports, seller metrics, admin customers
 */
export const useVerifyPaymentMutation = (token?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      paymentStatus,
      notes,
    }: {
      id: string;
      paymentStatus: string;
      notes: string;
    }) => api.verifyPayment(id, paymentStatus, notes, token!),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.order(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReports });
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerMetrics });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminCustomers });
    },
  });
};

/**
 * Create Order Mutation
 * Invalidates: orders list, admin reports, seller metrics, products (since inventory is deducted!)
 */
export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: {
      customerName: string;
      customerPhone: string;
      deliveryAddress: any;
      items: { productId: string; quantity: number; variationDetails?: string }[];
      userId?: string;
    }) => api.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminReports });
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerMetrics });
    },
  });
};
