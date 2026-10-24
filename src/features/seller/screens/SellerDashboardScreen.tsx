import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius, shadows } from '../../../theme';
import { Header, SyncIndicator } from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { useLanguage } from '../../../localization/LanguageContext';
import { useSellerMetricsQuery, useCategoriesQuery } from '../../../api/queries';
import { AdminBottomNav } from '../components/AdminBottomNav';
import {
  Package,
  Layers,
  ClipboardList,
  CheckCircle,
  TrendingUp,
  Users,
  Shield,
  Lock,
  ChevronRight,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Globe,
  MapPin,
  LogOut,
  Phone,
} from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SellerDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { isAdmin, isSeller, token, user, logout } = useAuth();
  const { t, currentLanguage } = useLanguage();

  const {
    data: metricData,
    isRefetching: isRefetchingMetrics,
    refetch: refetchMetrics,
  } = useSellerMetricsQuery(token);

  const {
    data: categories = [],
    isRefetching: isRefetchingCats,
    refetch: refetchCats,
  } = useCategoriesQuery();

  const metrics = metricData || {
    totalOrders: 0,
    pendingOrders: 0,
    awaitingPayment: 0,
    totalRevenueRwf: 0,
  };
  const categoriesCount = categories.length || 6;
  const isRefreshing = isRefetchingMetrics || isRefetchingCats;

  const onRefresh = () => {
    refetchMetrics();
    refetchCats();
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of the DG Admin portal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('MainTabs');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={t.adminDashboard}
        subtitle="DG Store Owner Portal (Rwamagana)"
        showBack
        showLogo
        showNotificationBell
        onBackPress={() => navigation.goBack()}
      />

      <SyncIndicator isSyncing={!isRefreshing && (isRefetchingMetrics || isRefetchingCats)} label="Syncing live business metrics..." />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {!isAdmin && !isSeller ? (
          <View style={styles.protectedNotice}>
            <Shield size={24} color={colors.warning} />
            <Text style={styles.protectedTitle}>Restricted DG Owner Portal</Text>
            <Text style={styles.protectedBody}>
              This area is restricted to the DG administrator account. Customer accounts cannot access shop management.
            </Text>
          </View>
        ) : null}

        {/* Store Health & DB Status */}
        <View style={styles.systemStatusBanner}>
          <View style={styles.systemStatusLeft}>
            <View style={styles.liveIndicator} />
            <Text style={styles.systemStatusText}>Store Online • Rwamagana Branch</Text>
          </View>
          <View style={styles.systemStatusRight}>
            <Database size={13} color={colors.primary} />
            <Text style={styles.dbTag}>Neon PostgreSQL</Text>
          </View>
        </View>

        {/* Section: Key Financial & Order Metrics */}
        <Text style={styles.sectionHeading}>Business Performance</Text>
        <View style={styles.metricsGrid}>
          {/* Revenue Card */}
          <TouchableOpacity
            style={[styles.metricCard, styles.revenueCard]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AdminReports')}
          >
            <View style={styles.metricCardTop}>
              <Text style={styles.metricLabel}>{t.totalRevenue}</Text>
              <ArrowUpRight size={16} color={colors.primary} />
            </View>
            <Text style={styles.revenueVal}>
              {metrics.totalRevenueRwf.toLocaleString()} RWF
            </Text>
            <Text style={styles.metricSub}>Verified paid receipts</Text>
          </TouchableOpacity>

          {/* Pending Fulfillment Card */}
          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SellerOrders')}
          >
            <View style={styles.metricCardTop}>
              <Text style={styles.metricLabel}>{t.pending_confirmation}</Text>
              <ClipboardList size={16} color={colors.primary} />
            </View>
            <Text style={styles.metricVal}>{metrics.pendingOrders}</Text>
            <Text style={styles.metricSub}>Requires dispatch</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metricsGrid}>
          {/* WhatsApp Payment Verification Card */}
          <TouchableOpacity
            style={[
              styles.metricCard,
              metrics.awaitingPayment > 0 && styles.warningCard,
            ]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SellerOrders')}
          >
            <View style={styles.metricCardTop}>
              <Text style={styles.metricLabel}>{t.awaiting_payment}</Text>
              <CheckCircle
                size={16}
                color={metrics.awaitingPayment > 0 ? colors.warning : colors.textSecondary}
              />
            </View>
            <Text
              style={[
                styles.metricVal,
                metrics.awaitingPayment > 0 && { color: colors.warning },
              ]}
            >
              {metrics.awaitingPayment}
            </Text>
            <Text style={styles.metricSub}>WhatsApp MoMo verify</Text>
          </TouchableOpacity>

          {/* Total Orders Card */}
          <TouchableOpacity
            style={styles.metricCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SellerOrders')}
          >
            <View style={styles.metricCardTop}>
              <Text style={styles.metricLabel}>{t.totalOrdersCount}</Text>
              <TrendingUp size={16} color={colors.textSecondary} />
            </View>
            <Text style={styles.metricVal}>{metrics.totalOrders}</Text>
            <Text style={styles.metricSub}>Total orders placed</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Operational Hub (Categories & Customers) */}
        <Text style={styles.sectionHeading}>Store Management Hub</Text>
        <View style={styles.hubGrid}>
          {/* Categories Card */}
          <TouchableOpacity
            style={styles.hubCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AdminCategories')}
          >
            <View style={[styles.hubIconBg, { backgroundColor: colors.primaryLight }]}>
              <Layers size={22} color={colors.primary} />
            </View>
            <View style={styles.hubTextCol}>
              <Text style={styles.hubTitle}>{t.manageCategories}</Text>
              <Text style={styles.hubSubtitle}>{categoriesCount} active departments</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Customer Directory Card */}
          <TouchableOpacity
            style={styles.hubCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AdminCustomers')}
          >
            <View style={[styles.hubIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Users size={22} color="#2563EB" />
            </View>
            <View style={styles.hubTextCol}>
              <Text style={styles.hubTitle}>{t.customersList}</Text>
              <Text style={styles.hubSubtitle}>Directory, contacts & spend</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Section: Admin Profile & Settings */}
        <Text style={styles.sectionHeading}>Admin Profile Settings</Text>
        <View style={styles.profileCard}>
          {/* Profile Identity Row */}
          <View style={styles.profileHeaderRow}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarLetter}>
                {(user?.fullName || 'DG').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileDetailsCol}>
              <Text style={styles.profileName}>
                {user?.fullName || 'DG Store Administrator'}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.email || 'admin@dgecommerce.rw'}
              </Text>
              <View style={styles.adminRoleBadge}>
                <ShieldCheck size={13} color={colors.primary} />
                <Text style={styles.adminRoleText}>Store Owner • Full Access</Text>
              </View>
            </View>
          </View>

          {user?.phone ? (
            <View style={styles.profilePhoneRow}>
              <Phone size={13} color={colors.textSecondary} />
              <Text style={styles.profilePhoneText}>{user.phone}</Text>
            </View>
          ) : null}

          <View style={styles.profileDivider} />

          {/* Language & Preferences */}
          <TouchableOpacity
            style={styles.profileMenuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('LanguageSettings')}
          >
            <View style={styles.profileMenuLeft}>
              <View style={[styles.profileMenuIcon, { backgroundColor: colors.primaryLight }]}>
                <Globe size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.profileMenuTitle}>Language & Display</Text>
                <Text style={styles.profileMenuSubtitle}>
                  Current: {currentLanguage === 'rw' ? 'Ikinyarwanda' : 'English'}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Password & Security */}
          <TouchableOpacity
            style={styles.profileMenuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ChangePassword', { isFirstLogin: false })}
          >
            <View style={styles.profileMenuLeft}>
              <View style={[styles.profileMenuIcon, { backgroundColor: '#FEF3C7' }]}>
                <Lock size={18} color="#D97706" />
              </View>
              <View>
                <Text style={styles.profileMenuTitle}>Security & Credentials</Text>
                <Text style={styles.profileMenuSubtitle}>Update administrator password</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Store Branch HQ */}
          <View style={styles.profileMenuItem}>
            <View style={styles.profileMenuLeft}>
              <View style={[styles.profileMenuIcon, { backgroundColor: '#F3F4F6' }]}>
                <MapPin size={18} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.profileMenuTitle}>Store Branch HQ</Text>
                <Text style={styles.profileMenuSubtitle}>Rwamagana City Center, Rwanda</Text>
              </View>
            </View>
            <View style={styles.hqBadge}>
              <Text style={styles.hqBadgeText}>Main</Text>
            </View>
          </View>

          {/* Sign Out Action */}
          <TouchableOpacity
            style={styles.signOutBtn}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <LogOut size={16} color={colors.danger} />
            <Text style={styles.signOutText}>Sign Out of Admin Portal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fixed Bottom Navigation Bar */}
      <AdminBottomNav
        activeTab="overview"
        pendingOrdersCount={metrics.pendingOrders + metrics.awaitingPayment}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 95, // Space for the fixed bottom navigation bar
  },
  protectedNotice: {
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.warning,
    marginBottom: spacing.md,
  },
  protectedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.warning,
    marginTop: spacing.xs,
  },
  protectedBody: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 18,
    marginTop: 2,
  },
  systemStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  systemStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  systemStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  systemStatusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dbTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  revenueCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  warningCard: {
    borderColor: colors.warning,
  },
  metricCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  revenueVal: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
    marginVertical: 4,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 2,
  },
  metricSub: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  hubGrid: {
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  hubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  hubIconBg: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  hubTextCol: {
    flex: 1,
  },
  hubTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  hubSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  profileDetailsCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  adminRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  adminRoleText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  profilePhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  profilePhoneText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  profileDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileMenuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileMenuIcon: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileMenuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  profileMenuSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  hqBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  hqBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    marginTop: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
});
