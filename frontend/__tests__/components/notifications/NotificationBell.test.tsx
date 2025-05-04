import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useNotifications } from "@/contexts/notification-context";
// Assuming Notification type might be in a central types file
// import { Notification } from '@/types'; // Remove for now if path is uncertain

// Define a local Notification type matching the expected structure from linter error
interface Notification {
  id: number;
  title: string; // Expected by linter
  content: string; // Expected by linter
  isRead: boolean; // Expected by linter
  createdAt: string; // Expected by linter
  // Add other fields used by mocks if necessary
  data?: { message?: string }; // For the mock item rendering
}

// Mock the notification context values
jest.mock("@/contexts/notification-context", () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  useNotifications: jest.fn(),
}));

// Mock the API client
jest.mock("@/lib/api-client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock NotificationItem to simplify testing
jest.mock("@/components/notifications/NotificationItem", () => {
  return jest.fn(({ notification, onClick }) => (
    <div data-testid={`notification-item-${notification.id}`}>
      {notification.data.message} {/* Display some content */}
      <button onClick={() => onClick(notification.id)}>Mark Read</button>
    </div>
  ));
});

describe("NotificationBell Component", () => {
  const mockUseNotifications = useNotifications as jest.MockedFunction<
    typeof useNotifications
  >;

  // Update mock data to match the local Notification type
  const mockNotifications: Notification[] = [
    {
      id: 1,
      title: "Upcoming Appointment", // Add title
      content: "Reminder: Your meeting is tomorrow.", // Add content (use message)
      isRead: false, // Add isRead (based on read_at)
      createdAt: "2024-08-01T12:00:00Z", // Add createdAt
      data: { message: "Reminder: Your meeting is tomorrow." }, // Keep original data if needed
    },
    {
      id: 2,
      title: "Appointment Updated", // Add title
      content: "Your appointment details have changed.", // Add content (use message)
      isRead: true, // Add isRead (based on read_at)
      createdAt: "2024-08-01T11:00:00Z", // Add createdAt
      data: { message: "Your appointment details have changed." }, // Keep original data if needed
    },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Default mock return value
    mockUseNotifications.mockReturnValue({
      notifications: [] as Notification[], // Use typed empty array
      unreadCount: 0,
      isLoading: false,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      error: null,
      refreshNotifications: jest.fn(),
    });
  });

  it("renders the notification bell icon", () => {
    render(<NotificationBell />);
    expect(screen.getByLabelText(/View notifications/i)).toBeInTheDocument();
    // Check specifically for the bell icon if needed, e.g., via a test ID or SVG structure
  });

  it("does not display badge when unread count is zero", () => {
    render(<NotificationBell />);
    expect(screen.queryByText(/\d+/)).not.toBeInTheDocument(); // No digit badge
  });

  it("displays the correct unread count", () => {
    mockUseNotifications.mockReturnValue({
      ...mockUseNotifications(),
      unreadCount: 3,
    });
    render(<NotificationBell />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/View notifications \(3 unread\)/i)
    ).toBeInTheDocument();
  });

  it("displays '9+' badge when unread count is greater than 9", () => {
    mockUseNotifications.mockReturnValue({
      ...mockUseNotifications(),
      unreadCount: 12,
    });
    render(<NotificationBell />);
    expect(screen.getByText("9+")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/View notifications \(12 unread\)/i)
    ).toBeInTheDocument();
  });

  it("opens notification popover when clicked", async () => {
    mockUseNotifications.mockReturnValue({
      ...mockUseNotifications(),
      notifications: mockNotifications,
      unreadCount: 1, // Assuming first one is unread
    });
    render(<NotificationBell />);

    const triggerButton = screen.getByLabelText(
      /View notifications \(1 unread\)/i
    );
    await act(async () => {
      fireEvent.click(triggerButton);
    });

    // Check for popover content
    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeVisible();
      expect(screen.getByTestId("notification-item-1")).toBeVisible();
      expect(screen.getByTestId("notification-item-2")).toBeVisible(); // Both rendered
      expect(
        screen.getByText(/Reminder: Your meeting is tomorrow./i)
      ).toBeVisible();
      expect(
        screen.getByRole("button", { name: /Mark all as read/i })
      ).toBeVisible();
      expect(
        screen.getByRole("button", { name: /View all notifications/i })
      ).toBeVisible();
    });
  });

  it("shows loading state when fetching notifications", () => {
    mockUseNotifications.mockReturnValue({
      ...mockUseNotifications(),
      isLoading: true,
    });
    render(<NotificationBell />);

    const triggerButton = screen.getByLabelText(
      /View notifications \(0 unread\)/i
    );
    act(() => {
      fireEvent.click(triggerButton);
    });

    expect(screen.getByTestId("notification-loading")).toBeInTheDocument(); // Use data-testid from component
    expect(screen.getByText(/Loading notifications.../i)).toBeInTheDocument();
  });

  it("shows 'No notifications' message when list is empty", async () => {
    mockUseNotifications.mockReturnValue({
      ...mockUseNotifications(),
      notifications: [] as Notification[], // Use typed empty array
      unreadCount: 0,
    });
    render(<NotificationBell />);

    const triggerButton = screen.getByLabelText(
      /View notifications \(0 unread\)/i
    );
    await act(async () => {
      fireEvent.click(triggerButton);
    });

    await waitFor(() => {
      expect(screen.getByText("No notifications")).toBeVisible();
    });
  });

  it("calls markAllAsRead when 'Mark all as read' button is clicked", async () => {
    const markAllAsReadMock = jest.fn();
    mockUseNotifications.mockReturnValue({
      ...mockUseNotifications(),
      notifications: mockNotifications,
      unreadCount: 1,
      markAllAsRead: markAllAsReadMock,
    });
    render(<NotificationBell />);

    const triggerButton = screen.getByLabelText(
      /View notifications \(1 unread\)/i
    );
    await act(async () => {
      fireEvent.click(triggerButton);
    });

    // Wait for the button to be visible and click it
    const markAllButton = await screen.findByRole("button", {
      name: /Mark all as read/i,
    });
    await act(async () => {
      fireEvent.click(markAllButton);
    });

    expect(markAllAsReadMock).toHaveBeenCalledTimes(1);
  });
});
