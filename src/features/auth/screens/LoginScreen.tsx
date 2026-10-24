import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Header, Input, Button, Logo } from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { useLanguage } from '../../../localization/LanguageContext';
import { Lock, Mail } from 'lucide-react-native';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleLogin = async () => {
    if (isLoading) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    setEmailError('');

    const res = await login(trimmedEmail, password);
    if (res.success) {
      if (res.mustChangePassword) {
        navigation.replace('ChangePassword', { isFirstLogin: true });
      } else if (res.isAdmin || res.role === 'admin' || res.user?.role === 'admin') {
        navigation.replace('AdminDashboard');
      } else {
        navigation.goBack();
      }
    } else {
      Alert.alert('Login Notice', res.error || 'Authentication failed.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title={t.signIn}
        showBack
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
            <Logo size={72} style={{ marginBottom: spacing.md, alignSelf: 'center' }} />
            <Text style={styles.brandTitle}>D&G</Text>
            <Text style={styles.brandSubtitle}>{t.signInSubtitle}</Text>
          </View>

          <View style={styles.formCard}>
            <Input
              label={t.emailAddress}
              placeholder="name@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Mail size={18} color={colors.textSecondary} />}
            />

            <Input
              label={t.password}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon={<Lock size={18} color={colors.textSecondary} />}
            />

            <Button
              title={t.signIn}
              onPress={handleLogin}
              isLoading={isLoading}
              style={styles.loginBtn}
            />

            <View style={styles.registerPrompt}>
              <Text style={styles.promptText}>{t.noAccount} </Text>
              <TouchableOpacity onPress={() => navigation.replace('Register')}>
                <Text style={styles.registerLink}>{t.register}</Text>
              </TouchableOpacity>
            </View>
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
    marginVertical: spacing.xl,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  formCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loginBtn: {
    marginTop: spacing.md,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  promptText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
