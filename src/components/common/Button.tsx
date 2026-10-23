import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacityProps,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isFullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  isFullWidth = true,
  disabled,
  style,
  textStyle,
  icon,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  const getContainerStyle = (): StyleProp<ViewStyle> => {
    const list: any[] = [styles.base];

    if (isFullWidth) {
      list.push(styles.fullWidth);
    }

    // Size
    if (size === 'small') list.push(styles.sizeSmall);
    else if (size === 'large') list.push(styles.sizeLarge);
    else list.push(styles.sizeMedium);

    // Variant
    if (variant === 'accent') {
      list.push(styles.accent);
    } else if (variant === 'outline') {
      list.push(styles.outline);
    } else if (variant === 'ghost') {
      list.push(styles.ghost);
    } else {
      list.push(styles.primary);
    }

    if (isDisabled) {
      list.push(styles.disabled);
    }

    if (style) {
      list.push(style);
    }

    return list;
  };

  const getTextColor = (): string => {
    if (isDisabled) return colors.textMuted;
    if (variant === 'outline' || variant === 'ghost') return colors.primary;
    if (variant === 'accent') return colors.textOnAccent;
    return colors.textOnPrimary;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={getContainerStyle()}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              size === 'small' && styles.textSmall,
              size === 'large' && styles.textLarge,
              { color: getTextColor() },
              icon ? { marginLeft: spacing.xs } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  fullWidth: {
    width: '100%',
  },
  sizeSmall: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  sizeMedium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 46,
  },
  sizeLarge: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  accent: {
    backgroundColor: colors.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: colors.disabledBackground,
    borderColor: colors.disabled,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 13,
  },
  textLarge: {
    fontSize: 16,
  },
});
