import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Header, LoadingSpinner } from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { useLanguage } from '../../../localization/LanguageContext';
import { useAdminCustomersQuery } from '../../../api/queries';
import { User, Phone, Mail, ShoppingBag, Calendar } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminCustomersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();
  const { t } = useLanguage();

  const {
    data: customers = [],
    isLoading,
    isRefetching,
    refetch,
  } = useAdminCustomersQuery(token);

  const onRefresh = () => {
    refetch();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={t.customersList}
        subtitle={`${customers.length} registered customers`}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {isLoading && customers.length === 0 ? (
        <LoadingSpinner message="Loading customer directory..." />
      ) : customers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <User size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Customers Yet</Text>
          <Text style={styles.emptySubtitle}>
            When customers register and place orders, their details will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.customerCard}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.customerDetails}>
                  <Text style={styles.customerName}>{item.fullName}</Text>
                  <View style={styles.row}>
                    <Mail size={12} color={colors.textSecondary} />
                    <Text style={styles.customerEmail}>{item.email}</Text>
                  </View>
                  {item.phone ? (
                    <TouchableOpacity
                      style={styles.row}
                      onPress={() => Linking.openURL(`tel:${item.phone}`)}
                    >
                      <Phone size={12} color={colors.primary} />
                      <Text style={[styles.customerPhone, { color: colors.primary }]}>
                        {item.phone}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardStats}>
                <View style={styles.statItem}>
                  <ShoppingBag size={14} color={colors.textSecondary} />
                  <Text style={styles.statLabel}>Orders:</Text>
                  <Text style={styles.statValue}>{item.ordersCount}</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Spend:</Text>
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {Number(item.totalSpentRwf).toLocaleString()} RWF
                  </Text>
                </View>
              </View>

              <View style={styles.joinedRow}>
                <Calendar size={12} color={colors.textMuted} />
                <Text style={styles.joinedText}>
                  Joined {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
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
  },
  customerCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  customerEmail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  customerPhone: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  joinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  joinedText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
