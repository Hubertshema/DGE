import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Header, Button, Logo, Badge } from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { useLanguage } from '../../../localization/LanguageContext';
import { useOrdersQuery } from '../../../api/queries';
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
  Calendar,
  ShoppingBag,
} from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user, token, isAuthenticated, logout, isAdmin, isSeller } = useAuth();
  const { t, currentLanguage } = useLanguage();

  // If not authenticated, redirect immediately to Login / Sign-in page
  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
    }
  }, [isAuthenticated, navigation]);

  // Fetch customer's orders for direct display in the account area
  const {
    data: orders = [],
    isLoading: isLoadingOrders,
  } = useOrdersQuery(token);

  const isOwner = isAdmin || isSeller;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge label={t.delivered} variant="success" size="small" />;
      case 'shipped':
        return <Badge label={t.shipped} variant="info" size="small" />;
      case 'processing':
        return <Badge label={t.processing} variant="info" size="small" />;
      case 'confirmed':
        return <Badge label={t.confirmed} variant="success" size="small" />;
      case 'cancelled':
        return <Badge label={t.cancelled} variant="danger" size="small" />;
      default:
        return <Badge label={t.pending} variant="warning" size="small" />;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge label={t.paid} variant="success" size="small" />;
      case 'payment_rejected':
        return <Badge label={t.payment_rejected} variant="danger" size="small" />;
      case 'payment_under_review':
        return <Badge label={t.payment_under_review} variant="info" size="small" />;
      default:
        return <Badge label={t.awaiting_payment} variant="warning" size="small" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title={t.tabAccount} subtitle="DG Rwanda (Rwamagana)" showLogo={true} showRightActions />
        <View style={styles.guestContainer}>
          <View style={styles.avatar}>
            <User size={36} color={colors.primary} />
          </View>
          <Text style={styles.guestTitle}>{t.signInPrompt}</Text>
          <Text style={styles.guestMessage}>{t.signInPromptDesc}</Text>
          <Button
            title={t.signIn}
            onPress={() => navigation.navigate('Login')}
            style={styles.guestBtn}
          />
          <Button
            title={t.signUp}
            variant="outline"
            onPress={() => navigation.navigate('Register')}
            style={styles.guestBtn}
          />
        </View>
      </View>
    );
  }

  // Display top 4 most recent orders inside customer account area
  const recentOrders = orders.slice(0, 4);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title={t.tabAccount}
        subtitle="DG Rwanda (Rwamagana)"
        showLogo={true}
        showRightActions
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <User size={32} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName || 'Customer'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            {user?.phone ? <Text style={styles.userPhone}>{user.phone}</Text> : null}
            {isOwner ? (
              <View style={styles.adminBadge}>
                <ShieldCheck size={14} color={colors.primary} />
                <Text style={styles.adminBadgeText}>DG Shop Owner (Admin)</Text>
              </View>
            ) : (
              <View style={styles.customerBadge}>
                <Text style={styles.customerBadgeText}>Customer Account</Text>
              </View>
            )}
          </View>
        </View>

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

        {/* ORDER HISTORY SECTION: Directly visible inside customer's account area */}
        <View style={styles.menuSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Package size={18} color={colors.primary} />
              <Text style={styles.sectionTitleText}>{t.orderHistory}</Text>
            </View>
            {orders.length > 0 ? (
              <View style={styles.orderCountPill}>
                <Text style={styles.orderCountText}>{orders.length}</Text>
              </View>
            ) : null}
          </View>

          {isLoadingOrders && orders.length === 0 ? (
            <View style={styles.ordersLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.ordersLoadingText}>Loading your orders...</Text>
            </View>
          ) : orders.length > 0 ? (
            <View style={styles.ordersListContainer}>
              {recentOrders.map((order) => {
                const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const ref = order.orderReference || `#ORD-${order.id.slice(0, 8).toUpperCase()}`;

                return (
                  <TouchableOpacity
                    key={order.id}
                    style={styles.orderCard}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                  >
                    <View style={styles.orderCardTop}>
                      <View style={styles.orderRefGroup}>
                        <Text style={styles.orderRefText}>{ref}</Text>
                        <View style={styles.orderDateRow}>
                          <Calendar size={12} color={colors.textSecondary} />
                          <Text style={styles.orderDateText}>{orderDate}</Text>
                        </View>
                      </View>
                      <View style={styles.orderAmountGroup}>
                        <Text style={styles.orderAmountText}>
                          RWF {Number(order.totalAmount).toLocaleString()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderCardBottom}>
                      <View style={styles.badgesGroup}>
                        {getStatusBadge(order.status)}
                        {getPaymentBadge(order.paymentStatus)}
                      </View>
                      <ChevronRight size={16} color={colors.textSecondary} />
                    </View>
                  </TouchableOpacity>
                );
              })}

              {orders.length > 4 ? (
                <TouchableOpacity
                  style={styles.viewAllOrdersBtn}
                  onPress={() => navigation.navigate('MyOrders')}
                >
                  <Text style={styles.viewAllOrdersText}>
                    {t.myOrders} ({orders.length})
                  </Text>
                  <ChevronRight size={16} color={colors.primary} />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={styles.emptyOrdersContainer}>
              <ShoppingBag size={32} color={colors.textSecondary} style={{ marginBottom: 6 }} />
              <Text style={styles.emptyOrdersTitle}>{t.emptyOrders}</Text>
              <Text style={styles.emptyOrdersSubtitle}>
                {t.emptyOrdersDesc}
              </Text>
              <TouchableOpacity
                style={styles.shopNowBtn}
                onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' } as any)}
              >
                <Text style={styles.shopNowBtnText}>{t.startShopping}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Account Details & Settings Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('DeliveryAddresses')}
          >
            <View style={styles.menuItemLeft}>
              <MapPin size={20} color={colors.primary} />
              <Text style={styles.menuItemText}>{t.deliveryAddresses}</Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePassword', { isFirstLogin: false })}
          >
            <View style={styles.menuItemLeft}>
              <Lock size={20} color={colors.primary} />
              <Text style={styles.menuItemText}>Change Password</Text>
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
                {t.languageSettings}: {currentLanguage === 'rw' ? 'Ikinyarwanda' : 'English'}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Log Out */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await logout();
            navigation.navigate('Login');
          }}
        >
          <LogOut size={18} color={colors.danger} />
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>

        {/* Brand Footer */}
        <View style={styles.brandFooter}>
          <Logo size={40} />
          <Text style={styles.brandFooterTitle}>DG E-Commerce</Text>
          <Text style={styles.brandFooterText}>
            Rwamagana, Eastern Province, Rwanda • Retail Store
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
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  guestMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  guestBtn: {
    width: '100%',
    marginBottom: spacing.md,
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
  userPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderCountPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  orderCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  ordersLoading: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  ordersLoadingText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ordersListContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  orderCard: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  orderRefGroup: {
    flex: 1,
  },
  orderRefText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  orderDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  orderDateText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  orderAmountGroup: {
    alignItems: 'flex-end',
  },
  orderAmountText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  orderCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  badgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  viewAllOrdersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  viewAllOrdersText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyOrdersContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyOrdersTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyOrdersSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  shopNowBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
  },
  shopNowBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
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
