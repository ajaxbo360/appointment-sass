import React from "react";
import { render, act, renderHook, waitFor } from "@testing-library/react";
import {
  NotificationProvider,
  useNotifications,
} from "@/contexts/notification-context";

// Mock the API client
jest.mock("@/lib/api-client", () => ({
  useApiClient: jest.fn().mockReturnValue({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    isReady: true,
  }),
}));

// Mock browser notifications API
Object.defineProperty(global, "Notification", {
  value: jest.fn(() => ({
    onclick: jest.fn(),
  })),
  writable: true,
});

// Type assertion to allow property assignment in test environment
(Notification as any).permission = "granted";
Notification.requestPermission = jest.fn().mockResolvedValue("granted");

describe("NotificationContext", () => {
  const mockApiClient = require("@/lib/api-client").useApiClient();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful API responses
    mockApiClient.get.mockImplementation((url: string) => {
      if (url.includes("/notifications")) {
        return Promise.resolve({
          data: {
            notifications: [
              {
                id: 1,
                title: "Appointment Reminder",
                content: "Your appointment is in 30 minutes",
                isRead: false,
                createdAt: "2023-05-10T10:00:00Z",
                appointment_id: 123,
              },
              {
                id: 2,
                title: "New Appointment",
                content: "A new appointment has been created",
                isRead: true,
                createdAt: "2023-05-09T15:30:00Z",
                appointment_id: 456,
              },
            ],
            unreadCount: 1,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    mockApiClient.post.mockResolvedValue({ data: { success: true } });
    mockApiClient.put.mockResolvedValue({ data: { success: true } });
  });

  it("provides initial notification state", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotifications(), { wrapper });

    // Initial state should have empty notifications and loading state
    expect(result.current.notifications).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.unreadCount).toBe(0);

    // Wait for the API call to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify the notifications were loaded
    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.unreadCount).toBe(1);
  });

  it("fetches notifications from API on initialization", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    // Need to wait until the API call happens after initialization
    await act(async () => {
      renderHook(() => useNotifications(), { wrapper });
    });

    // Wait a bit to ensure all async operations complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify API was called
    expect(mockApiClient.get).toHaveBeenCalledWith("/notifications");
  });

  it("allows marking a notification as read", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotifications(), { wrapper });

    // Wait for notifications to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mark the first notification as read
    await act(async () => {
      await result.current.markAsRead(1);
    });

    // Verify API call was made
    expect(mockApiClient.put).toHaveBeenCalledWith("/notifications/1/read");

    // Unread count should decrease
    expect(result.current.unreadCount).toBe(0);

    // The notification should be marked as read
    const updatedNotification = result.current.notifications.find(
      (n) => n.id === 1
    );
    expect(updatedNotification?.isRead).toBe(true);
  });

  it("allows marking all notifications as read", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotifications(), { wrapper });

    // Wait for notifications to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mark all notifications as read
    await act(async () => {
      await result.current.markAllAsRead();
    });

    // Verify API call was made
    expect(mockApiClient.post).toHaveBeenCalledWith("/notifications/read-all");

    // Unread count should be zero
    expect(result.current.unreadCount).toBe(0);

    // All notifications should be marked as read
    expect(result.current.notifications.every((n) => n.isRead)).toBe(true);
  });

  it("handles API errors gracefully", async () => {
    // Mock API failure
    mockApiClient.get.mockRejectedValue(new Error("Network error"));

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotifications(), { wrapper });

    // Wait for API call to fail
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should handle error gracefully and have empty notifications
    expect(result.current.notifications).toEqual([]);
    expect(result.current.error).toBeTruthy();

    // Error should be logged
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("refreshes notifications on demand", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotifications(), { wrapper });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear API mock call count
    mockApiClient.get.mockClear();

    // Refresh notifications
    await act(async () => {
      await result.current.refreshNotifications();
    });

    // Verify API was called again
    expect(mockApiClient.get).toHaveBeenCalledWith("/notifications");
  });

  it("shows browser notifications for new unread notifications", async () => {
    // First load with one notification
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        notifications: [
          {
            id: 1,
            title: "Appointment Reminder",
            content: "Your appointment is in 30 minutes",
            isRead: false,
            createdAt: "2023-05-10T10:00:00Z",
          },
        ],
        unreadCount: 1,
      },
    });

    // Second load with a new notification
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        notifications: [
          {
            id: 2,
            title: "New Notification",
            content: "This is a new notification",
            isRead: false,
            createdAt: "2023-05-10T11:00:00Z",
          },
          {
            id: 1,
            title: "Appointment Reminder",
            content: "Your appointment is in 30 minutes",
            isRead: false,
            createdAt: "2023-05-10T10:00:00Z",
          },
        ],
        unreadCount: 2,
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotifications(), { wrapper });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Refresh to get new notification
    await act(async () => {
      await result.current.refreshNotifications();
    });

    // Verify browser notification was created
    expect(global.Notification).toHaveBeenCalledWith(
      "New Notification",
      expect.objectContaining({
        body: "This is a new notification",
      })
    );
  });
});
