import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import {
  LayoutDashboard,
  Package,
  Plus,
  ClipboardList,
  TrendingUp,
} from 'lucide-react-native';

export type AdminTabType = 'overview' | 'products' | 'add' | 'orders' | 'reports';

interface AdminBottomNavProps {
  activeTab: AdminTabType;
  pendingOrdersCount?: number;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({
  activeTab,
  pendingOrdersCount,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const handleTabPress = (tab: AdminTabType) => {
    if (tab === activeTab && tab !== 'add') return;

    switch (tab) {
      case 'overview':
        navigation.navigate('AdminDashboard');
        break;
      case 'products':
        navigation.navigate('SellerProductList');
        break;
      case 'add':
        navigation.navigate('SellerProductEdit', {});
        break;
      case 'orders':
        navigation.navigate('SellerOrders');
        break;
      case 'reports':
        navigation.navigate('AdminReports');
        break;
    }
  };

  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 8);

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {/* 1. Overview Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => handleTabPress('overview')}
      >
        <View style={[styles.iconWrapper, activeTab === 'overview' && styles.iconWrapperActive]}>
          <LayoutDashboard
            size={20}
            color={activeTab === 'overview' ? colors.primary : colors.textSecondary}
          />
        </View>
        <Text style={[styles.tabLabel, activeTab === 'overview' && styles.tabLabelActive]}>
          Overview
        </Text>
      </TouchableOpacity>

      {/* 2. Products Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => handleTabPress('products')}
      >
        <View style={[styles.iconWrapper, activeTab === 'products' && styles.iconWrapperActive]}>
          <Package
            size={20}
            color={activeTab === 'products' ? colors.primary : colors.textSecondary}
          />
        </View>
        <Text style={[styles.tabLabel, activeTab === 'products' && styles.tabLabelActive]}>
          Products
        </Text>
      </TouchableOpacity>

      {/* 3. Center Elevated Add Button */}
      <TouchableOpacity
        style={styles.centerActionItem}
        activeOpacity={0.85}
        onPress={() => handleTabPress('add')}
      >
        <View style={styles.centerAddCircle}>
          <Plus size={24} color={colors.white} strokeWidth={2.5} />
        </View>
        <Text style={styles.centerActionLabel}>Add New</Text>
      </TouchableOpacity>

      {/* 4. Orders Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => handleTabPress('orders')}
      >
        <View style={[styles.iconWrapper, activeTab === 'orders' && styles.iconWrapperActive]}>
          <ClipboardList
            size={20}
            color={activeTab === 'orders' ? colors.primary : colors.textSecondary}
          />
          {pendingOrdersCount !== undefined && pendingOrdersCount > 0 ? (
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>
                {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.tabLabel, activeTab === 'orders' && styles.tabLabelActive]}>
          Orders
        </Text>
      </TouchableOpacity>

      {/* 5. Reports Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => handleTabPress('reports')}
      >
        <View style={[styles.iconWrapper, activeTab === 'reports' && styles.iconWrapperActive]}>
          <TrendingUp
            size={20}
            color={activeTab === 'reports' ? colors.primary : colors.textSecondary}
          />
        </View>
        <Text style={[styles.tabLabel, activeTab === 'reports' && styles.tabLabelActive]}>
          Reports
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
    paddingHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 40,
    height: 30,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrapperActive: {
    backgroundColor: colors.primaryLight,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  centerActionItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  centerAddCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 2,
    borderColor: colors.white,
  },
  centerActionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  badgePill: {
    position: 'absolute',
    top: -2,
    right: 2,
    backgroundColor: colors.danger,
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
});
