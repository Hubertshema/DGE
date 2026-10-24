/**
 * D&G E-Commerce Mobile Application
 * Rwamagana, Rwanda
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister, persistDehydrateOptions } from './src/api/queryClient';
import { useAppStateFocus } from './src/api/useAppStateFocus';
import { AuthProvider } from './src/state/AuthContext';
import { NotificationProvider } from './src/state/NotificationContext';
import { CartProvider } from './src/state/CartContext';
import { LanguageProvider } from './src/localization/LanguageContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme';

function App(): React.JSX.Element {
  // Listen to AppState transitions to automatically pause background queries when hidden
  useAppStateFocus();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          dehydrateOptions: persistDehydrateOptions,
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
        }}
      >
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <CartProvider>
                <AppNavigator />
              </CartProvider>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
