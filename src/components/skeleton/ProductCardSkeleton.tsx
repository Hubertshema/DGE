import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors, spacing, borderRadius, shadows } from '../../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

export const ProductCardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Image Skeleton */}
      <Skeleton
        width="100%"
        height={150}
        borderRadius={0}
        style={styles.imageSkeleton}
      />

      <View style={styles.content}>
        {/* Category Pill Skeleton */}
        <Skeleton width="45%" height={10} borderRadius={borderRadius.xs} style={styles.category} />

        {/* Product Name Skeletons (2 lines) */}
        <Skeleton width="90%" height={12} borderRadius={borderRadius.xs} style={styles.nameLine1} />
        <Skeleton width="60%" height={12} borderRadius={borderRadius.xs} style={styles.nameLine2} />

        {/* Footer: Price + Add Button */}
        <View style={styles.footer}>
          <Skeleton width="55%" height={16} borderRadius={borderRadius.xs} />
          <Skeleton width={28} height={28} borderRadius={borderRadius.full} />
        </View>
      </View>
    </View>
  );
};

export const ProductListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  const items = Array.from({ length: count });

  return (
    <View style={styles.gridContainer}>
      {items.map((_, index) => (
        <ProductCardSkeleton key={`product-skeleton-${index}`} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  container: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  imageSkeleton: {
    width: '100%',
  },
  content: {
    padding: spacing.sm,
  },
  category: {
    marginBottom: 6,
  },
  nameLine1: {
    marginBottom: 4,
  },
  nameLine2: {
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
});
