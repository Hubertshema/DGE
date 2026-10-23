import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Input, EmptyState, ProductListSkeleton } from '../../../components/common';
import { Search, X } from 'lucide-react-native';
import { Product } from '../../../types';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../../../state/CartContext';
import { api } from '../../../api/client';

import { useProductsQuery } from '../../../api/queries';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SearchScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { addToCart } = useCart();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimer = React.useRef<any>(null);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(text.trim());
    }, 300);
  };

  const {
    data: results = [],
    isLoading,
  } = useProductsQuery(undefined, debouncedQuery ? debouncedQuery : undefined);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Input
          placeholder="Search clothes, shoes, bags, household..."
          value={query}
          onChangeText={handleQueryChange}
          leftIcon={<Search size={20} color={colors.textSecondary} />}
          rightIcon={
            query.length > 0 ? (
              <X size={18} color={colors.textSecondary} />
            ) : undefined
          }
          onRightIconPress={() => {
            setQuery('');
            setDebouncedQuery('');
          }}
          containerStyle={styles.searchBar}
          returnKeyType="search"
          onSubmitEditing={() => setDebouncedQuery(query.trim())}
          autoFocus
        />
      </View>

      {isLoading && results.length === 0 ? (
        <ProductListSkeleton count={4} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
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
              icon={<Search size={48} color={colors.primary} />}
              title={query ? 'No matching products' : 'Search D&G Store'}
              message={
                query
                  ? `No products found matching "${query}". Check spelling or try a different keyword.`
                  : 'Enter a keyword above to search through our Rwandan inventory.'
              }
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    marginBottom: spacing.sm,
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});
