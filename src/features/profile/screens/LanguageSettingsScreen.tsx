import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows } from '../../../theme';
import { Header } from '../../../components/common';
import { useLanguage } from '../../../localization/LanguageContext';
import { Check, Globe } from 'lucide-react-native';

export const LanguageSettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { language, setLanguage, t } = useLanguage();

  const options: { code: 'en' | 'rw'; label: string; nativeLabel: string }[] = [
    { code: 'en', label: 'English', nativeLabel: 'Default' },
    { code: 'rw', label: 'Ikinyarwanda', nativeLabel: 'Kinyarwanda' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Language Settings"
        subtitle="Hitamo Ururimi"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View style={styles.card}>
          {options.map((opt, index) => {
            const isSelected = language === opt.code;
            return (
              <TouchableOpacity
                key={opt.code}
                activeOpacity={0.8}
                style={[
                  styles.optionRow,
                  index > 0 && styles.borderTop,
                  isSelected && styles.optionSelected,
                ]}
                onPress={() => setLanguage(opt.code)}
              >
                <View style={styles.optionLeft}>
                  <Globe
                    size={22}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                  <View style={styles.labelGroup}>
                    <Text
                      style={[
                        styles.label,
                        isSelected && { color: colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text style={styles.sublabel}>{opt.nativeLabel}</Text>
                  </View>
                </View>

                {isSelected ? <Check size={20} color={colors.primary} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.note}>
          Language changes apply immediately across navigation labels, order statuses, and
          shopping flows.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  labelGroup: {
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sublabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  note: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
