import React from "react";
import Header from "@/components/Header";
import { NotificationProvider } from "@/contexts/notification-context";

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </NotificationProvider>
  );
}
