import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Header, Button, Input, KeyboardAvoidingWrapper } from '../../../components/common';
import { useCart } from '../../../state/CartContext';
import { useAuth } from '../../../state/AuthContext';
import { ShieldCheck, MapPin } from 'lucide-react-native';
import { useCreateOrderMutation } from '../../../api/queries';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CheckoutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const createOrderMutation = useCreateOrderMutation();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState('Rwamagana');
  const [sector, setSector] = useState('Kigabiro');
  const [streetDetails, setStreetDetails] = useState('');

  const isSubmitting = createOrderMutation.isPending;

  const estimatedDeliveryFee = 1500; // 1,500 RWF standard delivery fee
  const estimatedTotal = subtotal + estimatedDeliveryFee;

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;

    if (!fullName.trim() || !phone.trim() || !streetDetails.trim()) {
      Alert.alert(
        'Delivery Information Required',
        'Please provide your full name, phone number, and street/landmark details for delivery in Rwanda.'
      );
      return;
    }

    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return;
    }

    try {
      const orderData = {
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        deliveryAddress: {
          province: 'Eastern Province',
          district: district.trim(),
          sector: sector.trim(),
          streetDetails: streetDetails.trim(),
        },
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          variationDetails: i.selectedVariation?.value,
        })),
        userId: user?.id,
      };

      const savedOrder = await createOrderMutation.mutateAsync(orderData);

      clearCart();

      navigation.replace('OrderConfirmation', {
        orderId: savedOrder.id,
        orderReference: savedOrder.orderReference,
        totalAmount: Number(savedOrder.totalAmount),
        whatsappUrl: savedOrder.whatsappUrl,
      });
    } catch (err: any) {
      Alert.alert('Order Placement Error', err.message || 'Unable to save order to Neon. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="Checkout"
        subtitle="Review & Confirm Delivery"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingWrapper contentContainerStyle={styles.scrollContent}>
        {/* Delivery Address Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Delivery Address (Rwanda)</Text>
          </View>

          <Input
            label="Recipient Full Name"
            placeholder="e.g. Mugisha Jean"
            value={fullName}
            onChangeText={setFullName}
          />

          <Input
            label="Phone Number (for delivery & WhatsApp)"
            placeholder="e.g. 0788 123 456"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Input
                label="District"
                placeholder="District"
                value={district}
                onChangeText={setDistrict}
              />
            </View>
            <View style={styles.halfCol}>
              <Input
                label="Sector"
                placeholder="Sector"
                value={sector}
                onChangeText={setSector}
              />
            </View>
          </View>

          <Input
            label="Street / Landmark / House No."
            placeholder="e.g. Near Rwamagana Market, House 12"
            value={streetDetails}
            onChangeText={setStreetDetails}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>

          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Items Subtotal ({items.length})</Text>
            <Text style={styles.summaryVal}>RWF {subtotal.toLocaleString()}</Text>
          </View>

          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Standard Delivery (Rwamagana)</Text>
            <Text style={styles.summaryVal}>RWF {estimatedDeliveryFee.toLocaleString()}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryLine}>
            <Text style={styles.totalLabel}>Estimated Total</Text>
            <Text style={styles.totalVal}>RWF {estimatedTotal.toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Policy Notice */}
        <View style={styles.noticeCard}>
          <ShieldCheck size={20} color={colors.primary} />
          <Text style={styles.noticeText}>
            Prices and stock are verified authoritatively by Neon PostgreSQL during order creation.
            Payment is arranged via WhatsApp directly with D&G upon placement.
          </Text>
        </View>

        {/* Place Order Action */}
        <View style={styles.actionContainer}>
          <Button
            title={isSubmitting ? 'Saving Order to Neon...' : 'Confirm & Place Order'}
            onPress={handlePlaceOrder}
            isLoading={isSubmitting}
          />
        </View>
      </KeyboardAvoidingWrapper>
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
  },
  card: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfCol: {
    flex: 1,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xxs,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: colors.primaryDark,
    lineHeight: 18,
    marginLeft: spacing.sm,
  },
  actionContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
