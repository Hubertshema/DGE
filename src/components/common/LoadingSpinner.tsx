import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';

export interface LoadingSpinnerProps {
  message?: string;
  style?: ViewStyle;
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  style,
  size = 'large',
  color = colors.primary,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
