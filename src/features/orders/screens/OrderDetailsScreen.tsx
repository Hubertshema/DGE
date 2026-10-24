import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius, shadows } from '../../../theme';
import { Header, Badge, Button, CachedImage, OrderDetailsSkeleton, SyncIndicator } from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { useOrderQuery } from '../../../api/queries';
import {
  Package,
  MapPin,
  MessageCircle,
  CreditCard,
  Clock,
  ShieldCheck,
  Phone,
} from 'lucide-react-native';

type RouteParams = RouteProp<RootStackParamList, 'OrderDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RWAMAGANA_WHATSAPP_NUMBER = '250788000000'; // D&G Official Rwanda contact

export const OrderDetailsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { orderId } = route.params;
  const { token } = useAuth();

  const {
    data: order,
    isLoading,
    isFetching,
    error: orderError,
    refetch: refetchOrder,
  } = useOrderQuery(orderId, token);

  const showSkeleton = isLoading && !order;
  const isBackgroundSyncing = isFetching && !isLoading;

  const handleOpenWhatsApp = () => {
    if (!order) return;
    const message = `Hello D&G, I would like to arrange payment for order ${order.order_reference}. Total: ${Number(order.total_amount).toLocaleString()} RWF. Please share the payment instructions.`;
    const url = `whatsapp://send?phone=${RWAMAGANA_WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          const webUrl = `https://wa.me/${RWAMAGANA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
          Linking.openURL(webUrl);
        }
      })
      .catch(() => {
        Alert.alert(
          'WhatsApp Required',
          `Please contact D&G directly at +${RWAMAGANA_WHATSAPP_NUMBER} to complete your Mobile Money payment.`
        );
      });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge label="Delivered" variant="success" />;
      case 'shipped':
        return <Badge label="Shipped" variant="info" />;
      case 'processing':
        return <Badge label="Processing" variant="info" />;
      case 'confirmed':
        return <Badge label="Confirmed" variant="success" />;
      case 'cancelled':
        return <Badge label="Cancelled" variant="danger" />;
      default:
        return <Badge label="Pending Confirmation" variant="warning" />;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge label="Paid & Verified" variant="success" />;
      case 'payment_rejected':
        return <Badge label="Payment Rejected" variant="danger" />;
      case 'payment_under_review':
        return <Badge label="Payment Under Review" variant="info" />;
      default:
        return <Badge label="Awaiting Payment" variant="warning" />;
    }
  };

  if (showSkeleton) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="Order Details" showBack onBackPress={() => navigation.goBack()} />
        <OrderDetailsSkeleton />
      </View>
    );
  }

  if (orderError && !order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="Order Notice" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.notFoundContent}>
          <Package size={48} color={colors.danger} />
          <Text style={styles.notFoundText}>{orderError.message}</Text>
          <Button
            title="Try Again"
            onPress={() => refetchOrder()}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="Order Not Found" showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.notFoundContent}>
          <Package size={48} color={colors.textSecondary} />
          <Text style={styles.notFoundText}>Could not locate order #{orderId}.</Text>
          <Button
            title="Back to Orders"
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </View>
    );
  }

  const deliveryAddress =
    typeof order.delivery_address === 'string'
      ? JSON.parse(order.delivery_address)
      : order.delivery_address;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={order.order_reference}
        subtitle="Rwamagana Order Overview"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <SyncIndicator isSyncing={isBackgroundSyncing} label="Live tracking status..." />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.cardTitle}>Fulfillment Status</Text>
              <Text style={styles.subtext}>
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </Text>
            </View>
            {getStatusBadge(order.status)}
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.cardTitle}>Payment Status</Text>
              <Text style={styles.subtext}>Method: WhatsApp Mobile Money</Text>
            </View>
            {getPaymentBadge(order.payment_status)}
          </View>

          {order.payment_status !== 'paid' ? (
            <View style={styles.paymentNotice}>
              <Clock size={16} color={colors.accent} />
              <Text style={styles.paymentNoticeText}>
                Payment verification is done manually by the D&G team. Send payment proof via
                WhatsApp below.
              </Text>
            </View>
          ) : (
            <View style={styles.verifiedNotice}>
              <ShieldCheck size={16} color={colors.primary} />
              <Text style={styles.verifiedNoticeText}>
                Payment verified by seller on{' '}
                {new Date(order.verified_at || order.updated_at).toLocaleDateString()}.
              </Text>
            </View>
          )}
        </View>

        {/* Line Items */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Ordered Items ({order.items?.length || 0})</Text>
          {order.items?.map((item: any) => (
            <View key={item.id} style={styles.itemRow}>
              <CachedImage
                uri={item.imageUrl}
                style={styles.itemImage}
                resizeMode="cover"
                fallbackText="D&G"
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.productName}
                </Text>
                {item.variationDetails ? (
                  <Text style={styles.itemVariation}>{item.variationDetails}</Text>
                ) : null}
                <Text style={styles.itemQtyPrice}>
                  {item.quantity} × {Number(item.unitPrice).toLocaleString()} RWF
                </Text>
              </View>
              <Text style={styles.itemSubtotal}>
                {Number(item.subtotal).toLocaleString()} RWF
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          {/* Breakdown */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {Number(order.subtotal).toLocaleString()} RWF
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee (Rwamagana standard)</Text>
            <Text style={styles.summaryValue}>
              {Number(order.delivery_fee).toLocaleString()} RWF
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {Number(order.total_amount).toLocaleString()} RWF
            </Text>
          </View>
        </View>

        {/* Delivery Details */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Delivery Information</Text>
          <View style={styles.infoRow}>
            <MapPin size={18} color={colors.primary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoTitle}>
                {deliveryAddress?.district}, {deliveryAddress?.sector}
              </Text>
              <Text style={styles.infoSubtitle}>
                {deliveryAddress?.streetDetails || 'Delivery address specified during checkout'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Phone size={18} color={colors.primary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoTitle}>{order.customer_name}</Text>
              <Text style={styles.infoSubtitle}>{order.customer_phone}</Text>
            </View>
          </View>
        </View>

        {/* WhatsApp Action Button */}
        {order.payment_status !== 'paid' ? (
          <Button
            title="Chat on WhatsApp to Complete Payment"
            variant="primary"
            icon={<MessageCircle size={20} color={colors.white} />}
            onPress={handleOpenWhatsApp}
            style={[styles.actionBtn, { backgroundColor: '#25D366', borderColor: '#25D366' }]}
          />
        ) : null}
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
    maxWidth: 720,
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
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  paymentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  paymentNoticeText: {
    fontSize: 12,
    color: colors.accent,
    flex: 1,
    lineHeight: 16,
  },
  verifiedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  verifiedNoticeText: {
    fontSize: 12,
    color: colors.primary,
    flex: 1,
    lineHeight: 16,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  itemPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemVariation: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  itemQtyPrice: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalRow: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: spacing.sm,
  },
  infoTextGroup: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  notFoundContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notFoundText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
