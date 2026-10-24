import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius, shadows } from '../../../theme';
import { Header, Badge, Button, OrderDetailsSkeleton, SyncIndicator } from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { useOrderQuery, useVerifyPaymentMutation, useUpdateOrderStatusMutation } from '../../../api/queries';
import {
  Package,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Truck,
  ShieldAlert,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react-native';

type RouteParams = RouteProp<RootStackParamList, 'SellerOrderDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SellerOrderDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();
  const { orderId } = route.params;

  const {
    data: order,
    isLoading,
    isFetching,
    error: orderError,
    refetch: refetchOrder,
  } = useOrderQuery(orderId, token);
  const verifyPaymentMutation = useVerifyPaymentMutation(token);
  const updateStatusMutation = useUpdateOrderStatusMutation(token);

  const showSkeleton = isLoading && !order;
  const isBackgroundSyncing = isFetching && !isLoading;
  const isUpdating = verifyPaymentMutation.isPending || updateStatusMutation.isPending;

  const handleVerifyPayment = async (status: 'paid' | 'payment_rejected') => {
    if (!token || !order) return;
    Alert.alert(
      status === 'paid' ? 'Confirm Payment Verification' : 'Reject Payment',
      status === 'paid'
        ? `Are you sure you verified the mobile money transfer for ${Number(order.total_amount || order.totalAmount).toLocaleString()} RWF?`
        : 'Are you sure you want to reject this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: status === 'paid' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await verifyPaymentMutation.mutateAsync({
                id: order.id,
                paymentStatus: status,
                notes: status === 'paid' ? 'Verified by seller after MoMo check' : 'Payment rejected by seller',
              });
              Alert.alert('Success', `Payment status updated to ${status}.`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update payment status.');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!token || !order) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: order.id,
        status: newStatus,
      });
      Alert.alert('Order Updated', `Order status set to ${newStatus}.`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update order status.');
    }
  };

  const contactCustomerWhatsApp = () => {
    if (!order?.customer_phone) return;
    const cleanPhone = order.customer_phone.replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('250') ? cleanPhone : `250${cleanPhone.replace(/^0/, '')}`;
    const url = `whatsapp://send?phone=${intlPhone}&text=${encodeURIComponent(
      `Hello ${order.customer_name}, this is D&G regarding order ${order.order_reference}.`
    )}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Notice', `Contact customer at ${order.customer_phone}`);
    });
  };

  if (showSkeleton) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="Order Verification" showBack onBackPress={() => navigation.goBack()} />
        <OrderDetailsSkeleton />
      </View>
    );
  }

  if (orderError && !order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="Order Notice" showBack onBackPress={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
          <Package size={48} color={colors.danger} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.md }}>
            Unable to Load Order
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
            {orderError.message}
          </Text>
          <Button
            title="Try Again"
            onPress={() => refetchOrder()}
            style={{ marginTop: spacing.md, minWidth: 140 }}
          />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="Order Not Found" showBack onBackPress={() => navigation.goBack()} />
      </View>
    );
  }

  const deliveryAddress =
    typeof (order.deliveryAddress || order.delivery_address) === 'string'
      ? JSON.parse(order.deliveryAddress || order.delivery_address)
      : (order.deliveryAddress || order.delivery_address);

  const orderRef = order.orderReference || order.order_reference;
  const customerName = order.customerName || order.customer_name;
  const customerPhone = order.customerPhone || order.customer_phone;
  const paymentStatus = order.paymentStatus || order.payment_status;
  const totalAmount = Number(order.totalAmount || order.total_amount);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={orderRef}
        subtitle="DG Store Order Management"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <SyncIndicator isSyncing={isBackgroundSyncing} label="Checking live payment status..." />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Verification Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Audit & Verification</Text>
          <Text style={styles.subtext}>
            Customer arranges payment via WhatsApp MoMo. Inspect outside payment proof before
            approving.
          </Text>

          <View style={styles.statusRow}>
            <Text style={styles.label}>Current Payment Status:</Text>
            <Badge
              label={String(paymentStatus).toUpperCase()}
              variant={paymentStatus === 'paid' ? 'success' : 'warning'}
            />
          </View>

          {paymentStatus !== 'paid' ? (
            <View style={styles.buttonRow}>
              <Button
                title="Verify as Paid"
                variant="primary"
                icon={<CheckCircle size={18} color={colors.white} />}

                onPress={() => handleVerifyPayment('paid')}
                isLoading={isUpdating}
                style={{ flex: 1 }}
              />
              <Button
                title="Reject"
                variant="outline"
                icon={<XCircle size={18} color={colors.danger} />}
                onPress={() => handleVerifyPayment('payment_rejected')}
                isLoading={isUpdating}
                style={{ flex: 1, borderColor: colors.danger }}
              />
            </View>
          ) : (
            <View style={styles.verifiedBox}>
              <ShieldCheck size={20} color={colors.primary} />
              <Text style={styles.verifiedText}>
                Verified by merchant. Order is eligible for dispatch.
              </Text>
            </View>
          )}
        </View>

        {/* Status Transition Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fulfillment Progression</Text>
          <View style={styles.statusRow}>
            <Text style={styles.label}>Current Status:</Text>
            <Badge label={order.status.replace('_', ' ').toUpperCase()} variant="info" />
          </View>

          <View style={styles.actionsWrap}>
            {order.status === 'pending_confirmation' && (
              <Button
                title="Confirm Order"
                onPress={() => handleUpdateStatus('confirmed')}
                isLoading={isUpdating}
                style={styles.progBtn}
              />
            )}
            {order.status === 'confirmed' && (
              <Button
                title="Start Processing / Packing"
                onPress={() => handleUpdateStatus('processing')}
                isLoading={isUpdating}
                style={styles.progBtn}
              />
            )}
            {order.status === 'processing' && (
              <Button
                title="Dispatch / Mark Shipped"
                icon={<Truck size={18} color={colors.white} />}
                onPress={() => handleUpdateStatus('shipped')}
                isLoading={isUpdating}
                style={styles.progBtn}
              />
            )}
            {order.status === 'shipped' && (
              <Button
                title="Mark as Delivered"
                icon={<CheckCircle size={18} color={colors.white} />}
                onPress={() => handleUpdateStatus('delivered')}
                isLoading={isUpdating}
                style={styles.progBtn}
              />
            )}
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <Button
                title="Cancel Order"
                variant="outline"
                onPress={() => handleUpdateStatus('cancelled')}
                isLoading={isUpdating}
                style={styles.cancelBtn}
              />
            )}
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer & Destination</Text>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.customerPhone}>{customerPhone}</Text>

          <View style={styles.addressBox}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.addressText}>
              {deliveryAddress?.district}, {deliveryAddress?.sector} —{' '}
              {deliveryAddress?.streetDetails}
            </Text>
          </View>

          <Button
            title="Chat with Customer on WhatsApp"
            variant="primary"
            icon={<MessageSquare size={18} color={colors.white} />}
            onPress={contactCustomerWhatsApp}
            style={[styles.progBtn, { marginTop: spacing.md, backgroundColor: '#25D366', borderColor: '#25D366' }]}
          />
        </View>

        {/* Line Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items ({order.items?.length || 0})</Text>
          {order.items?.map((item: any) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productName || item.product_name}</Text>
                {item.variationDetails && (
                  <Text style={styles.itemVar}>{item.variationDetails}</Text>
                )}
                <Text style={styles.itemQty}>
                  Qty: {item.quantity} × {Number(item.unitPrice || item.unit_price).toLocaleString()} RWF
                </Text>
              </View>
              <Text style={styles.itemSubtotal}>
                {Number(item.subtotal).toLocaleString()} RWF
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Order Amount:</Text>
            <Text style={styles.totalValue}>
              {totalAmount.toLocaleString()} RWF
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  subtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  verifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryLight,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
  actionsWrap: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  progBtn: {
    width: '100%',
  },
  cancelBtn: {
    width: '100%',
    borderColor: colors.danger,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  customerPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  addressText: {
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemVar: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  itemQty: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
});
