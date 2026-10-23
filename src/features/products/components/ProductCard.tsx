import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Product } from '../../../types';
import { colors, spacing, borderRadius, shadows } from '../../../theme';
import { CachedImage } from '../../../components/common';
import { ShoppingBag } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

export interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
}) => {
  const primaryImage = product.images?.[0];

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.imageContainer}>
        <CachedImage
          uri={primaryImage}
          style={styles.image}
          resizeMode="cover"
          fallbackText="D&G"
        />
        {(product.isAvailable === false || (product as any).is_available === false) || Number(product.stock) <= 0 ? (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.category} numberOfLines={1}>
          {product.category}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.currency}>RWF </Text>
            <Text style={styles.price}>
              {product.price.toLocaleString()}
            </Text>
          </View>
          {onAddToCart &&
          product.isAvailable !== false &&
          (product as any).is_available !== false &&
          Number(product.stock) > 0 ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onAddToCart}
              style={styles.cartButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ShoppingBag size={16} color={colors.white} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: colors.background,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  placeholderText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  outOfStockText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: spacing.sm,
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 18,
    minHeight: 36,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  cartButton: {
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
