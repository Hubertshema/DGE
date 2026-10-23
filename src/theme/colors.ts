/**
 * D&G E-Commerce Brand Colors
 * Defined according to the D&G brand guidelines (prompt.md Section 5).
 * Rule: No gradients anywhere in the application.
 */
export const colors = {
  // Brand Primary & Accent
  primary: '#16834A',         // Primary green
  primaryDark: '#11683B',
  primaryLight: '#E8F5EE',    // Soft green tint for badges / active pills
  accent: '#F28C28',          // Orange accent
  accentLight: '#FEF3E9',     // Soft orange tint

  // Base Neutrals
  white: '#FFFFFF',
  background: '#F5F7F5',      // Light-neutral screen background
  surface: '#FFFFFF',         // Card and modal surface background
  border: '#E1E7E2',          // Subtle border line
  borderFocus: '#16834A',

  // Typography
  textPrimary: '#222222',     // Main text
  textSecondary: '#68756C',   // Subtitle, secondary labels, placeholders
  textMuted: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',

  // System States
  success: '#16834A',
  successLight: '#E8F5EE',
  warning: '#F28C28',
  warningLight: '#FEF3E9',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#EFF6FF',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.45)',
  disabled: '#D1D5DB',
  disabledBackground: '#E5E7EB',
} as const;

export type Colors = typeof colors;
