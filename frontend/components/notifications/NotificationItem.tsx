"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notification } from "@/contexts/notification-context";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onClick: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
}) => {
  const { id, title, content, isRead, createdAt, appointment_id } =
    notification;

  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
  });

  // Handle click - only call onClick if it's unread
  const handleClick = () => {
    if (!isRead) {
      onClick(id);
    }
  };

  // Handle key down - only call onClick if it's unread
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      // No need to check target for keydown, focus implies target
      if (!isRead) {
        onClick(id);
      }
    }
  };

  return (
    <div
      className={cn(
        "flex items-start p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 gap-3",
        !isRead ? "bg-blue-50 dark:bg-blue-950/30" : "bg-background"
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Notification: ${title} - ${content}`}
    >
      <div className="w-2 pt-1 flex-shrink-0">
        {!isRead && (
          <span
            className="block h-2 w-2 rounded-full bg-primary"
            aria-label="Unread"
            data-testid="unread-indicator"
          ></span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <p className="text-sm font-medium truncate mr-2">{title}</p>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            {timeAgo}
          </p>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{content}</p>
        {appointment_id && (
          <Link
            href={`/appointments/${appointment_id}`}
            className="text-xs text-primary hover:underline inline-block mt-1"
            onClick={(e) => e.stopPropagation()}
            data-testid="notification-appointment-link"
          >
            View Appointment
          </Link>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
