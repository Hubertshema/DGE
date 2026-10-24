import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Header, LoadingSpinner } from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { useLanguage } from '../../../localization/LanguageContext';
import { useAdminReportsQuery } from '../../../api/queries';
import { AdminBottomNav } from '../components/AdminBottomNav';
import {
  TrendingUp,
  CreditCard,
  ShoppingBag,
  AlertTriangle,
  Award,
  Layers,
} from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminReportsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();
  const { t } = useLanguage();

  const {
    data: reports,
    isLoading,
    isRefetching,
    refetch,
  } = useAdminReportsQuery(token);

  const onRefresh = () => {
    refetch();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={t.salesReports}
        subtitle="DG Store Financial & Stock Analytics"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {isLoading && !reports ? (
        <LoadingSpinner message="Calculating real sales figures..." />
      ) : !reports ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load sales analytics.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Main Key Figures */}
          <View style={styles.revenueCard}>
            <View style={styles.cardHeaderRow}>
              <TrendingUp size={24} color={colors.white} />
              <Text style={styles.revenueLabel}>{t.totalRevenue}</Text>
            </View>
            <Text style={styles.revenueValue}>
              {Number(reports.totalRevenueRwf).toLocaleString()} RWF
            </Text>
            <Text style={styles.revenueSub}>Verified payments received via MTN MoMo / Airtel Money</Text>
          </View>

          {/* Quick Metrics Grid */}
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <ShoppingBag size={20} color={colors.primary} />
              <Text style={styles.gridNum}>{reports.totalOrders}</Text>
              <Text style={styles.gridLabel}>{t.totalOrdersCount}</Text>
            </View>

            <View style={styles.gridItem}>
              <CreditCard size={20} color={colors.warning} />
              <Text style={[styles.gridNum, { color: colors.warning }]}>
                {reports.awaitingPayment}
              </Text>
              <Text style={styles.gridLabel}>{t.awaitingPaymentCount}</Text>
            </View>

            <View style={styles.gridItem}>
              <TrendingUp size={20} color={colors.primary} />
              <Text style={styles.gridNum}>{reports.paidOrders}</Text>
              <Text style={styles.gridLabel}>{t.paidOrders}</Text>
            </View>

            <View style={styles.gridItem}>
              <Layers size={20} color={colors.textSecondary} />
              <Text style={styles.gridNum}>{reports.pendingFulfillment}</Text>
              <Text style={styles.gridLabel}>To Deliver</Text>
            </View>
          </View>

          {/* Top Selling Products */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Award size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>{t.topProducts}</Text>
            </View>

            {reports.topProducts && reports.topProducts.length > 0 ? (
              reports.topProducts.map((p: any, idx: number) => (
                <View key={idx} style={styles.topProdRow}>
                  <Text style={styles.rankNum}>#{idx + 1}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.prodName}>{p.name}</Text>
                    <Text style={styles.prodMeta}>{p.quantity} units sold</Text>
                  </View>
                  <Text style={styles.prodSales}>
                    {Number(p.sales).toLocaleString()} RWF
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No sales recorded yet.</Text>
            )}
          </View>

          {/* Revenue by Category */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Layers size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Revenue by Category</Text>
            </View>

            {reports.revenueByCategory && reports.revenueByCategory.length > 0 ? (
              reports.revenueByCategory.map((c: any, idx: number) => (
                <View key={idx} style={styles.catRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.catName}>{c.category}</Text>
                    <Text style={styles.catMeta}>{c.unitsSold} items sold</Text>
                  </View>
                  <Text style={styles.catRevenue}>
                    {Number(c.revenue).toLocaleString()} RWF
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No category sales recorded yet.</Text>
            )}
          </View>

          {/* Low Stock Alerts */}
          <View style={[styles.sectionCard, { borderColor: colors.warning }]}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={20} color={colors.warning} />
              <Text style={[styles.sectionTitle, { color: colors.warning }]}>
                {t.lowStockAlerts}
              </Text>
            </View>

            {reports.lowStockAlerts && reports.lowStockAlerts.length > 0 ? (
              reports.lowStockAlerts.map((prod: any, idx: number) => (
                <View key={idx} style={styles.lowStockRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.prodName}>{prod.name}</Text>
                    <Text style={styles.prodMeta}>{prod.category}</Text>
                  </View>
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockBadgeText}>
                      {prod.stock} {t.stockLeft}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>All products are currently well-stocked.</Text>
            )}
          </View>
        </ScrollView>
      )}

      {/* Fixed Admin Bottom Navigation Bar */}
      <AdminBottomNav activeTab="reports" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 95,
    maxWidth: 820,
    width: '100%',
    alignSelf: 'center',
  },
  revenueCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  revenueLabel: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
    opacity: 0.9,
  },
  revenueValue: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.white,
    marginVertical: spacing.xs,
  },
  revenueSub: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  gridNum: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginVertical: 4,
  },
  gridLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topProdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rankNum: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    width: 28,
  },
  prodName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  prodMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  prodSales: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  catMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  catRevenue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  lowStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stockBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
  },
});
