import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { CATEGORIES } from '../../../constants/categories';
import { Product } from '../../../types';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../../../state/CartContext';
import { useLanguage } from '../../../localization/LanguageContext';
import { Search, ShoppingBag, Globe } from 'lucide-react-native';
import { useCategoriesQuery, useProductsQuery } from '../../../api/queries';
import { Logo, ProductListSkeleton, SyncIndicator, Button } from '../../../components/common';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { itemCount, addToCart } = useCart();
  const { currentLanguage, setLanguage } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // TanStack Query hooks with automatic caching and deduplication
  const { data: dbCategories = [] } = useCategoriesQuery();
  const {
    data: products = [],
    isLoading,
    isFetching,
    isRefetching,
    refetch: refetchProducts,
    error: productsError,
  } = useProductsQuery(selectedCategory === 'All' ? undefined : selectedCategory);

  const displayCategories = dbCategories.length > 0 ? dbCategories : CATEGORIES;

  const onRefresh = () => {
    refetchProducts();
  };

  const showSkeleton = isLoading && products.length === 0;
  const isBackgroundSyncing = isFetching && !isLoading && !isRefetching;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Brand Header */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <Logo size={40} style={styles.brandLogo} />
          <View style={styles.brandTextGroup}>
            <Text style={styles.brandTitle}>D&G</Text>
            <Text style={styles.brandLocation}>Rwamagana, Rwanda</Text>
          </View>
        </View>

        {/* Top Right Corner: Language selector, Search icon, and Cart icon */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLanguage(currentLanguage === 'en' ? 'rw' : 'en')}
            style={styles.langPill}
            accessibilityLabel="Switch language"
          >
            <Globe size={15} color={colors.primary} />
            <Text style={styles.langText}>{currentLanguage.toUpperCase()}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('MainTabs', { screen: 'SearchTab' } as any)}
            style={styles.iconButton}
            accessibilityLabel="Search"
          >
            <Search size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Cart')}
            style={styles.iconButton}
            accessibilityLabel="Cart"
          >
            <ShoppingBag size={22} color={colors.textPrimary} />
            {itemCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{itemCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Pills Filter */}
      <View style={styles.categoryBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSelectedCategory('All')}
            style={[
              styles.categoryPill,
              selectedCategory === 'All' && styles.categoryPillActive,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === 'All' && styles.categoryTextActive,
              ]}
            >
              All Items
            </Text>
          </TouchableOpacity>

          {displayCategories.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.id || cat.slug || cat.name}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(cat.name)}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Subtle Background Sync Indicator (No skeleton flash during refresh) */}
      <SyncIndicator isSyncing={isBackgroundSyncing} label="Checking for new inventory..." />

      {/* Product Grid / Skeleton / Error / Empty State */}
      {showSkeleton ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ProductListSkeleton count={6} />
        </ScrollView>
      ) : productsError && products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <ShoppingBag size={48} color={colors.accent} />
          </View>
          <Text style={styles.emptyTitle}>Unable to Load Products</Text>
          <Text style={styles.emptySubtitle}>{productsError.message}</Text>
          <Button
            title="Try Again"
            onPress={() => refetchProducts()}
            style={{ marginTop: spacing.md, minWidth: 140 }}
          />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate('ProductDetails', {
                  productId: item.id,
                  productName: item.name,
                })
              }
              onAddToCart={() => addToCart(item, 1)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <ShoppingBag size={48} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Items Found</Text>
              <Text style={styles.emptySubtitle}>
                {`No products listed in "${selectedCategory}" right now.`}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    marginRight: spacing.sm,
  },
  brandTextGroup: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  brandLocation: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginRight: spacing.xs,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  iconButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.accent,
    width: 18,
    height: 18,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  categoryBar: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  categoryScroll: {
    paddingHorizontal: spacing.lg,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
  },
});
