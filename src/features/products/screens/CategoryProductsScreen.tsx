import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing } from '../../../theme';
import { Header, EmptyState, ProductListSkeleton, SyncIndicator, Button } from '../../../components/common';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../../../types';
import { useProductsQuery } from '../../../api/queries';
import { useCart } from '../../../state/CartContext';
import { useLanguage } from '../../../localization/LanguageContext';
import { getCategoryTranslation } from '../../../localization/translations';
import { ShoppingBag, AlertCircle } from 'lucide-react-native';

type CategoryScreenRouteProp = RouteProp<RootStackParamList, 'CategoryProducts'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CategoryProductsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<CategoryScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { addToCart } = useCart();
  const { t } = useLanguage();

  const { category } = route.params;

  const {
    data: products = [],
    isLoading,
    isFetching,
    isRefetching,
    error: productsError,
    refetch,
  } = useProductsQuery(category);

  const onRefresh = () => {
    refetch();
  };

  const showSkeleton = isLoading && products.length === 0;
  const isBackgroundSyncing = isFetching && !isLoading && !isRefetching;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={getCategoryTranslation(category, t)}
        subtitle={t.browseCollections}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <SyncIndicator isSyncing={isBackgroundSyncing} label={`Refreshing ${category}...`} />

      {showSkeleton ? (
        <ProductListSkeleton count={6} />
      ) : productsError && products.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
          <AlertCircle size={48} color={colors.danger} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.md }}>
            Connection Notice
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
            {productsError.message}
          </Text>
          <Button
            title={t.tryAgain}
            onPress={() => refetch()}
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
              tintColor={colors.primary}
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
            <EmptyState
              icon={<ShoppingBag size={48} color={colors.primary} />}
              title={t.noItemsFound}
              message={t.noProductsListed}
            />
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
    padding: spacing.lg,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});
