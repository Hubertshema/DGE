import React, { forwardRef } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../theme';

export interface KeyboardAvoidingWrapperProps extends ScrollViewProps {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle | ViewStyle[];
  keyboardVerticalOffset?: number;
  extraBottomOffset?: number;
}

export const KeyboardAvoidingWrapper = forwardRef<any, KeyboardAvoidingWrapperProps>(
  (
    {
      children,
      contentContainerStyle,
      keyboardVerticalOffset,
      extraBottomOffset = spacing.lg,
      ...scrollViewProps
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();

    // On iOS, the header height (56dp) + safe area top inset must be offset.
    // On Android, windowSoftInputMode="adjustResize" resizes the window natively,
    // so behavior=undefined is used to let Android resize smoothly without jumping.
    const resolvedVerticalOffset =
      keyboardVerticalOffset !== undefined
        ? keyboardVerticalOffset
        : Platform.OS === 'ios'
        ? insets.top + 56
        : 0;

    const safeBottomPadding = (insets.bottom || spacing.md) + extraBottomOffset;

    return (
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={resolvedVerticalOffset}
      >
        <ScrollView
          ref={ref}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
          contentContainerStyle={[
            styles.defaultContent,
            contentContainerStyle,
            { paddingBottom: safeBottomPadding },
          ]}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
);

KeyboardAvoidingWrapper.displayName = 'KeyboardAvoidingWrapper';

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  defaultContent: {
    flexGrow: 1,
  },
});
