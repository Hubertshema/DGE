import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Button, Logo } from '../../../components/common';
import { MessageCircle, Clock, ArrowRight } from 'lucide-react-native';

type RouteProps = RouteProp<RootStackParamList, 'OrderConfirmation'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Official D&G Business WhatsApp contact (configurable from backend environment)
const OFFICIAL_WHATSAPP_PHONE = '250788000000';

export const OrderConfirmationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { orderReference, totalAmount, whatsappUrl: serverWhatsappUrl } = route.params;

  const handleOpenWhatsApp = async () => {
    const rawMessage = `Hello DG, I would like to arrange payment for order ${orderReference}. Total: ${totalAmount.toLocaleString()} RWF. Please share the payment instructions.`;
    const encodedMessage = encodeURIComponent(rawMessage);
    const whatsappUrl = serverWhatsappUrl || `https://wa.me/${OFFICIAL_WHATSAPP_PHONE}?text=${encodedMessage}`;

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback web url
        await Linking.openURL(`https://api.whatsapp.com/send?phone=${OFFICIAL_WHATSAPP_PHONE}&text=${encodedMessage}`);
      }

    } catch (err) {
      Alert.alert(
        'WhatsApp Not Available',
        `Unable to open WhatsApp automatically. Please contact D&G at +${OFFICIAL_WHATSAPP_PHONE} referencing order ${orderReference}.`
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Header with D&G Smile Bag Logo */}
        <View style={styles.successIconContainer}>
          <Logo size={72} />
        </View>

        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.subtitle}>
          Your order has been recorded in our system. Reference code:
        </Text>

        <View style={styles.referenceBadge}>
          <Text style={styles.referenceText}>{orderReference}</Text>
        </View>

        {/* Order Details Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Total Amount</Text>
            <Text style={styles.amount}>RWF {totalAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Status</Text>
            <View style={styles.statusPill}>
              <Clock size={12} color={colors.warning} />
              <Text style={styles.statusText}>Awaiting Payment</Text>
            </View>
          </View>
        </View>

        {/* WhatsApp Payment Arrangement Instructions */}
        <View style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <MessageCircle size={22} color={colors.primary} />
            <Text style={styles.instructionTitle}>Arrange Payment via WhatsApp</Text>
          </View>

          <Text style={styles.instructionBody}>
            D&G arranges direct Mobile Money and cash payments through WhatsApp.
            Click below to send your pre-formatted order details to our seller team in Rwamagana.
          </Text>

          <Button
            title="Open WhatsApp to Pay"
            variant="accent"
            icon={<MessageCircle size={18} color={colors.white} />}
            onPress={handleOpenWhatsApp}
            style={styles.whatsappBtn}
          />
        </View>

        {/* Notice on status verification */}
        <Text style={styles.disclaimerText}>
          * Note: Sending the WhatsApp message does not immediately mark the order as paid.
          Payment will be verified and marked paid by D&G after confirmation.
        </Text>
      </ScrollView>

      {/* Done Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom || spacing.md }]}>
        <Button
          title="Return to Home"
          variant="outline"
          onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' } as any)}
        />
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
    padding: spacing.xl,
    alignItems: 'center',
  },
  successIconContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  referenceBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    marginVertical: spacing.md,
  },
  referenceText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.warning,
    marginLeft: 4,
  },
  instructionCard: {
    width: '100%',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  instructionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  instructionBody: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  whatsappBtn: {
    backgroundColor: colors.accent,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
    width: '100%',
  },
});
