import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { api, API_BASE_URL } from '../api/client';
import { NativeNotificationService } from '../services/nativeNotification';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  orderId?: string | null;
  orderReference?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Keep track of previously delivered notification IDs to prevent duplicate alerts
  const deliveredNotificationIdsRef = useRef<Set<string>>(new Set());
  const initialLoadCompletedRef = useRef<boolean>(false);

  // Request Android notification permissions once on initial auth
  useEffect(() => {
    if (isAuthenticated) {
      NativeNotificationService.requestPermission().catch(() => {});
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(
    async (isBackground: boolean = false) => {
      if (!token || !isAuthenticated) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      if (!isBackground) {
        setIsLoading(true);
      }

      try {
        const data = await api.getNotifications(token, 40, 0);
        const incomingList = data.notifications || [];
        const incomingCount = Number(data.unreadCount || 0);

        // Check for new notifications to trigger beep & native status bar notification
        if (initialLoadCompletedRef.current) {
          const newUnread = incomingList.filter(
            (n) => !n.isRead && !deliveredNotificationIdsRef.current.has(n.id)
          );

          if (newUnread.length > 0) {
            // Play sound beep and show phone notification center alert
            newUnread.forEach((n) => {
              deliveredNotificationIdsRef.current.add(n.id);
              NativeNotificationService.showNotification({
                title: n.title,
                message: n.message,
                orderId: n.orderId,
                orderReference: n.orderReference,
                type: n.type,
              });
            });
            NativeNotificationService.playBeep();
          }
        } else {
          // On first load, seed delivered IDs so old notifications do not buzz
          incomingList.forEach((n) => deliveredNotificationIdsRef.current.add(n.id));
          initialLoadCompletedRef.current = true;
        }

        setNotifications(incomingList);
        setUnreadCount(incomingCount);
      } catch (err) {
        console.warn('Failed to fetch notifications:', err);
      } finally {
        if (!isBackground) {
          setIsLoading(false);
        }
      }
    },
    [token, isAuthenticated]
  );

  // Initial fetch and 10-second polling for real-time synchronization
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchNotifications(false);

      const interval = setInterval(() => {
        fetchNotifications(true);
      }, 10000);

      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      deliveredNotificationIdsRef.current.clear();
      initialLoadCompletedRef.current = false;
    }
  }, [isAuthenticated, token, fetchNotifications]);

  const markAsRead = async (id: string): Promise<void> => {
    if (!token) return;

    // Optimistically update local state immediately
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const res = await api.markNotificationAsRead(id, token);
      if (res && typeof res.unreadCount === 'number') {
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.warn('Error marking notification as read:', err);
      // Re-fetch to reconcile state on error
      fetchNotifications(true);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    if (!token) return;

    // Optimistically mark all read immediately
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await api.markAllNotificationsAsRead(token);
    } catch (err) {
      console.warn('Error marking all notifications as read:', err);
      fetchNotifications(true);
    }
  };

  const refetch = async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      await fetchNotifications(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    return await NativeNotificationService.requestPermission();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isRefreshing,
        markAsRead,
        markAllAsRead,
        refetch,
        requestPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
