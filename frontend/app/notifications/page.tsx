"use client";

import React, { useState } from "react";
import { useNotifications } from "@/contexts/notification-context";
import NotificationItem from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Notification } from "@/contexts/notification-context";

export default function NotificationsPage() {
  const { notifications, isLoading, markAsRead, markAllAsRead } =
    useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Filter notifications based on selected tab
  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((notification) => !notification.isRead);

  // Handle clicking a notification
  const handleNotificationClick = async (id: number) => {
    await markAsRead(id);
  };

  // Handle marking all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" onClick={() => setFilter("all")}>
            All
          </TabsTrigger>
          <TabsTrigger value="unread" onClick={() => setFilter("unread")}>
            Unread
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-0">
          {renderNotificationList(
            filteredNotifications,
            isLoading,
            handleNotificationClick
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-0">
          {renderNotificationList(
            filteredNotifications,
            isLoading,
            handleNotificationClick
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to render the notification list
function renderNotificationList(
  notifications: Notification[],
  isLoading: boolean,
  onClick: (id: number) => void
) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <span className="loading loading-spinner loading-md mr-2"></span>
        Loading notifications...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground border rounded-md">
        No notifications found
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={onClick}
        />
      ))}
    </div>
  );
}
