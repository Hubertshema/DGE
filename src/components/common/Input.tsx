import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  onFocus,
  onBlur,
  editable = true,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBorderColor = (): string => {
    if (error) return colors.danger;
    if (isFocused) return colors.borderFocus;
    return colors.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          !editable && styles.disabledContainer,
        ]}
      >
        {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, inputStyle]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          {...rest}
        />
        {rightIcon ? (
          <TouchableOpacity
            disabled={!onRightIconPress}
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  disabledContainer: {
    backgroundColor: colors.disabledBackground,
  },
  leftIconContainer: {
    marginRight: spacing.sm,
  },
  rightIconContainer: {
    marginLeft: spacing.sm,
    padding: spacing.xxs,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xxs,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
});
