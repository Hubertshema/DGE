import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../../theme';

export interface PasswordRule {
  key: string;
  label: string;
  valid: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  strengthLabel: string;
  strengthColor: string;
  rules: PasswordRule[];
  isValid: boolean;
}

export const evaluatePasswordStrength = (password: string): PasswordStrengthResult => {
  const p = password || '';
  const hasMinLength = p.length >= 8;
  const hasUpper = /[A-Z]/.test(p);
  const hasLower = /[a-z]/.test(p);
  const hasNumber = /[0-9]/.test(p);
  const hasSpecial = /[^A-Za-z0-9]/.test(p);

  const rules: PasswordRule[] = [
    { key: 'minLen', label: 'At least 8 characters', valid: hasMinLength },
    { key: 'upper', label: 'One uppercase letter (A-Z)', valid: hasUpper },
    { key: 'lower', label: 'One lowercase letter (a-z)', valid: hasLower },
    { key: 'number', label: 'One number (0-9)', valid: hasNumber },
    { key: 'special', label: 'One special symbol (!@#$...)', valid: hasSpecial },
  ];

  const passCount = rules.filter(r => r.valid).length;
  let score = 0;
  let strengthLabel = 'Very Weak';
  let strengthColor: string = colors.danger;

  if (p.length === 0) {
    score = 0;
    strengthLabel = '';
    strengthColor = colors.border;
  } else if (passCount <= 2) {
    score = 1;
    strengthLabel = 'Weak';
    strengthColor = colors.danger;
  } else if (passCount === 3) {
    score = 2;
    strengthLabel = 'Fair';
    strengthColor = colors.warning || '#D97706';
  } else if (passCount === 4) {
    score = 3;
    strengthLabel = 'Good';
    strengthColor = colors.accent;
  } else {
    score = 4;
    strengthLabel = 'Strong';
    strengthColor = colors.primary;
  }

  // Password is considered valid when all mandatory conditions are met (at least 8 chars, upper, lower, number)
  const isValid = hasMinLength && hasUpper && hasLower && hasNumber;

  return {
    score,
    strengthLabel,
    strengthColor,
    rules,
    isValid,
  };
};

interface PasswordStrengthIndicatorProps {
  password: string;
  showRules?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRules = true,
}) => {
  if (!password) {
    return null;
  }

  const { score, strengthLabel, strengthColor, rules } = evaluatePasswordStrength(password);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Password Strength</Text>
        <Text style={[styles.strengthText, { color: strengthColor }]}>{strengthLabel}</Text>
      </View>

      {/* Strength Bar */}
      <View style={styles.barContainer}>
        {[1, 2, 3, 4].map(step => (
          <View
            key={step}
            style={[
              styles.barSegment,
              {
                backgroundColor: step <= score ? strengthColor : colors.border,
              },
            ]}
          />
        ))}
      </View>

      {/* Rules Checklist */}
      {showRules && (
        <View style={styles.rulesContainer}>
          {rules.map(rule => (
            <View key={rule.key} style={styles.ruleItem}>
              {rule.valid ? (
                <Check size={14} color={colors.primary} strokeWidth={3} />
              ) : (
                <X size={14} color={colors.textMuted} strokeWidth={2} />
              )}
              <Text style={[styles.ruleText, rule.valid && styles.ruleTextValid]}>
                {rule.label}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '700',
  },
  barContainer: {
    flexDirection: 'row',
    height: 4,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    gap: 4,
    marginBottom: spacing.sm,
  },
  barSegment: {
    flex: 1,
    height: '100%',
    borderRadius: borderRadius.full,
  },
  rulesContainer: {
    gap: 4,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  ruleTextValid: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
});
