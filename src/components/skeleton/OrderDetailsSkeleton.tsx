import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton } from './Skeleton';
import { colors, spacing, borderRadius, shadows } from '../../theme';

export const OrderDetailsSkeleton: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* 1. Status Overview Card */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View>
            <Skeleton width={160} height={18} borderRadius={borderRadius.xs} style={{ marginBottom: 6 }} />
            <Skeleton width={100} height={12} borderRadius={borderRadius.xs} />
          </View>
          <Skeleton width={110} height={26} borderRadius={borderRadius.full} />
        </View>

        <View style={styles.divider} />

        <View style={styles.rowBetween}>
          <Skeleton width={90} height={14} borderRadius={borderRadius.xs} />
          <Skeleton width={120} height={24} borderRadius={borderRadius.full} />
        </View>
      </View>

      {/* 2. Order Items Card */}
      <View style={styles.card}>
        <Skeleton width={120} height={16} borderRadius={borderRadius.xs} style={styles.sectionTitle} />

        {/* Item 1 */}
        <View style={styles.itemRow}>
          <Skeleton width={52} height={52} borderRadius={borderRadius.sm} />
          <View style={styles.itemInfo}>
            <Skeleton width="85%" height={14} borderRadius={borderRadius.xs} style={{ marginBottom: 6 }} />
            <Skeleton width="45%" height={12} borderRadius={borderRadius.xs} />
          </View>
          <Skeleton width={70} height={14} borderRadius={borderRadius.xs} />
        </View>

        <View style={styles.itemDivider} />

        {/* Item 2 */}
        <View style={styles.itemRow}>
          <Skeleton width={52} height={52} borderRadius={borderRadius.sm} />
          <View style={styles.itemInfo}>
            <Skeleton width="75%" height={14} borderRadius={borderRadius.xs} style={{ marginBottom: 6 }} />
            <Skeleton width="40%" height={12} borderRadius={borderRadius.xs} />
          </View>
          <Skeleton width={70} height={14} borderRadius={borderRadius.xs} />
        </View>
      </View>

      {/* 3. Delivery Details Card */}
      <View style={styles.card}>
        <Skeleton width={160} height={16} borderRadius={borderRadius.xs} style={styles.sectionTitle} />
        <Skeleton width="70%" height={14} borderRadius={borderRadius.xs} style={{ marginBottom: 6 }} />
        <Skeleton width="50%" height={14} borderRadius={borderRadius.xs} style={{ marginBottom: 6 }} />
        <Skeleton width="90%" height={14} borderRadius={borderRadius.xs} />
      </View>

      {/* 4. Financial Summary Card */}
      <View style={styles.card}>
        <Skeleton width={140} height={16} borderRadius={borderRadius.xs} style={styles.sectionTitle} />
        
        <View style={styles.summaryRow}>
          <Skeleton width={70} height={14} borderRadius={borderRadius.xs} />
          <Skeleton width={80} height={14} borderRadius={borderRadius.xs} />
        </View>
        <View style={styles.summaryRow}>
          <Skeleton width={90} height={14} borderRadius={borderRadius.xs} />
          <Skeleton width={70} height={14} borderRadius={borderRadius.xs} />
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Skeleton width={100} height={18} borderRadius={borderRadius.xs} />
          <Skeleton width={110} height={20} borderRadius={borderRadius.xs} />
        </View>
      </View>

      {/* 5. Action Button Placeholder */}
      <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.xs }}>
        <Skeleton width="100%" height={48} borderRadius={borderRadius.md} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
});
