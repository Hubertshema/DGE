import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Header, Input, Button, Logo } from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { Lock, Mail } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (isLoading) return;

    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }
    const res = await login(email, password);
    if (res.success) {
      if (res.mustChangePassword) {
        navigation.replace('ChangePassword', { isFirstLogin: true });
      } else if (res.isAdmin || res.role === 'admin' || res.user?.role === 'admin') {
        // Automatically route admin user directly to their Admin Dashboard
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
        title="Sign In"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandHeader}>
          <Logo size={72} style={{ marginBottom: spacing.md, alignSelf: 'center' }} />
          <Text style={styles.brandTitle}>D&G</Text>
          <Text style={styles.brandSubtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.formCard}>
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
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={18} color={colors.textSecondary} />}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            isLoading={isLoading}
            style={styles.loginBtn}
          />

          <View style={styles.registerPrompt}>
            <Text style={styles.promptText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Register')}>
              <Text style={styles.registerLink}>Register</Text>
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
