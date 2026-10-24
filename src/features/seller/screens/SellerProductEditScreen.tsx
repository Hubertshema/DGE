import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Header, Input, Button, LoadingSpinner, KeyboardAvoidingWrapper } from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { useLanguage } from '../../../localization/LanguageContext';
import { api } from '../../../api/client';
import { useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation, useCategoriesQuery } from '../../../api/queries';
import { CATEGORIES } from '../../../constants/categories';
import { Trash2, Image as ImageIcon, Eye, EyeOff } from 'lucide-react-native';

type RouteParams = RouteProp<RootStackParamList, 'SellerProductEdit'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SellerProductEditScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();
  const { t } = useLanguage();
  const { productId } = route.params || {};

  const isEditing = Boolean(productId);

  const createMutation = useCreateProductMutation(token);
  const updateMutation = useUpdateProductMutation(token);
  const deleteMutation = useDeleteProductMutation(token);
  const { data: dbCategories = [] } = useCategoriesQuery();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('Clothes');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('D&G Rwanda');
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  const categoriesList = dbCategories.length > 0 ? dbCategories : CATEGORIES;

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  useEffect(() => {
    if (!isEditing && categoriesList.length > 0 && !categoryId) {
      setCategoryId(categoriesList[0].id);
      setCategoryName(categoriesList[0].name);
    }

    if (productId) {
      api
        .getProductById(productId)
        .then((prod: any) => {
          setName(prod.name || '');
          setDescription(prod.description || '');
          setCategoryName(prod.category || 'Clothes');
          if (prod.categoryId) {
            setCategoryId(prod.categoryId);
          }
          setPrice(String(Math.round(prod.price || 0)));
          setStock(String(prod.stock !== undefined ? prod.stock : 10));
          setSku(prod.sku || '');
          setBrand(prod.brand || 'D&G Rwanda');
          setIsAvailable(prod.isAvailable !== false);
          if (prod.images && prod.images.length > 0) {
            setImageUrl(prod.images[0]);
          }
        })
        .catch(() => {
          Alert.alert('Error', 'Failed to load product details.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [productId, isEditing]);

  const handleSelectCategory = (cat: { id: string; name: string }) => {
    setCategoryId(cat.id);
    setCategoryName(cat.name);
  };

  const handleSave = async () => {
    if (!token) return;
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Product name is required.');
      return;
    }
    const numPrice = Math.round(Number(price));
    if (isNaN(numPrice) || numPrice < 0) {
      Alert.alert('Validation Error', 'Please enter a valid price in RWF.');
      return;
    }
    const numStock = Math.round(Number(stock));
    if (isNaN(numStock) || numStock < 0) {
      Alert.alert('Validation Error', 'Please enter a valid stock quantity.');
      return;
    }

    try {
      const payload: any = {
        name: name.trim(),
        description: description.trim(),
        categoryId: categoryId || undefined,
        categoryName,
        price: numPrice,
        stock: numStock,
        isAvailable,
        sku: sku.trim() || undefined,
        brand: brand.trim() || undefined,
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
      };

      if (isEditing && productId) {
        await updateMutation.mutateAsync({ id: productId, productData: payload });
        Alert.alert('Success', 'Product updated successfully in DG inventory.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createMutation.mutateAsync(payload);
        Alert.alert('Success', 'New product added to DG inventory.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save product.');
    }
  };

  const handleDelete = () => {
    if (!productId || !token) return;
    Alert.alert(
      'Delete Product',
      `Are you sure you want to permanently delete "${name}" from your catalog?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(productId);
              Alert.alert('Deleted', 'Product has been removed from catalog.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete product.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title={t.editProduct} showBack onBackPress={() => navigation.goBack()} />
        <LoadingSpinner message="Loading product information..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={isEditing ? t.editProduct : t.addProduct}
        subtitle="DG Store Inventory (Rwamagana)"
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          isEditing ? (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteHeaderBtn}>
              <Trash2 size={20} color={colors.danger} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <KeyboardAvoidingWrapper contentContainerStyle={styles.scrollContent}>
        <Input
          label={`${t.productName} *`}
          placeholder="e.g. Kitenge Tailored Shirt"
          value={name}
          onChangeText={setName}
          containerStyle={styles.field}
        />

        <Text style={styles.categoryLabel}>{t.category} *</Text>
        <View style={styles.categoryPills}>
          {categoriesList.map((cat) => {
            const isSelected =
              (categoryId && cat.id === categoryId) ||
              (!categoryId && cat.name.toLowerCase() === categoryName.toLowerCase());

            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => handleSelectCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.rowFields}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Input
              label={`${t.priceRwf} *`}
              placeholder="e.g. 25000"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              containerStyle={styles.field}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label={`${t.stockQuantity} *`}
              placeholder="e.g. 15"
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
              containerStyle={styles.field}
            />
          </View>
        </View>

        {/* Store Visibility Toggle */}
        <Text style={styles.categoryLabel}>Product Visibility in Store</Text>
        <View style={styles.visibilityToggleRow}>
          <TouchableOpacity
            style={[
              styles.visibilityOption,
              isAvailable && styles.visibilityOptionActiveActive,
            ]}
            onPress={() => setIsAvailable(true)}
          >
            <Eye size={18} color={isAvailable ? colors.white : colors.textSecondary} />
            <Text
              style={[
                styles.visibilityText,
                isAvailable && styles.visibilityTextActive,
              ]}
            >
              Active (Visible in Catalog)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.visibilityOption,
              !isAvailable && styles.visibilityOptionActiveInactive,
            ]}
            onPress={() => setIsAvailable(false)}
          >
            <EyeOff size={18} color={!isAvailable ? colors.white : colors.textSecondary} />
            <Text
              style={[
                styles.visibilityText,
                !isAvailable && styles.visibilityTextActive,
              ]}
            >
              Hidden (Draft / Inactive)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rowFields}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Input
              label="Brand"
              placeholder="e.g. D&G Rwanda"
              value={brand}
              onChangeText={setBrand}
              containerStyle={styles.field}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="SKU Code"
              placeholder="e.g. DG-CLO-005"
              value={sku}
              onChangeText={setSku}
              containerStyle={styles.field}
            />
          </View>
        </View>

        <Input
          label={`${t.images} (URL)`}
          placeholder="https://images.unsplash.com/..."
          value={imageUrl}
          onChangeText={(val) => {
            setImageUrl(val);
            setImageError(false);
          }}
          containerStyle={styles.field}
        />

        {/* Image Preview Box */}
        {imageUrl.trim().length > 0 && !imageError ? (
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Image Preview:</Text>
            <Image
              source={{ uri: imageUrl.trim() }}
              style={styles.previewImage}
              onError={() => setImageError(true)}
            />
          </View>
        ) : null}

        <Input
          label="Description"
          placeholder="Provide product details, material, sizing..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          containerStyle={styles.field}
        />

        <Button
          title={isEditing ? t.saveChanges : t.saveProduct}
          onPress={handleSave}
          isLoading={isSaving}
          style={styles.saveBtn}
        />

        {isEditing ? (
          <Button
            title={t.deleteProduct}
            variant="outline"
            onPress={handleDelete}
            isLoading={isDeleting}
            style={styles.deleteBtn}
          />
        ) : null}
      </KeyboardAvoidingWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  deleteHeaderBtn: {
    padding: spacing.xs,
  },
  field: {
    marginBottom: spacing.md,
  },
  rowFields: {
    flexDirection: 'row',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  categoryPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
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
  visibilityToggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  visibilityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  visibilityOptionActiveActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  visibilityOptionActiveInactive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  visibilityTextActive: {
    color: colors.white,
  },
  previewBox: {
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.sm,
    resizeMode: 'cover',
  },
  saveBtn: {
    marginTop: spacing.md,
  },
  deleteBtn: {
    marginTop: spacing.md,
    borderColor: colors.danger,
  },
});
