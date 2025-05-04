import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import NotificationItem from "@/components/notifications/NotificationItem";
import { Notification } from "@/contexts/notification-context";
import { formatDistanceToNow } from "date-fns";

// Mock date-fns
jest.mock("date-fns", () => ({
  ...jest.requireActual("date-fns"),
  formatDistanceToNow: jest.fn((...args) => {
    console.log("MOCK formatDistanceToNow called with:", args);
    return "5 minutes ago";
  }),
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe("NotificationItem Component", () => {
  const mockNotification: Notification = {
    id: 1,
    title: "Appointment Reminder",
    content: "Your appointment is in 30 minutes",
    isRead: false,
    createdAt: "2023-05-10T10:00:00Z",
    appointment_id: 123,
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
    // Clear the regular mock function
  });

  it("renders notification with correct content", () => {
    render(
      <NotificationItem notification={mockNotification} onClick={mockOnClick} />
    );

    expect(screen.getByText("Appointment Reminder")).toBeInTheDocument();
    expect(
      screen.getByText("Your appointment is in 30 minutes")
    ).toBeInTheDocument();
    const timeElement = screen.getByText(/ago/i);
    expect(timeElement).toBeInTheDocument();
  });

  it("shows unread indicator for unread notifications", () => {
    render(
      <NotificationItem notification={mockNotification} onClick={mockOnClick} />
    );

    expect(screen.getByTestId("unread-indicator")).toBeInTheDocument();
  });

  it("does not show unread indicator for read notifications", () => {
    const readNotification = { ...mockNotification, isRead: true };

    render(
      <NotificationItem notification={readNotification} onClick={mockOnClick} />
    );

    expect(screen.queryByTestId("unread-indicator")).not.toBeInTheDocument();
  });

  /*
  it("displays relative time correctly", () => {
    // Mock the current date to a fixed value
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2023-05-10T12:00:00Z"));

    render(
      <NotificationItem notification={mockNotification} onClick={mockOnClick} />
    );

    // 2 hours ago (10:00 to 12:00) - using more flexible matcher
    expect(screen.getByText(/about 2 hours ago/i)).toBeInTheDocument();

    jest.useRealTimers();
  });
  */

  it("handles notifications with appointment_id correctly", () => {
    // Mock notification with appointment_id
    const notificationWithAppointment = {
      ...mockNotification,
      appointment_id: 123,
    };

    render(
      <NotificationItem
        notification={notificationWithAppointment}
        onClick={mockOnClick}
      />
    );

    // Should have a view appointment button/link
    expect(screen.getByText("View Appointment")).toBeInTheDocument();
  });

  it("handles notifications without appointment_id correctly", () => {
    // Mock notification without appointment_id
    const notificationWithoutAppointment = {
      ...mockNotification,
      appointment_id: null,
    };

    render(
      <NotificationItem
        notification={notificationWithoutAppointment}
        onClick={mockOnClick}
      />
    );

    // Should not have a view appointment button/link
    expect(screen.queryByText("View Appointment")).not.toBeInTheDocument();
  });

  it("shows unread indicator when notification is unread", () => {
    render(
      <NotificationItem
        notification={{ ...mockNotification, isRead: false }}
        onClick={mockOnClick}
      />
    );
    expect(screen.getByTestId("unread-indicator")).toBeInTheDocument();
  });

  it("does not show unread indicator when notification is read", () => {
    render(
      <NotificationItem
        notification={{ ...mockNotification, isRead: true }}
        onClick={mockOnClick}
      />
    );
    expect(screen.queryByTestId("unread-indicator")).not.toBeInTheDocument();
  });

  it("calls onClick with notification id when clicked", () => {
    render(
      <NotificationItem notification={mockNotification} onClick={mockOnClick} />
    );

    fireEvent.click(screen.getByRole("button"));

    expect(mockOnClick).toHaveBeenCalledWith(mockNotification.id);
  });

  it("calls onClick with notification id when clicked and unread", () => {
    render(
      <NotificationItem
        notification={{ ...mockNotification, isRead: false }}
        onClick={mockOnClick}
      />
    );

    const item = screen.getByRole("button");
    fireEvent.click(item);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockNotification.id);
  });

  it("does not call onClick when clicked and already read", () => {
    render(
      <NotificationItem
        notification={{ ...mockNotification, isRead: true }}
        onClick={mockOnClick}
      />
    );

    const item = screen.getByRole("button");
    fireEvent.click(item);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("calls onClick when Enter key is pressed and unread", () => {
    render(
      <NotificationItem
        notification={{ ...mockNotification, isRead: false }}
        onClick={mockOnClick}
      />
    );

    const item = screen.getByRole("button");
    fireEvent.keyDown(item, { key: "Enter", code: "Enter" });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockNotification.id);
  });

  it("calls onClick when Space key is pressed and unread", () => {
    render(
      <NotificationItem
        notification={{ ...mockNotification, isRead: false }}
        onClick={mockOnClick}
      />
    );

    const item = screen.getByRole("button");
    fireEvent.keyDown(item, { key: " ", code: "Space" });

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockNotification.id);
  });

  it("does not call onClick on key press when already read", () => {
    render(
      <NotificationItem
        notification={{ ...mockNotification, isRead: true }}
        onClick={mockOnClick}
      />
    );

    const item = screen.getByRole("button");
    fireEvent.keyDown(item, { key: "Enter", code: "Enter" });
    fireEvent.keyDown(item, { key: " ", code: "Space" });

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("does not render View Appointment link if appointment_id is null", () => {
    render(
      <NotificationItem
        notification={{ ...mockNotification, appointment_id: null }}
        onClick={mockOnClick}
      />
    );
    expect(
      screen.queryByRole("link", { name: "View Appointment" })
    ).not.toBeInTheDocument();
  });
});
