"use client";

import { DashboardNav } from "@/components/dashboard-nav";
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from "@/contexts/notification-context";

export default function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <div className="flex min-h-screen flex-col">
        <DashboardNav />
        <main className="flex-1 bg-muted p-4 md:p-6">
          <div className="container mx-auto max-w-7xl">{children}</div>
        </main>
        <Toaster />
      </div>
    </NotificationProvider>
  );
}
