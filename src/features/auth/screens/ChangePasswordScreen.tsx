import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Header, Input, Button, Logo, PasswordStrengthIndicator, evaluatePasswordStrength } from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { useLanguage } from '../../../localization/LanguageContext';
import { Lock, ShieldCheck } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'ChangePassword'>;

export const ChangePasswordScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { changePassword, isLoading } = useAuth();
  const { t } = useLanguage();

  const isFirstLogin = route.params?.isFirstLogin ?? false;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChange = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Required', 'Please fill in all password fields.');
      return;
    }

    const strength = evaluatePasswordStrength(newPassword);
    if (!strength.isValid) {
      Alert.alert(
        'Weak Password',
        'New password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation password do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert('Invalid', 'New password must be different from current password.');
      return;
    }

    const res = await changePassword(currentPassword, newPassword);
    if (res.success) {
      Alert.alert('Success', 'Password has been updated securely.', [
        {
          text: 'Continue',
          onPress: () => {
            if (isFirstLogin) {
              navigation.replace('AdminDashboard');
            } else {
              navigation.goBack();
            }
          },
        },
      ]);
    } else {
      Alert.alert('Error', res.error || 'Failed to update password.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title={t.changePasswordTitle}
        showBack={!isFirstLogin}
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandHeader}>
            <Logo size={64} style={{ marginBottom: spacing.sm, alignSelf: 'center' }} />
            <Text style={styles.brandTitle}>DG Security</Text>
            <Text style={styles.brandSubtitle}>
              {isFirstLogin ? t.changePasswordDesc : 'Update your account password'}
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.noticeBox}>
              <ShieldCheck size={20} color={colors.primary} />
              <Text style={styles.noticeText}>
                {isFirstLogin
                  ? 'DG Owner setup: configure your private, permanent password now to safeguard shop operations.'
                  : 'Choose a strong password with letters, numbers, and symbols.'}
              </Text>
            </View>

            <Input
              label={t.currentPassword}
              placeholder="••••••••"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              isPassword
              leftIcon={<Lock size={18} color={colors.textSecondary} />}
            />

            <Input
              label={t.newPassword}
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChangeText={setNewPassword}
              isPassword
              leftIcon={<Lock size={18} color={colors.textSecondary} />}
            />

            <PasswordStrengthIndicator password={newPassword} />

            <Input
              label={t.confirmNewPassword}
              placeholder="Repeat new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              leftIcon={<Lock size={18} color={colors.textSecondary} />}
            />

            <Button
              title={t.updatePasswordBtn}
              onPress={handleChange}
              isLoading={isLoading}
              style={styles.btn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  brandHeader: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  formCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: colors.primaryDark,
    lineHeight: 18,
  },
  btn: {
    marginTop: spacing.md,
  },
});
