import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Header, Input, Button, Logo } from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { Lock, Mail, User, Phone } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RegisterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { register, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (isLoading) return;

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please complete all required fields.');
      return;
    }
    const res = await register(fullName, email, password, phone);
    if (res.success) {
      navigation.goBack();
    } else {
      Alert.alert('Registration Notice', res.error || 'Registration failed.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="Create Account"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandHeader}>
          <Logo size={72} style={{ marginBottom: spacing.md, alignSelf: 'center' }} />
          <Text style={styles.brandTitle}>D&G</Text>
          <Text style={styles.brandSubtitle}>Create your shopping account</Text>
        </View>

        <View style={styles.formCard}>
          <Input
            label="Full Name"
            placeholder="e.g. Mugisha Jean"
            value={fullName}
            onChangeText={setFullName}
            leftIcon={<User size={18} color={colors.textSecondary} />}
          />

          <Input
            label="Email Address"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={18} color={colors.textSecondary} />}
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="0788 000 000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={colors.textSecondary} />}
          />

          <Input
            label="Password"
            placeholder="Minimum 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={18} color={colors.textSecondary} />}
          />

          <Button
            title="Create Customer Account"
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.btn}
          />

          <View style={styles.loginPrompt}>
            <Text style={styles.promptText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
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
