import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Header, Button, Badge, CachedImage, ProductDetailsSkeleton, SyncIndicator } from '../../../components/common';
import { useCart } from '../../../state/CartContext';
import { ShoppingBag, Check, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { useProductQuery } from '../../../api/queries';
import { Product } from '../../../types';

type RouteProps = RouteProp<RootStackParamList, 'ProductDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

export const ProductDetailsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { productId, productName } = route.params;
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  // TanStack Query: 5min staleTime, background refetch, cached instantly
  const {
    data: product,
    isLoading,
    isFetching,
    error: productError,
    refetch: refetchProduct,
  } = useProductQuery(productId);

  const showSkeleton = isLoading && !product;
  const isBackgroundSyncing = isFetching && !isLoading;

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const primaryImage = product?.images?.[0];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title={product?.name || productName || 'Product Details'}
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            style={styles.cartIcon}
          >
            <ShoppingBag size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        }
      />

      {/* Subtle sync indicator for background price/stock verification */}
      <SyncIndicator isSyncing={isBackgroundSyncing} label="Verifying stock & price..." />

      {showSkeleton ? (
        <ProductDetailsSkeleton />
      ) : productError && !product ? (
        <View style={styles.loadingContainer}>
          <AlertCircle size={44} color={colors.danger} />
          <Text style={[styles.loadingText, { color: colors.textPrimary, marginTop: spacing.sm }]}>
            Unable to load product details
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
            {productError.message}
          </Text>
          <Button
            title="Try Again"
            onPress={() => refetchProduct()}
            style={{ marginTop: spacing.md, minWidth: 140 }}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Image Gallery */}
          <View style={styles.imageGallery}>
            <CachedImage
              uri={primaryImage}
              style={styles.image}
              resizeMode="cover"
              fallbackText="D&G"
            />
          </View>

          {/* Product Details Card */}
          <View style={styles.detailsCard}>
            <Text style={styles.category}>{product?.category || 'Collection'}</Text>
            <Text style={styles.name}>{product?.name || productName}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>
                RWF {product?.price ? product.price.toLocaleString() : '--'}
              </Text>
              <Badge
                label={product?.isAvailable && product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                variant={product?.isAvailable && product.stock > 0 ? 'success' : 'danger'}
              />
            </View>

            {product?.sku ? (
              <Text style={styles.skuText}>SKU: {product.sku}</Text>
            ) : null}

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>Product Description</Text>
            <Text style={styles.description}>
              {product?.description || 'Quality product verified by D&G store in Rwamagana.'}
            </Text>

            <View style={styles.trustBadge}>
              <ShieldCheck size={18} color={colors.primary} />
              <Text style={styles.trustText}>
                Authentic product. WhatsApp payment & direct delivery in Rwanda.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Add To Cart Footer (Only active once product is loaded) */}
      {!showSkeleton && !productError && product ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom || spacing.md }]}>
          <Button
            title={isAdded ? 'Added to Cart ✓' : 'Add to Cart'}
            variant={isAdded ? 'accent' : 'primary'}
            icon={<ShoppingBag size={18} color={colors.white} />}
            onPress={handleAddToCart}
            disabled={!product.isAvailable || product.stock <= 0}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cartIcon: {
    padding: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  imageGallery: {
    width: width,
    height: width * 0.75,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  placeholderBrand: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 3,
  },
  placeholderSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  detailsCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
    lineHeight: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  skuText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.lg,
  },
  trustText: {
    fontSize: 12,
    color: colors.primaryDark,
    marginLeft: spacing.xs,
    flex: 1,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
});
