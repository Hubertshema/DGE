import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from './types';
import { colors, spacing, useResponsive } from '../theme';
import { useCart } from '../state/CartContext';
import { useAuth } from '../state/AuthContext';
import { useLanguage } from '../localization/LanguageContext';

// Screens
import { HomeScreen } from '../features/products/screens/HomeScreen';
import { CategoriesScreen } from '../features/products/screens/CategoriesScreen';
import { CategoryProductsScreen } from '../features/products/screens/CategoryProductsScreen';
import { SearchScreen } from '../features/products/screens/SearchScreen';
import { CartScreen } from '../features/cart/screens/CartScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { ProductDetailsScreen } from '../features/products/screens/ProductDetailsScreen';
import { CheckoutScreen } from '../features/checkout/screens/CheckoutScreen';
import { OrderConfirmationScreen } from '../features/checkout/screens/OrderConfirmationScreen';
import { MyOrdersScreen } from '../features/orders/screens/MyOrdersScreen';
import { OrderDetailsScreen } from '../features/orders/screens/OrderDetailsScreen';
import { DeliveryAddressesScreen } from '../features/checkout/screens/DeliveryAddressesScreen';
import { LanguageSettingsScreen } from '../features/profile/screens/LanguageSettingsScreen';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { ChangePasswordScreen } from '../features/auth/screens/ChangePasswordScreen';
import { NotificationCenterScreen } from '../features/notifications/screens/NotificationCenterScreen';

// Admin Screens
import { SellerDashboardScreen } from '../features/seller/screens/SellerDashboardScreen';
import { SellerOrdersScreen } from '../features/seller/screens/SellerOrdersScreen';
import { SellerOrderDetailScreen } from '../features/seller/screens/SellerOrderDetailScreen';
import { SellerProductListScreen } from '../features/seller/screens/SellerProductListScreen';
import { SellerProductEditScreen } from '../features/seller/screens/SellerProductEditScreen';
import { AdminCategoriesScreen } from '../features/seller/screens/AdminCategoriesScreen';
import { AdminCustomersScreen } from '../features/seller/screens/AdminCustomersScreen';
import { AdminReportsScreen } from '../features/seller/screens/AdminReportsScreen';

// Icons (real vector icons, no emojis)
import {
  Home,
  LayoutGrid,
  Search,
  ShoppingBag,
  User,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabs: React.FC = () => {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const { isLandscape } = useResponsive();

  return (
    <Tab.Navigator
      key={`main-tabs-${language}-${isLandscape ? 'land' : 'port'}`}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: isLandscape ? 48 : 60,
          paddingBottom: isLandscape ? 3 : 8,
          paddingTop: isLandscape ? 3 : 8,
        },
        tabBarLabelStyle: {
          fontSize: isLandscape ? 10 : 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: t.tabHome,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesScreen}
        options={{
          tabBarLabel: t.tabCategories,
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchScreen}
        options={{
          tabBarLabel: t.tabSearch,
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: t.tabCart,
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.accent,
            fontSize: 10,
            fontWeight: '700',
          },
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: t.tabAccount,
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (!isAuthenticated) {
              e.preventDefault();
              (navigation as any).navigate('Login');
            }
          },
        })}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen
          name="OrderConfirmation"
          component={OrderConfirmationScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="DeliveryAddresses" component={DeliveryAddressesScreen} />
        <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
        <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

        {/* Protected Admin Stack (DG Owner) */}
        <Stack.Screen name="AdminDashboard" component={SellerDashboardScreen} />
        <Stack.Screen name="AdminOrders" component={SellerOrdersScreen} />
        <Stack.Screen name="AdminOrderDetail" component={SellerOrderDetailScreen} />
        <Stack.Screen name="AdminProductList" component={SellerProductListScreen} />
        <Stack.Screen name="AdminProductEdit" component={SellerProductEditScreen} />
        <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} />
        <Stack.Screen name="AdminCustomers" component={AdminCustomersScreen} />
        <Stack.Screen name="AdminReports" component={AdminReportsScreen} />

        {/* Backward Compatibility Routes */}
        <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
        <Stack.Screen name="SellerOrders" component={SellerOrdersScreen} />
        <Stack.Screen name="SellerOrderDetail" component={SellerOrderDetailScreen} />
        <Stack.Screen name="SellerProductList" component={SellerProductListScreen} />
        <Stack.Screen name="SellerProductEdit" component={SellerProductEditScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
