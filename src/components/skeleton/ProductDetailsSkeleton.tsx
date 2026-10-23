import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors, spacing, borderRadius, shadows } from '../../theme';

export const ProductDetailsSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Image Gallery Skeleton */}
        <View style={styles.imageContainer}>
          <Skeleton width="100%" height={320} borderRadius={0} />
        </View>

        {/* Details Card Skeleton */}
        <View style={styles.detailsCard}>
          {/* Category Pill */}
          <Skeleton width={80} height={12} borderRadius={borderRadius.xs} style={styles.category} />

          {/* Product Title Lines */}
          <Skeleton width="85%" height={22} borderRadius={borderRadius.xs} style={styles.titleLine1} />
          <Skeleton width="55%" height={22} borderRadius={borderRadius.xs} style={styles.titleLine2} />

          {/* Price & Stock Badge Row */}
          <View style={styles.priceRow}>
            <Skeleton width={130} height={26} borderRadius={borderRadius.xs} />
            <Skeleton width={100} height={26} borderRadius={borderRadius.full} />
          </View>

          {/* SKU */}
          <Skeleton width={110} height={12} borderRadius={borderRadius.xs} style={styles.sku} />

          <View style={styles.divider} />

          {/* Description Section Header */}
          <Skeleton width={150} height={16} borderRadius={borderRadius.xs} style={styles.sectionHeader} />

          {/* Description Paragraph */}
          <Skeleton width="100%" height={14} borderRadius={borderRadius.xs} style={styles.descLine} />
          <Skeleton width="94%" height={14} borderRadius={borderRadius.xs} style={styles.descLine} />
          <Skeleton width="70%" height={14} borderRadius={borderRadius.xs} style={styles.descLine} />

          {/* Trust Badge Box */}
          <View style={styles.trustBox}>
            <Skeleton width={20} height={20} borderRadius={borderRadius.xs} />
            <Skeleton width="80%" height={14} borderRadius={borderRadius.xs} style={{ marginLeft: spacing.sm }} />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar Skeleton */}
      <View style={styles.bottomBar}>
        <Skeleton width={110} height={48} borderRadius={borderRadius.md} />
        <Skeleton width="60%" height={48} borderRadius={borderRadius.md} style={{ marginLeft: spacing.md }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: colors.surface,
  },
  detailsCard: {
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  category: {
    marginBottom: spacing.xs,
  },
  titleLine1: {
    marginBottom: 6,
  },
  titleLine2: {
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sku: {
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  descLine: {
    marginBottom: 8,
  },
  trustBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.lg,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
  },
});
