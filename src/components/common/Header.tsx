import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, useResponsive } from '../../theme';
import { ArrowLeft, Search, ShoppingBag, Globe, Bell } from 'lucide-react-native';
import { Logo } from './Logo';
import { useCart } from '../../state/CartContext';
import { useLanguage } from '../../localization/LanguageContext';
import { useNotifications } from '../../state/NotificationContext';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showLogo?: boolean;
  onBackPress?: () => void;
  showRightActions?: boolean;
  showNotificationBell?: boolean;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showLogo = false,
  onBackPress,
  showRightActions = false,
  showNotificationBell = false,
  rightAction,
  style,
}) => {
  const navigation = useNavigation<any>();
  const { itemCount } = useCart();
  const { currentLanguage, setLanguage } = useLanguage();
  const { unreadCount } = useNotifications();
  const { isSmallPhone } = useResponsive();

  const renderBell = () => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('NotificationCenter')}
      style={styles.iconButton}
      accessibilityLabel={`Notifications (${unreadCount} unread)`}
    >
      <Bell size={20} color={colors.textPrimary} />
      {unreadCount > 0 ? (
        <View style={styles.notificationBadge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: isSmallPhone ? spacing.sm : spacing.md },
        style,
      ]}
    >
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBackPress}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : null}
        {showLogo ? (
          <View style={styles.logoWrapper}>
            <Logo size={28} />
          </View>
        ) : null}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {rightAction ? (
        <View style={styles.rightContainer}>{rightAction}</View>
      ) : showRightActions ? (
        <View style={styles.rightContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLanguage(currentLanguage === 'en' ? 'rw' : 'en')}
            style={styles.langPill}
            accessibilityLabel="Switch language"
          >
            <Globe size={14} color={colors.primary} />
            <Text style={styles.langText}>{currentLanguage.toUpperCase()}</Text>
          </TouchableOpacity>

          {renderBell()}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('MainTabs', { screen: 'SearchTab' })}
            style={styles.iconButton}
            accessibilityLabel="Search"
          >
            <Search size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Cart')}
            style={styles.iconButton}
            accessibilityLabel="Cart"
          >
            <ShoppingBag size={20} color={colors.textPrimary} />
            {itemCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{itemCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      ) : showNotificationBell ? (
        <View style={styles.rightContainer}>
          {renderBell()}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xxs,
  },
  logoWrapper: {
    marginRight: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginRight: spacing.xs,
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  iconButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.accent,
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.danger,
    minWidth: 17,
    height: 17,
    borderRadius: borderRadius.full,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
});
