import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Header, Badge, OrderListSkeleton, SyncIndicator, Button } from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { useLanguage } from '../../../localization/LanguageContext';
import { useOrdersQuery } from '../../../api/queries';
import { AdminBottomNav } from '../components/AdminBottomNav';
import { Package, ChevronRight, Phone, Clock, DollarSign, AlertCircle } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SellerOrdersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { token, isAdmin, isSeller } = useAuth();
  const { t } = useLanguage();

  const [filter, setFilter] = useState<'all' | 'awaiting' | 'paid'>('all');

  const {
    data: orders = [],
    isLoading,
    isFetching,
    isRefetching,
    error: ordersError,
    refetch,
  } = useOrdersQuery(token);

  const onRefresh = () => {
    refetch();
  };

  const showSkeleton = isLoading && orders.length === 0;
  const isBackgroundSyncing = isFetching && !isLoading && !isRefetching;

  const filteredOrders = orders.filter((o) => {
    const payStatus = o.paymentStatus || (o as any).payment_status;
    if (filter === 'awaiting') return payStatus === 'awaiting_payment';
    if (filter === 'paid') return payStatus === 'paid';
    return true;
  });

  const pendingCount = orders.filter(
    (o) =>
      o.status === 'pending_confirmation' ||
      (o.paymentStatus || (o as any).payment_status) === 'awaiting_payment'
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge label={t.delivered} variant="success" />;
      case 'shipped':
        return <Badge label={t.shipped} variant="info" />;
      case 'processing':
        return <Badge label={t.processing} variant="info" />;
      case 'confirmed':
        return <Badge label={t.confirmed} variant="success" />;
      case 'cancelled':
        return <Badge label={t.cancelled} variant="danger" />;
      default:
        return <Badge label={t.pending_confirmation} variant="warning" />;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge label={t.paid} variant="success" />;
      case 'payment_rejected':
        return <Badge label={t.payment_rejected} variant="danger" />;
      case 'payment_under_review':
        return <Badge label={t.payment_under_review} variant="info" />;
      default:
        return <Badge label={t.awaiting_payment} variant="warning" />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={t.manageOrders}
        subtitle="DG Store Orders & WhatsApp Verification"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({orders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'awaiting' && styles.filterTabActive]}
          onPress={() => setFilter('awaiting')}
        >
          <Text style={[styles.filterText, filter === 'awaiting' && styles.filterTextActive]}>
            {t.awaiting_payment} ({orders.filter((o) => (o.paymentStatus || (o as any).payment_status) === 'awaiting_payment').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'paid' && styles.filterTabActive]}
          onPress={() => setFilter('paid')}
        >
          <Text style={[styles.filterText, filter === 'paid' && styles.filterTextActive]}>
            {t.paid} ({orders.filter((o) => (o.paymentStatus || (o as any).payment_status) === 'paid').length})
          </Text>
        </TouchableOpacity>
      </View>

      <SyncIndicator isSyncing={isBackgroundSyncing} label="Updating store orders..." />

      {showSkeleton ? (
        <OrderListSkeleton count={4} />
      ) : ordersError && orders.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
          <AlertCircle size={48} color={colors.danger} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.md }}>
            Connection Notice
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
            {ordersError.message}
          </Text>
          <Button
            title="Try Again"
            onPress={() => refetch()}
            style={{ marginTop: spacing.md, minWidth: 140 }}
          />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => {
            const ref = item.orderReference || (item as any).order_reference;
            const cName = item.customerName || (item as any).customer_name;
            const cPhone = item.customerPhone || (item as any).customer_phone;
            const total = Number(item.totalAmount || (item as any).total_amount);
            const status = item.status;
            const payStatus = item.paymentStatus || (item as any).payment_status;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.orderCard}
                onPress={() =>
                  navigation.navigate('AdminOrderDetail', { orderId: item.id })
                }
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderRef}>{ref}</Text>
                    <Text style={styles.customerName}>{cName}</Text>
                  </View>
                  <View style={styles.statusCol}>
                    {getStatusBadge(status)}
                    <View style={{ marginTop: 4 }}>
                      {getPaymentBadge(payStatus)}
                    </View>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardFooter}>
                  <View style={styles.footerInfo}>
                    <Phone size={14} color={colors.textSecondary} />
                    <Text style={styles.phoneText}>{cPhone}</Text>
                  </View>

                  <View style={styles.amountContainer}>
                    <Text style={styles.amountText}>
                      {total.toLocaleString()} RWF
                    </Text>
                    <ChevronRight size={16} color={colors.textSecondary} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Fixed Admin Bottom Navigation Bar */}
      <AdminBottomNav activeTab="orders" pendingOrdersCount={pendingCount} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  filterTab: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 95,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderRef: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  customerName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusCol: {
    alignItems: 'flex-end',
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
});
