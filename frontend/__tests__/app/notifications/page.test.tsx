import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import NotificationsPage from "@/app/notifications/page";
import { NotificationProvider } from "@/contexts/notification-context";

// Mock the notification context values
jest.mock("@/contexts/notification-context", () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  useNotifications: jest.fn(),
}));

describe("NotificationsPage", () => {
  const mockUseNotifications =
    require("@/contexts/notification-context").useNotifications;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the notifications page title", () => {
    // Mock notifications data
    mockUseNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    });

    render(<NotificationsPage />);

    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("renders tabs for filtering notifications", () => {
    // Mock notifications data
    mockUseNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    });

    render(<NotificationsPage />);

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Unread")).toBeInTheDocument();
  });

  it("shows loading state when loading notifications", () => {
    // Mock loading state
    mockUseNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: true,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    });

    render(<NotificationsPage />);

    expect(screen.getByText("Loading notifications...")).toBeInTheDocument();
  });

  it('shows "No notifications found" when no notifications exist', () => {
    // Mock empty notifications
    mockUseNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    });

    render(<NotificationsPage />);

    expect(screen.getByText("No notifications found")).toBeInTheDocument();
  });

  it("renders notifications when they exist", () => {
    // Mock notifications data
    mockUseNotifications.mockReturnValue({
      notifications: [
        {
          id: 1,
          title: "Appointment Reminder",
          content: "Your appointment is in 30 minutes",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: "New Appointment",
          content: "A new appointment has been created",
          isRead: true,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      isLoading: false,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    });

    render(<NotificationsPage />);

    expect(screen.getByText("Appointment Reminder")).toBeInTheDocument();
    expect(
      screen.getByText("Your appointment is in 30 minutes")
    ).toBeInTheDocument();
    expect(screen.getByText("New Appointment")).toBeInTheDocument();
    expect(
      screen.getByText("A new appointment has been created")
    ).toBeInTheDocument();
  });

  it("filters notifications when clicking on Unread tab", async () => {
    const mockNotifications = [
      {
        id: 1,
        title: "Appointment Reminder",
        content: "Your appointment is in 30 minutes",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "New Appointment",
        content: "A new appointment has been created",
        isRead: true,
        createdAt: new Date().toISOString(),
      },
    ];

    // Mock notifications data
    mockUseNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 1,
      isLoading: false,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    });

    render(<NotificationsPage />);

    // Click the Unread tab
    fireEvent.click(screen.getByText("Unread"));

    // Only the unread notification should be visible
    expect(screen.getByText("Appointment Reminder")).toBeInTheDocument();
    expect(
      screen.getByText("Your appointment is in 30 minutes")
    ).toBeInTheDocument();

    // The read notification should not be visible
    await waitFor(() => {
      expect(screen.queryByText("New Appointment")).not.toBeInTheDocument();
    });
  });

  it('shows "Mark all as read" button when unread notifications exist', () => {
    // Mock notifications with unread items
    mockUseNotifications.mockReturnValue({
      notifications: [
        {
          id: 1,
          title: "Appointment Reminder",
          content: "Your appointment is in 30 minutes",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      isLoading: false,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    });

    render(<NotificationsPage />);

    expect(screen.getByText("Mark all as read")).toBeInTheDocument();
  });

  it('calls markAllAsRead when "Mark all as read" is clicked', () => {
    const mockMarkAllAsRead = jest.fn();

    // Mock notifications with markAllAsRead function
    mockUseNotifications.mockReturnValue({
      notifications: [
        {
          id: 1,
          title: "Appointment Reminder",
          content: "Your appointment is in 30 minutes",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      isLoading: false,
      markAsRead: jest.fn(),
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationsPage />);

    // Click the "Mark all as read" button
    fireEvent.click(screen.getByText("Mark all as read"));

    // Check if markAllAsRead was called
    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });
});
