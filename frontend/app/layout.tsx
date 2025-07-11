"use client";

import "@/styles/globals.css";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ApiClientProvider } from "@/lib/api-client";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from "@/contexts/notification-context";
import { AppointmentReminderPopup } from "@/components/appointment-reminder-popup";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>AppointEase</title>
        <meta name="description" content="Appointment scheduling made easy" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ApiClientProvider>
              <NotificationProvider>
                {children}
                <AppointmentReminderPopup />
              </NotificationProvider>
            </ApiClientProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
