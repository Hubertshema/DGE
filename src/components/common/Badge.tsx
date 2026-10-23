import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';
import { OrderStatus, PaymentStatus } from '../../types';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary' | 'accent';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'small' | 'medium';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  style,
  textStyle,
  size = 'medium',
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.successLight, text: colors.success };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning };
      case 'danger':
        return { bg: colors.dangerLight, text: colors.danger };
      case 'info':
        return { bg: colors.infoLight, text: colors.info };
      case 'primary':
        return { bg: colors.primaryLight, text: colors.primary };
      case 'accent':
        return { bg: colors.accentLight, text: colors.accent };
      default:
        return { bg: colors.disabledBackground, text: colors.textSecondary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View
      style={[
        styles.badge,
        size === 'small' && styles.badgeSmall,
        { backgroundColor: bg },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'small' && styles.textSmall,
          { color: text },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

export const getOrderStatusBadge = (status: OrderStatus): { label: string; variant: BadgeVariant } => {
  switch (status) {
    case 'pending_confirmation':
      return { label: 'Pending Confirmation', variant: 'warning' };
    case 'confirmed':
      return { label: 'Confirmed', variant: 'info' };
    case 'processing':
      return { label: 'Processing', variant: 'primary' };
    case 'shipped':
      return { label: 'Shipped', variant: 'info' };
    case 'delivered':
      return { label: 'Delivered', variant: 'success' };
    case 'cancelled':
      return { label: 'Cancelled', variant: 'danger' };
    default:
      return { label: status, variant: 'default' };
  }
};

export const getPaymentStatusBadge = (status: PaymentStatus): { label: string; variant: BadgeVariant } => {
  switch (status) {
    case 'awaiting_payment':
      return { label: 'Awaiting Payment', variant: 'warning' };
    case 'payment_under_review':
      return { label: 'Payment Under Review', variant: 'info' };
    case 'paid':
      return { label: 'Paid', variant: 'success' };
    case 'payment_rejected':
      return { label: 'Payment Rejected', variant: 'danger' };
    case 'refunded':
      return { label: 'Refunded', variant: 'default' };
    default:
      return { label: status, variant: 'default' };
  }
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSmall: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  textSmall: {
    fontSize: 10,
  },
});
