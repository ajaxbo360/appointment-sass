"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useApiClient } from "@/lib/api-client";

// Define the Notification type
export interface Notification {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  appointment_id?: number | null;
}

// Define the NotificationContext state
interface NotificationContextState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

// Create the context
const NotificationContext = createContext<NotificationContextState | undefined>(
  undefined
);

// Custom hook to use the notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}

// Check if browser notifications are supported
const isBrowserNotificationSupported = () => {
  return typeof window !== "undefined" && "Notification" in window;
};

// Request browser notification permission
const requestNotificationPermission = async () => {
  if (!isBrowserNotificationSupported()) return false;

  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

// Provider component
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiClient = useApiClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);
  const [lastNotificationId, setLastNotificationId] = useState<number | null>(
    null
  );

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!apiClient.isReady) return;

    try {
      setIsLoading(true);
      console.log("Fetching notifications...");
      const response = await apiClient.get("/notifications");
      console.log("Full API response:", response);

      // Check if response exists
      if (!response) {
        console.error("API returned empty response");
        setError(new Error("Empty API response"));
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      // Handle the API response structure correctly
      const data = response;
      console.log("Processed notification data:", data);

      // Update state with fetched notifications
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);

      // Check for new notifications to show browser notifications
      if (hasNotificationPermission && lastNotificationId !== null) {
        const newNotifications = (data.notifications || []).filter(
          (notification: Notification) =>
            !notification.isRead && notification.id > lastNotificationId
        );

        // Show browser notifications for new items
        newNotifications.forEach((notification: Notification) => {
          new Notification(notification.title, {
            body: notification.content,
            icon: "/notification-icon.png",
            data: {
              url: notification.appointment_id
                ? `/appointments/${notification.appointment_id}`
                : "/notifications",
            },
          });
        });
      }

      // Remember the latest notification ID
      if (data.notifications && data.notifications.length > 0) {
        const maxId = Math.max(
          ...data.notifications.map((n: Notification) => n.id)
        );
        setLastNotificationId(maxId);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, hasNotificationPermission, lastNotificationId]);

  // Mark a notification as read
  const markAsRead = useCallback(
    async (id: number) => {
      try {
        await apiClient.put(`/notifications/${id}/read`);

        // Update local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification
          )
        );

        // Update unread count
        setUnreadCount((prev) => {
          const notification = notifications.find((n) => n.id === id);
          return notification && !notification.isRead ? prev - 1 : prev;
        });
      } catch (err) {
        console.error(`Error marking notification ${id} as read:`, err);
      }
    },
    [notifications, apiClient]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.post("/notifications/read-all");

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );

      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, [apiClient]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Initialize notifications and request permissions
  useEffect(() => {
    if (!apiClient.isReady) return;

    const initialize = async () => {
      // Request notification permission
      if (isBrowserNotificationSupported()) {
        const hasPermission = await requestNotificationPermission();
        setHasNotificationPermission(hasPermission);
      }

      // Fetch initial notifications
      await fetchNotifications();
    };

    initialize();

    // Set up polling for notifications (every 30 seconds)
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, apiClient.isReady]);

  // Create the context value
  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
