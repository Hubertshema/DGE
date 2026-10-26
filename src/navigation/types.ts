import { NavigatorScreenParams } from '@react-navigation/native';
import { ProductCategory } from '../types';

export type MainTabParamList = {
  HomeTab: undefined;
  CategoriesTab: undefined;
  SearchTab: undefined;
  CartTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;

  // Shopping & Discovery
  ProductDetails: { productId: string; productName?: string };
  CategoryProducts: { category: ProductCategory };
  SearchResults: { query: string };

  // Cart & Checkout
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: {
    orderId: string;
    orderReference: string;
    totalAmount: number;
    whatsappUrl?: string;
  };
  MyOrders: undefined;
  OrderDetails: { orderId: string };
  DeliveryAddresses: undefined;
  AddAddress: { returnToCheckout?: boolean };

  // Notifications
  NotificationCenter: undefined;

  // Auth & Security
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ChangePassword: { isFirstLogin?: boolean } | undefined;

  // Profile & Settings
  EditProfile: undefined;
  LanguageSettings: undefined;
  AppUpdate: undefined;

  // Admin Protected Portal (DG Owner)
  AdminDashboard: undefined;
  AdminProductList: undefined;
  AdminProductEdit: { productId?: string };
  AdminOrders: { initialFilter?: string } | undefined;
  AdminOrderDetail: { orderId: string };
  AdminCategories: undefined;
  AdminCustomers: undefined;
  AdminReports: undefined;

  // Backward compatibility aliases
  SellerDashboard: undefined;
  SellerProductList: undefined;
  SellerProductEdit: { productId?: string };
  SellerOrders: undefined;
  SellerOrderDetail: { orderId: string };
};
