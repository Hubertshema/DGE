import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Header, EmptyState } from '../../../components/common';
import { useNotifications, AppNotification } from '../../../state/NotificationContext';
import { useAuth } from '../../../state/AuthContext';
import { useLanguage } from '../../../localization/LanguageContext';
import {
  Bell,
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  CheckCheck,
  ChevronRight,
  AlertCircle,
} from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const NotificationCenterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { notifications, unreadCount, isLoading, isRefreshing, markAsRead, markAllAsRead, refetch } =
    useNotifications();
  const { isAdmin, user } = useAuth();
  const { t } = useLanguage();

  const handleNotificationPress = async (item: AppNotification) => {
    // 1. Mark as read immediately
    if (!item.isRead) {
      markAsRead(item.id);
    }

    // 2. Navigate to related order if applicable
    if (item.orderId) {
      if (isAdmin || user?.role === 'admin') {
        navigation.navigate('AdminOrderDetail', { orderId: item.orderId });
      } else {
        navigation.navigate('OrderDetails', { orderId: item.orderId });
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
      case 'order_created':
        return <Package size={20} color={colors.primary} />;
      case 'order_shipped':
        return <Truck size={20} color="#0284C7" />;
      case 'order_delivered':
        return <CheckCircle2 size={20} color={colors.primary} />;
      case 'order_cancelled':
        return <XCircle size={20} color={colors.danger} />;
      case 'payment_verified':
      case 'payment_paid':
        return <CreditCard size={20} color={colors.primary} />;
      case 'payment_rejected':
        return <AlertCircle size={20} color={colors.danger} />;
      default:
        return <Bell size={20} color={colors.textSecondary} />;
    }
  };

  const formatTimestamp = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';

      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const renderHeaderRight = () => {
    if (unreadCount === 0 && notifications.length === 0) return null;
    return (
      <TouchableOpacity
        onPress={markAllAsRead}
        activeOpacity={0.7}
        style={styles.markAllBtn}
        accessibilityLabel="Mark all as read"
      >
        <CheckCheck size={16} color={colors.primary} />
        <Text style={styles.markAllText}>Mark all read</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleNotificationPress(item)}
        style={[styles.card, !item.isRead && styles.cardUnread]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrapper, !item.isRead && styles.iconWrapperUnread]}>
            {getNotificationIcon(item.type)}
          </View>
          <View style={styles.cardTitleContainer}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.cardTitle, !item.isRead && styles.cardTitleUnread]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {!item.isRead ? <View style={styles.unreadDot} /> : null}
            </View>
            <Text style={styles.timeText}>{formatTimestamp(item.createdAt)}</Text>
          </View>
        </View>

        <Text style={styles.cardMessage}>{item.message}</Text>

        <View style={styles.cardFooter}>
          {item.orderReference ? (
            <View style={styles.orderPill}>
              <Package size={12} color={colors.primary} />
              <Text style={styles.orderPillText}>Order #{item.orderReference}</Text>
            </View>
          ) : (
            <View />
          )}

          {item.orderId ? (
            <View style={styles.actionHint}>
              <Text style={styles.actionHintText}>View order</Text>
              <ChevronRight size={14} color={colors.primary} />
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={renderHeaderRight()}
      />

      {isLoading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Bell size={36} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No Notifications Yet</Text>
              <Text style={styles.emptySubtitle}>
                You will receive alerts here about order progress, shipping updates, and payment confirmations.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.textSecondary,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardUnread: {
    borderColor: colors.primary,
    backgroundColor: '#FAFDFB',
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  iconWrapperUnread: {
    backgroundColor: colors.primaryLight,
  },
  cardTitleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  cardTitleUnread: {
    fontWeight: '800',
    color: colors.textPrimary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.xs,
  },
  timeText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.xxs,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  orderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  orderPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
});
