import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Header, Button, Logo } from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { useLanguage } from '../../../localization/LanguageContext';
import {
  Package,
  MapPin,
  Globe,
  Store,
  LogOut,
  ChevronRight,
  ShieldCheck,
  User,
  Lock,
} from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user, isAuthenticated, logout, isAdmin, isSeller } = useAuth();
  const { t, currentLanguage } = useLanguage();

  const isOwner = isAdmin || isSeller;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title={t.tabAccount} subtitle="DG Rwanda (Rwamagana)" showLogo={true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <User size={32} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {isAuthenticated && user ? user.fullName : t.welcomeTitle}
            </Text>
            <Text style={styles.userEmail}>
              {isAuthenticated && user
                ? user.email
                : 'Sign in to access your orders and profile'}
            </Text>
            {isOwner ? (
              <View style={styles.adminBadge}>
                <ShieldCheck size={14} color={colors.primary} />
                <Text style={styles.adminBadgeText}>DG Shop Owner (Admin)</Text>
              </View>
            ) : isAuthenticated ? (
              <View style={styles.customerBadge}>
                <Text style={styles.customerBadgeText}>Customer Account</Text>
              </View>
            ) : null}
          </View>
        </View>

        {!isAuthenticated ? (
          <View style={styles.authButtonsRow}>
            <Button
              title={t.signIn}
              onPress={() => navigation.navigate('Login')}
              style={styles.authBtn}
            />
            <Button
              title={t.signUp}
              variant="outline"
              onPress={() => navigation.navigate('Register')}
              style={styles.authBtn}
            />
          </View>
        ) : null}

        {/* DG Shop Owner Admin Section (Exclusive to Admin) */}
        {isOwner ? (
          <View style={[styles.menuSection, { borderColor: colors.primary }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              {t.adminPortal}
            </Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('AdminDashboard')}
            >
              <View style={styles.menuItemLeft}>
                <Store size={20} color={colors.primary} />
                <Text style={[styles.menuItemText, { fontWeight: '700', color: colors.primary }]}>
                  {t.adminDashboard}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('ChangePassword', { isFirstLogin: false })}
            >
              <View style={styles.menuItemLeft}>
                <Lock size={20} color={colors.textSecondary} />
                <Text style={styles.menuItemText}>Change Password</Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Customer Shopping & Orders Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{t.myOrders}</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyOrders')}
          >
            <View style={styles.menuItemLeft}>
              <Package size={20} color={colors.primary} />
              <Text style={styles.menuItemText}>{t.orderHistory}</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('DeliveryAddresses')}
          >
            <View style={styles.menuItemLeft}>
              <MapPin size={20} color={colors.primary} />
              <Text style={styles.menuItemText}>Delivery Addresses</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Language & Preferences */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('LanguageSettings')}
          >
            <View style={styles.menuItemLeft}>
              <Globe size={20} color={colors.primary} />
              <Text style={styles.menuItemText}>
                Language: {currentLanguage === 'rw' ? 'Ikinyarwanda' : 'English'}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {isAuthenticated ? (
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <LogOut size={18} color={colors.danger} />
            <Text style={styles.logoutText}>{t.logout}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.brandFooter}>
          <Logo size={40} />
          <Text style={styles.brandFooterTitle}>DG E-Commerce</Text>
          <Text style={styles.brandFooterText}>
            Rwamagana, Eastern Province, Rwanda • Single-Shop Model
          </Text>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    gap: 4,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  customerBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  customerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  authBtn: {
    flex: 1,
  },
  menuSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  brandFooter: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  brandFooterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  brandFooterText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
