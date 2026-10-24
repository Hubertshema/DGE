import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import {
  Header,
  Input,
  Button,
  Logo,
  PasswordStrengthIndicator,
  evaluatePasswordStrength,
  KeyboardAvoidingWrapper,
} from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { useLanguage } from '../../../localization/LanguageContext';
import { Lock, Mail, User, Phone } from 'lucide-react-native';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RegisterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { register, isLoading } = useAuth();
  const { t } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleRegister = async () => {
    if (isLoading) return;

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      Alert.alert('Required Fields', 'Please complete all required fields.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    setEmailError('');

    const strength = evaluatePasswordStrength(trimmedPassword);
    if (!strength.isValid) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number.'
      );
      return;
    }

    const res = await register(trimmedName, trimmedEmail, trimmedPassword, phone);
    if (res.success) {
      navigation.goBack();
    } else {
      Alert.alert('Registration Notice', res.error || 'Registration failed.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title={t.createAccount}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingWrapper contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandHeader}>
          <Logo size={72} style={{ marginBottom: spacing.md, alignSelf: 'center' }} />
          <Text style={styles.brandTitle}>D&G</Text>
          <Text style={styles.brandSubtitle}>{t.createAccountSubtitle}</Text>
        </View>

        <View style={styles.formCard}>
          <Input
            label={t.fullName}
            placeholder="e.g. Mugisha Jean"
            value={fullName}
            onChangeText={setFullName}
            leftIcon={<User size={18} color={colors.textSecondary} />}
          />

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
            label={t.phoneNumber}
            placeholder="0788 000 000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={colors.textSecondary} />}
          />

          <Input
            label={t.password}
            placeholder="Minimum 8 characters"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon={<Lock size={18} color={colors.textSecondary} />}
          />

          <PasswordStrengthIndicator password={password} />

          <Button
            title={t.signUp}
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.btn}
          />

          <View style={styles.loginPrompt}>
            <Text style={styles.promptText}>{t.haveAccount} </Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.loginLink}>{t.signIn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingWrapper>
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
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 80,
  },
  brandHeader: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 13,
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
  btn: {
    marginTop: spacing.md,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  promptText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
