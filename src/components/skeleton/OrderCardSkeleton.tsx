import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors, spacing, borderRadius, shadows } from '../../theme';

export const OrderCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Skeleton width={140} height={16} borderRadius={borderRadius.xs} style={styles.orderRef} />
          <View style={styles.dateRow}>
            <Skeleton width={14} height={14} borderRadius={borderRadius.xs} style={{ marginRight: 6 }} />
            <Skeleton width={80} height={12} borderRadius={borderRadius.xs} />
          </View>
        </View>
        <Skeleton width={96} height={24} borderRadius={borderRadius.full} />
      </View>

      <View style={styles.divider} />

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.paymentInfo}>
          <Skeleton width={14} height={14} borderRadius={borderRadius.xs} style={{ marginRight: 6 }} />
          <Skeleton width={110} height={20} borderRadius={borderRadius.full} />
        </View>
        <Skeleton width={90} height={18} borderRadius={borderRadius.xs} />
      </View>
    </View>
  );
};

export const OrderListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  const items = Array.from({ length: count });

  return (
    <View style={styles.listContainer}>
      {items.map((_, index) => (
        <OrderCardSkeleton key={`order-skeleton-${index}`} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  orderRef: {
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
