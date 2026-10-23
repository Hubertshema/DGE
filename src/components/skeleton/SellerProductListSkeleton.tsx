import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors, spacing, borderRadius, shadows } from '../../theme';

export const SellerProductItemSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        {/* Thumbnail */}
        <Skeleton width={60} height={60} borderRadius={borderRadius.sm} style={styles.thumbnail} />

        {/* Info Column */}
        <View style={styles.info}>
          <Skeleton width="80%" height={15} borderRadius={borderRadius.xs} style={{ marginBottom: 6 }} />
          <Skeleton width="50%" height={12} borderRadius={borderRadius.xs} style={{ marginBottom: 6 }} />
          <Skeleton width="40%" height={14} borderRadius={borderRadius.xs} style={{ marginBottom: 6 }} />
          <Skeleton width={85} height={18} borderRadius={borderRadius.full} />
        </View>

        {/* Actions Column */}
        <View style={styles.actionsCol}>
          <Skeleton width={32} height={32} borderRadius={borderRadius.sm} style={{ marginBottom: 6 }} />
          <Skeleton width={32} height={32} borderRadius={borderRadius.sm} />
        </View>
      </View>
    </View>
  );
};

export const SellerProductListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  const items = Array.from({ length: count });

  return (
    <View style={styles.container}>
      {items.map((_, index) => (
        <SellerProductItemSkeleton key={`seller-prod-skeleton-${index}`} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  actionsCol: {
    marginLeft: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
