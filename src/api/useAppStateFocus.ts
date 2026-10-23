import { useEffect } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { focusManager } from '@tanstack/react-query';

/**
 * Handle React Native app state transitions (active, background, inactive).
 *
 * When the app is backgrounded (user switches apps, locks screen),
 * focusManager.setFocused(false) pauses all TanStack Query refetchInterval
 * polling timers and background fetches, saving mobile battery and cellular data.
 *
 * When the app returns to the foreground (active),
 * focusManager.setFocused(true) resumes polling and updates stale data.
 */
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

export function useAppStateFocus(): void {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);
}
