import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius, shadows } from '../../../theme';
import { Header, Badge, Button, CachedImage, SellerProductListSkeleton, SyncIndicator } from '../../../components/common';
import { useProductsQuery, useCategoriesQuery, useUpdateProductMutation, useDeleteProductMutation } from '../../../api/queries';
import { useAuth } from '../../../state/AuthContext';
import { AdminBottomNav } from '../components/AdminBottomNav';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X,
  AlertCircle,
} from 'lucide-react-native';
import { Product } from '../../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SellerProductListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // TanStack Query: Admin inventory with all items including unavailable
  const {
    data: products = [],
    isLoading,
    isFetching,
    isRefetching,
    error: productsError,
    refetch,
  } = useProductsQuery(undefined, undefined, true);

  const showSkeleton = isLoading && products.length === 0;
  const isBackgroundSyncing = isFetching && !isLoading && !isRefetching;

  const { data: dbCategories = [] } = useCategoriesQuery();

  const updateMutation = useUpdateProductMutation(token);
  const deleteMutation = useDeleteProductMutation(token);

  // Extract unique categories
  const categories = useMemo(() => {
    const catNames = Array.from(
      new Set([
        ...dbCategories.map((c) => c.name),
        ...products.map((p) => p.category).filter(Boolean),
      ])
    );
    return ['All', ...catNames];
  }, [dbCategories, products]);

  const onRefresh = () => {
    refetch();
  };

  // Quick toggle product visibility (Active vs Hidden)
  const handleToggleAvailability = async (item: Product) => {
    if (!token) return;
    const newStatus = !item.isAvailable;
    setActionInProgressId(item.id);

    try {
      await updateMutation.mutateAsync({
        id: item.id,
        productData: { isAvailable: newStatus },
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update visibility.');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Direct product deletion
  const handleDeleteProduct = (item: Product) => {
    if (!token) return;
    Alert.alert(
      'Delete Product',
      `Are you sure you want to permanently delete "${item.name}" from your catalog?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionInProgressId(item.id);
            try {
              await deleteMutation.mutateAsync(item.id);
              Alert.alert('Deleted', `"${item.name}" was removed from your store.`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete product.');
            } finally {
              setActionInProgressId(null);
            }
          },
        },
      ]
    );
  };

  // Filter products by category and search query
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      p.name?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query) ||
      p.sku?.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  // Calculate stock stats
  const totalStockCount = products.length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title="Product Inventory"
        subtitle="D&G Store Stock Management"
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('SellerProductEdit', {})}
          >
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        }
      />

      {/* Inventory Stat Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{totalStockCount}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: colors.warning }]}>{lowStockCount}</Text>
          <Text style={styles.statLabel}>Low Stock (≤5)</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: colors.danger }]}>{outOfStockCount}</Text>
          <Text style={styles.statLabel}>Out of Stock</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={18} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search product name, category, SKU..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Pills */}
      {categories.length > 0 && (
        <View style={styles.categoriesWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryPillsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  selectedCategory === item && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    selectedCategory === item && styles.categoryPillTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <SyncIndicator isSyncing={isBackgroundSyncing} label="Syncing catalog updates..." />

      {showSkeleton ? (
        <SellerProductListSkeleton count={5} />
      ) : productsError && products.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
          <AlertCircle size={48} color={colors.danger} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.md }}>
            Unable to Load Catalogue
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
            {productsError.message}
          </Text>
          <Button
            title="Try Again"
            onPress={() => refetch()}
            style={{ marginTop: spacing.md, minWidth: 140 }}
          />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={48} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || selectedCategory !== 'All'
                  ? 'No products match your current search or category filter.'
                  : 'Start adding merchandise to your D&G store catalogue.'}
              </Text>
              <Button
                title="Add New Product"
                onPress={() => navigation.navigate('SellerProductEdit', {})}
                style={styles.emptyAddBtn}
              />
            </View>
          }
          renderItem={({ item }) => {
            const isItemDisabled = actionInProgressId === item.id;
            const isOutOfStock = item.stock <= 0;
            const isLowStock = item.stock > 0 && item.stock <= 5;
            const isHidden = !item.isAvailable;

            return (
              <View style={[styles.card, isHidden && styles.cardHidden]}>
                <View style={styles.cardMain}>
                  <CachedImage
                    uri={item.images && item.images.length > 0 ? item.images[0] : null}
                    style={styles.thumbnail}
                    fallbackText="D&G"
                  />

                  <View style={styles.info}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>

                    <Text style={styles.category}>
                      {item.category}
                      {item.sku ? ` • SKU: ${item.sku}` : ''}
                    </Text>

                    <Text style={styles.price}>
                      {Number(item.price).toLocaleString()} RWF
                    </Text>

                    <View style={styles.badgeRow}>
                      {isHidden ? (
                        <Badge label="Hidden / Inactive" variant="danger" />
                      ) : isOutOfStock ? (
                        <Badge label="Out of Stock" variant="danger" />
                      ) : (
                        <Badge
                          label={`${item.stock} in stock`}
                          variant={isLowStock ? 'warning' : 'success'}
                        />
                      )}
                    </View>
                  </View>

                  {/* Actions column */}
                  <View style={styles.actionsCol}>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => handleToggleAvailability(item)}
                      disabled={isItemDisabled}
                    >
                      {item.isAvailable ? (
                        <Eye size={18} color={colors.primary} />
                      ) : (
                        <EyeOff size={18} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() =>
                        navigation.navigate('SellerProductEdit', { productId: item.id })
                      }
                      disabled={isItemDisabled}
                    >
                      <Edit2 size={18} color={colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => handleDeleteProduct(item)}
                      disabled={isItemDisabled}
                    >
                      <Trash2 size={18} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Fixed Admin Bottom Navigation Bar */}
      <AdminBottomNav activeTab="products" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 42,
    maxWidth: 820,
    width: '100%',
    alignSelf: 'center',
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  clearSearchBtn: {
    padding: 4,
  },
  categoriesWrapper: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    maxWidth: 820,
    width: '100%',
    alignSelf: 'center',
  },
  categoryPillsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryPillTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 95,
    flexGrow: 1,
    maxWidth: 820,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  cardHidden: {
    opacity: 0.65,
    backgroundColor: '#F9FAFB',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  thumbPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  category: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  actionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: spacing.xs,
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  emptyAddBtn: {
    marginTop: spacing.lg,
  },
});
