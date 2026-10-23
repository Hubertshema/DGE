import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

export interface SyncIndicatorProps {
  isSyncing: boolean;
  label?: string;
  style?: ViewStyle;
}

/**
 * SyncIndicator
 *
 * A subtle, non-intrusive indicator shown during background auto-refreshes.
 * Ensures the screen preserves current content without flashing skeletons.
 */
export const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  isSyncing,
  label = 'Updating live status...',
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSyncing) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isSyncing, fadeAnim]);

  if (!isSyncing) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }, style]}>
      <View style={styles.pill}>
        <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
        <Text style={styles.text}>{label}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    zIndex: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#CBE5D5',
  },
  spinner: {
    transform: [{ scale: 0.65 }],
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryDark,
  },
});
