import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius } from '../../../theme';
import { Header, Button, LoadingSpinner } from '../../../components/common';
import { useAuth } from '../../../state/AuthContext';
import { useLanguage } from '../../../localization/LanguageContext';
import { useCategoriesQuery, useCategoryMutations } from '../../../api/queries';
import { LayoutGrid, Plus, Edit2, Trash2, FolderPlus } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminCategoriesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();
  const { t } = useLanguage();

  const {
    data: categories = [],
    isLoading,
    isRefetching,
    refetch,
  } = useCategoriesQuery();

  const { createCategory, updateCategory, deleteCategory } = useCategoryMutations(token);

  // Modal State for Add / Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isSaving = createCategory.isPending || updateCategory.isPending;

  const onRefresh = () => {
    refetch();
  };

  const openAddModal = () => {
    setEditingId(null);
    setCatName('');
    setCatDesc('');
    setModalVisible(true);
  };

  const openEditModal = (cat: any) => {
    setEditingId(cat.id);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!catName.trim()) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }
    if (!token) return;

    try {
      if (editingId) {
        await updateCategory.mutateAsync({
          id: editingId,
          categoryData: { name: catName.trim(), description: catDesc.trim() },
        });
        Alert.alert('Success', 'Category updated successfully.');
      } else {
        await createCategory.mutateAsync({
          name: catName.trim(),
          description: catDesc.trim(),
        });
        Alert.alert('Success', 'Category created successfully.');
      }
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save category.');
    }
  };

  const handleDeleteCategory = (cat: any) => {
    if (!token) return;

    const prodCount = Number(cat.productsCount || 0);
    if (prodCount > 0) {
      Alert.alert(
        'Cannot Delete Department',
        `The "${cat.name}" category contains ${prodCount} product(s). Please reassign or delete these products in Product Inventory before removing this category.`
      );
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete the "${cat.name}" category?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(cat.id);
            try {
              await deleteCategory.mutateAsync(cat.id);
              Alert.alert('Success', `Category "${cat.name}" was deleted.`);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete category.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={t.manageCategories}
        subtitle="DG Store Departments"
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        }
      />

      {isLoading && categories.length === 0 ? (
        <LoadingSpinner message="Loading categories..." />
      ) : (
        <FlatList
          data={categories}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <LayoutGrid size={48} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Categories</Text>
              <Text style={styles.emptySubtitle}>
                Create departments to organize your merchandise catalogue.
              </Text>
              <Button
                title="Add New Category"
                onPress={openAddModal}
                style={{ marginTop: spacing.md }}
              />
            </View>
          }
          renderItem={({ item }) => {
            const isDeletingThis = deletingId === item.id;
            const prodCount = Number((item as any).productsCount || 0);

            return (
              <View style={styles.card}>
                <View style={styles.cardIcon}>
                  <LayoutGrid size={22} color={colors.primary} />
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                  <Text style={styles.cardMeta}>
                    {prodCount} product{prodCount === 1 ? '' : 's'} assigned
                  </Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openEditModal(item)}
                    disabled={isDeletingThis}
                  >
                    <Edit2 size={18} color={colors.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteActionBtn]}
                    onPress={() => handleDeleteCategory(item)}
                    disabled={isDeletingThis}
                  >
                    <Trash2 size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Add / Edit Category Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <FolderPlus size={24} color={colors.primary} />
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Category' : 'Add New Category'}
              </Text>
            </View>

            <Text style={styles.inputLabel}>Category Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Household equipment"
              placeholderTextColor={colors.textMuted}
              value={catName}
              onChangeText={setCatName}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Brief description of products in this department"
              placeholderTextColor={colors.textMuted}
              value={catDesc}
              onChangeText={setCatDesc}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Save Category"
                onPress={handleSave}
                isLoading={isSaving}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    flexGrow: 1,
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
  },
  addBtn: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardMeta: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  actionBtn: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  deleteActionBtn: {
    backgroundColor: '#FEE2E2',
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
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
});
