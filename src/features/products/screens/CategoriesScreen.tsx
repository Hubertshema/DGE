import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, borderRadius, shadows } from '../../../theme';
import { CATEGORIES } from '../../../constants/categories';
import { Header } from '../../../components/common';
import { useLanguage } from '../../../localization/LanguageContext';
import { getCategoryTranslation, getCategoryDescription } from '../../../localization/translations';
import {
  Shirt,
  Footprints,
  ShoppingBag,
  Home,
  Watch,
  Sparkles,
} from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

const getCategoryIcon = (slug: string) => {
  const size = 32;
  const color = colors.primary;
  switch (slug) {
    case 'clothes':
      return <Shirt size={size} color={color} />;
    case 'shoes':
      return <Footprints size={size} color={color} />;
    case 'bags':
      return <ShoppingBag size={size} color={color} />;
    case 'household-equipment':
    case 'household':
      return <Home size={size} color={color} />;
    case 'jewellery':
      return <Watch size={size} color={color} />;
    case 'cosmetics':
      return <Sparkles size={size} color={color} />;
    default:
      return <ShoppingBag size={size} color={color} />;
  }
};

export const CategoriesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { t } = useLanguage();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title={t.tabCategories}
        subtitle={t.browseCollections}
        showRightActions
      />

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('CategoryProducts', { category: item.name })
            }
            style={styles.card}
          >
            <View style={styles.iconCircle}>
              {getCategoryIcon(item.slug)}
            </View>
            <Text style={styles.name}>{getCategoryTranslation(item.name, t)}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {getCategoryDescription(item.slug, t) || item.description}
            </Text>
          </TouchableOpacity>
        )}
      />
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
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    textAlign: 'center',
    ...shadows.card,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  description: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
  },
});
