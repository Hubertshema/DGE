import { NativeModules, Platform } from 'react-native';

const { DGNotificationModule } = NativeModules;

export interface NotificationPayload {
  id?: number;
  title: string;
  message: string;
  orderId?: string | null;
  orderReference?: string | null;
  type?: string;
}

export const NativeNotificationService = {
  /**
   * Request Android 13+ POST_NOTIFICATIONS permission
   */
  requestPermission: async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !DGNotificationModule?.requestPermission) {
      return true;
    }
    try {
      return await DGNotificationModule.requestPermission();
    } catch {
      return false;
    }
  },

  /**
   * Delivers a native Android heads-up notification in the notification center
   */
  showNotification: async (payload: NotificationPayload): Promise<boolean> => {
    if (Platform.OS !== 'android' || !DGNotificationModule?.showNotification) {
      return false;
    }
    try {
      const id = payload.id || Math.floor(Date.now() % 100000);
      const dataJson = JSON.stringify({
        orderId: payload.orderId || null,
        orderReference: payload.orderReference || null,
        type: payload.type || 'order_update',
      });

      return await DGNotificationModule.showNotification(
        id,
        payload.title,
        payload.message,
        dataJson
      );
    } catch (error) {
      console.warn('Native notification delivery error:', error);
      return false;
    }
  },

  /**
   * Plays a crisp notification audio tone / beep
   */
  playBeep: (): void => {
    if (Platform.OS === 'android' && DGNotificationModule?.playBeep) {
      try {
        DGNotificationModule.playBeep();
      } catch (err) {
        console.warn('Failed to play notification beep:', err);
      }
    }
  },
};
