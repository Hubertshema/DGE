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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius, shadows } from '../../../theme';
import { Header, Badge, EmptyState, OrderListSkeleton, SyncIndicator, Button } from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { useLanguage } from '../../../localization/LanguageContext';
import { useOrdersQuery } from '../../../api/queries';
import { Package, ChevronRight, Calendar, CreditCard, AlertCircle } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MyOrdersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user, token, isAuthenticated } = useAuth();
  const { t } = useLanguage();

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
        return <Badge label={t.pending} variant="warning" />;
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

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <Header title={t.myOrders} subtitle={t.orderHistory} showBack onBackPress={() => navigation.goBack()} />
        <EmptyState
          icon={<Package size={48} color={colors.primary} />}
          title={t.signInPrompt}
          message={t.signInPromptDesc}
          actionTitle={t.signIn}
          onAction={() => navigation.navigate('Login')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={t.myOrders}
        subtitle={`${t.customerTracking} ${user?.fullName || t.customerGuest}`}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* Subtle Sync Indicator during background auto-refresh */}
      <SyncIndicator isSyncing={isBackgroundSyncing} label="Syncing order statuses..." />

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
          data={orders}
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
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.orderCard}
              onPress={() =>
                navigation.navigate('OrderDetails', {
                  orderId: item.id || item.orderReference || (item as any).order_reference,
                })
              }
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderRef}>{item.orderReference || (item as any).order_reference}</Text>
                  <View style={styles.dateRow}>
                    <Calendar size={12} color={colors.textSecondary} />
                    <Text style={styles.dateText}>
                      {new Date(item.createdAt || (item as any).created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                {getStatusBadge(item.status)}
              </View>

              <View style={styles.divider} />

              <View style={styles.cardFooter}>
                <View style={styles.paymentInfo}>
                  <CreditCard size={14} color={colors.textSecondary} />
                  <Text style={styles.paymentLabel}>Payment:</Text>
                  {getPaymentBadge(item.paymentStatus || (item as any).payment_status)}
                </View>

                <View style={styles.totalBlock}>
                  <Text style={styles.totalAmount}>
                    {Number(item.totalAmount || (item as any).total_amount).toLocaleString()} RWF
                  </Text>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<Package size={48} color={colors.primary} />}
              title="No orders yet"
              message="You haven't placed any orders yet with D&G. Browse our collections and place your first order today!"
              actionTitle="Start Shopping"
              onAction={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderRef: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: colors.textSecondary,
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
    gap: 6,
  },
  paymentLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  totalBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
