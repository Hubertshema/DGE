import { Category, ProductCategory } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'cat_clothes',
    name: 'Clothes',
    slug: 'clothes',
    description: 'Men, women, and children fashion & apparel',
  },
  {
    id: 'cat_shoes',
    name: 'Shoes',
    slug: 'shoes',
    description: 'Casual, formal, athletic footwear and boots',
  },
  {
    id: 'cat_bags',
    name: 'Bags',
    slug: 'bags',
    description: 'Handbags, backpacks, clutches, and travel gear',
  },
  {
    id: 'cat_household',
    name: 'Household equipment',
    slug: 'household-equipment',
    description: 'Home appliances, kitchenware, and living essentials',
  },
  {
    id: 'cat_jewellery',
    name: 'Jewellery',
    slug: 'jewellery',
    description: 'Watches, necklaces, rings, bracelets, and accessories',
  },
  {
    id: 'cat_cosmetics',
    name: 'Cosmetics',
    slug: 'cosmetics',
    description: 'Skincare, beauty products, perfumes, and care',
  },
];

export const CATEGORY_NAMES: ProductCategory[] = [
  'Clothes',
  'Shoes',
  'Bags',
  'Household equipment',
  'Jewellery',
  'Cosmetics',
];
