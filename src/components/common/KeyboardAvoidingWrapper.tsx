import React, { useEffect, useState, forwardRef } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  KeyboardEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../theme';

export interface KeyboardAvoidingWrapperProps extends ScrollViewProps {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle | ViewStyle[];
  extraBottomOffset?: number;
  keyboardVerticalOffset?: number;
  useDynamicAndroidPadding?: boolean;
}

export const KeyboardAvoidingWrapper = forwardRef<any, KeyboardAvoidingWrapperProps>(
  (
    {
      children,
      contentContainerStyle,
      extraBottomOffset = 40,
      keyboardVerticalOffset,
      useDynamicAndroidPadding = true,
      ...scrollViewProps
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

    useEffect(() => {
      const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

      const showSubscription = Keyboard.addListener(
        showEvent,
        (event: KeyboardEvent) => {
          setKeyboardHeight(event.endCoordinates.height);
        }
      );

      const hideSubscription = Keyboard.addListener(
        hideEvent,
        () => {
          setKeyboardHeight(0);
        }
      );

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, []);

    // Calculate vertical offset for iOS (accounting for safe area and header)
    const resolvedVerticalOffset =
      keyboardVerticalOffset !== undefined
        ? keyboardVerticalOffset
        : Platform.OS === 'ios'
        ? insets.top + 10
        : 0;

    // On Android, dynamic bottom padding guarantees that any field and button
    // can be scrolled all the way above the active soft keyboard.
    const dynamicBottomPadding =
      Platform.OS === 'android' && useDynamicAndroidPadding && keyboardHeight > 0
        ? keyboardHeight + extraBottomOffset
        : spacing.xxl;

    return (
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={resolvedVerticalOffset}
      >
        <ScrollView
          ref={ref}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
          contentContainerStyle={[
            styles.defaultContent,
            contentContainerStyle,
            { paddingBottom: dynamicBottomPadding },
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
