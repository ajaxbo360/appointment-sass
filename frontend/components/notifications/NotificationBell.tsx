"use client";

import React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/contexts/notification-context";
import NotificationItem from "./NotificationItem";
import { cn } from "@/lib/utils";

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();
  const [open, setOpen] = React.useState(false);

  // Handle clicking a notification
  const handleNotificationClick = async (id: number) => {
    await markAsRead(id);
  };

  // Handle marking all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`View notifications (${unreadCount} unread)`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 px-1.5 text-xs rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[350px] p-0" align="end">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div
            className="flex items-center justify-center p-4 text-muted-foreground"
            data-testid="notification-loading"
          >
            <span className="loading loading-spinner loading-sm mr-2"></span>
            Loading notifications...
          </div>
        ) : notifications.length > 0 ? (
          <ScrollArea className="h-[300px]">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
          </ScrollArea>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No notifications
          </div>
        )}

        <div className="p-2 border-t">
          <Link href="/notifications">
            <Button variant="outline" size="sm" className="w-full">
              View all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
