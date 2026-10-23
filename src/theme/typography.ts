import { TextStyle } from 'react-native';
import { colors } from './colors';

/**
 * Standard Typography Scale for D&G E-Commerce
 */
export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.textSecondary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.textPrimary,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.textSecondary,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: colors.textSecondary,
  },
  button: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  priceLarge: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    color: colors.primary,
  },
  priceMedium: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: colors.primary,
  },
  priceSmall: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    color: colors.primary,
  },
};
