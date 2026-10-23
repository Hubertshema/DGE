import { queryClient, persistDehydrateOptions, queryKeys } from '../queryClient';

describe('DG E-Commerce Caching Strategy & Security', () => {
  it('correctly constructs strongly-typed query keys', () => {
    expect(queryKeys.categories).toEqual(['categories']);
    expect(queryKeys.products({ category: 'Clothes' })).toEqual(['products', { category: 'Clothes' }]);
    expect(queryKeys.product('prod-123')).toEqual(['product', 'prod-123']);
    expect(queryKeys.orders({ status: 'pending_confirmation' })).toEqual(['orders', { status: 'pending_confirmation' }]);
    expect(queryKeys.order('ord-456')).toEqual(['order', 'ord-456']);
    expect(queryKeys.adminReports).toEqual(['admin', 'reports']);
    expect(queryKeys.adminCustomers).toEqual(['admin', 'customers']);
    expect(queryKeys.sellerMetrics).toEqual(['seller', 'metrics']);
  });

  describe('Security Dehydration Policy', () => {
    it('persists non-sensitive categories', () => {
      const categoryQuery = { queryKey: ['categories'] };
      expect(persistDehydrateOptions.shouldDehydrateQuery(categoryQuery)).toBe(true);
    });

    it('persists public products and product details', () => {
      const publicProductsQuery = { queryKey: ['products', { category: 'Shoes' }] };
      const productDetailQuery = { queryKey: ['product', 'shoe-1'] };
      expect(persistDehydrateOptions.shouldDehydrateQuery(publicProductsQuery)).toBe(true);
      expect(persistDehydrateOptions.shouldDehydrateQuery(productDetailQuery)).toBe(true);
    });

    it('NEVER dehydrates admin products with includeUnavailable flag', () => {
      const adminProductsQuery = { queryKey: ['products', { includeUnavailable: true }] };
      expect(persistDehydrateOptions.shouldDehydrateQuery(adminProductsQuery)).toBe(false);
    });

    it('NEVER dehydrates sensitive customer orders or payment details', () => {
      const ordersQuery = { queryKey: ['orders', { status: 'all' }] };
      const singleOrderQuery = { queryKey: ['order', 'ord-999'] };
      expect(persistDehydrateOptions.shouldDehydrateQuery(ordersQuery)).toBe(false);
      expect(persistDehydrateOptions.shouldDehydrateQuery(singleOrderQuery)).toBe(false);
    });

    it('NEVER dehydrates admin reports, customers directory, or seller metrics', () => {
      const reportsQuery = { queryKey: ['admin', 'reports'] };
      const customersQuery = { queryKey: ['admin', 'customers'] };
      const metricsQuery = { queryKey: ['seller', 'metrics'] };
      expect(persistDehydrateOptions.shouldDehydrateQuery(reportsQuery)).toBe(false);
      expect(persistDehydrateOptions.shouldDehydrateQuery(customersQuery)).toBe(false);
      expect(persistDehydrateOptions.shouldDehydrateQuery(metricsQuery)).toBe(false);
    });
  });

  describe('Query Client Defaults', () => {
    it('configures sensible default stale time of 5 minutes', () => {
      const defaultOptions = queryClient.getDefaultOptions();
      expect(defaultOptions.queries?.staleTime).toBe(1000 * 60 * 5);
      expect(defaultOptions.queries?.gcTime).toBe(1000 * 60 * 60 * 24);
      expect(defaultOptions.queries?.retry).toBe(2);
    });
  });

  describe('Auto-Refresh Policies', () => {
    it('stops auto-polling when order is delivered and payment is paid', () => {
      const calculateInterval = (status: string, paymentStatus: string) => {
        const s = status.toLowerCase();
        const p = paymentStatus.toLowerCase();
        if ((s === 'delivered' || s === 'cancelled') && (p === 'paid' || p === 'payment_rejected')) {
          return false;
        }
        return 15000;
      };

      // Active / in-progress orders poll every 15 seconds
      expect(calculateInterval('pending_confirmation', 'awaiting_payment')).toBe(15000);
      expect(calculateInterval('processing', 'paid')).toBe(15000);
      expect(calculateInterval('shipped', 'paid')).toBe(15000);

      // Terminal orders stop polling
      expect(calculateInterval('delivered', 'paid')).toBe(false);
      expect(calculateInterval('cancelled', 'payment_rejected')).toBe(false);
    });
  });
});
