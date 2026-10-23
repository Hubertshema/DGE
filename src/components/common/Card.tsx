import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  noPadding = false,
}) => {
  const containerStyle = [
    styles.card,
    noPadding ? null : styles.padding,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={containerStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  padding: {
    padding: spacing.md,
  },
});
