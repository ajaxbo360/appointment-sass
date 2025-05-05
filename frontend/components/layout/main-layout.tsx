import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import NotificationBell from "@/components/notifications/NotificationBell";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-xl">
              <span className="flex items-center">
                {theme === "dark" ? (
                  <MoonIcon className="mr-2 h-5 w-5 text-purple-400" />
                ) : (
                  <SunIcon className="mr-2 h-5 w-5 text-yellow-500" />
                )}
                AppointEase
              </span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/dashboard" className="text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/appointments" className="text-sm font-medium">
                Appointments
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <>
                <NotificationBell />
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    {user.name}
                  </Button>
                </Link>
                <Button size="sm" onClick={logout}>
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">{children}</main>
      <footer className="border-t py-4">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AppointEase. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
