import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

/**
 * DG E-Commerce Cache Architecture
 *
 * Stale Times:
 * - Categories: 30 minutes (infrequent updates)
 * - Products (catalog & detail): 5 minutes (balanced between freshness and bandwidth)
 * - Orders & Order Detail: 30 seconds (dynamic, tracks shipment and payment statuses)
 * - Admin Reports & Metrics: 30 seconds (financial and stock visibility)
 * - Customers directory: 1 minute
 *
 * Persistence Policy:
 * - Non-sensitive catalog data (categories, public product listings) is persisted to AsyncStorage for instant offline view.
 * - Sensitive data (orders, user info, admin finances) is NEVER persisted locally.
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes default
      gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collection retention
      retry: 2,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false, // Mobile screens prefer explicit pull-to-refresh / tab focus
    },
    mutations: {
      retry: 1,
    },
  },
});

// Configure persister for non-sensitive data
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'DG_ECOMMERCE_QUERY_CACHE_V1',
  throttleTime: 1000,
});

/**
 * Filter which queries are persisted:
 * Only persist categories and public product queries.
 * Never persist orders, user credentials, or admin reports.
 */
export const persistDehydrateOptions = {
  shouldDehydrateQuery: (query: any) => {
    const key = query.queryKey;
    if (!Array.isArray(key)) return false;

    // Categories are non-sensitive and beneficial offline
    if (key[0] === 'categories') return true;

    // Public products (excluding admin includeUnavailable)
    if (key[0] === 'products') {
      const filters = key[1];
      if (filters?.includeUnavailable) return false;
      return true;
    }

    if (key[0] === 'product') return true;

    // All other keys (orders, admin, users, etc.) are strictly in-memory only
    return false;
  },
};

/**
 * Strongly-typed query keys
 */
export const queryKeys = {
  categories: ['categories'] as const,
  products: (filters?: { category?: string; search?: string; includeUnavailable?: boolean }) =>
    ['products', filters] as const,
  product: (id: string) => ['product', id] as const,
  orders: (filters?: { status?: string; paymentStatus?: string }) =>
    ['orders', filters] as const,
  order: (id: string) => ['order', id] as const,
  adminReports: ['admin', 'reports'] as const,
  adminCustomers: ['admin', 'customers'] as const,
  sellerMetrics: ['seller', 'metrics'] as const,
};
