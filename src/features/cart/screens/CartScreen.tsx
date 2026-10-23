import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Header, Button, EmptyState, CachedImage } from '../../../components/common';
import { useCart } from '../../../state/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CartScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { items, subtotal, updateQuantity, removeFromCart } = useCart();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Shopping Cart" subtitle={`${items.length} unique items`} />

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={56} color={colors.primary} />}
          title="Your Cart is Empty"
          message="Browse through our collections and discover the best items in Rwanda."
          actionTitle="Start Shopping"
          onAction={() => navigation.navigate('MainTabs', { screen: 'HomeTab' } as any)}
        />
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <CachedImage
                  uri={item.product.images?.[0]}
                  style={styles.productImage}
                  resizeMode="cover"
                  fallbackText="D&G"
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemCategory}>{item.product.category}</Text>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  {item.selectedVariation ? (
                    <Text style={styles.variationText}>
                      {item.selectedVariation.name}: {item.selectedVariation.value}
                    </Text>
                  ) : null}
                  <Text style={styles.itemPrice}>
                    RWF {item.product.price.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.actionsColumn}>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.id)}
                    style={styles.deleteButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={18} color={colors.danger} />
                  </TouchableOpacity>

                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      style={styles.qtyBtn}
                    >
                      <Minus size={14} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      style={styles.qtyBtn}
                    >
                      <Plus size={14} color={colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Checkout Footer */}
          <View style={[styles.footer, { paddingBottom: insets.bottom || spacing.md }]}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>RWF {subtotal.toLocaleString()}</Text>
            </View>
            <Text style={styles.serverNote}>
              * Delivery fee and exact total will be verified by the server at checkout.
            </Text>
            <Button
              title="Proceed to Checkout"
              onPress={() => navigation.navigate('Checkout')}
              style={styles.checkoutBtn}
            />
          </View>
        </>
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
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  itemCategory: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  variationText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  actionsColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: spacing.sm,
  },
  deleteButton: {
    padding: spacing.xxs,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyBtn: {
    padding: spacing.xs,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: spacing.xs,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  serverNote: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  checkoutBtn: {
    marginTop: spacing.xs,
  },
});
