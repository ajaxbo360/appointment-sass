"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

export function DashboardNav() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a
              href="/dashboard"
              className="font-semibold flex items-center gap-2"
            >
              {theme === "dark" ? (
                <MoonIcon className="h-5 w-5 text-purple-400" />
              ) : (
                <SunIcon className="h-5 w-5 text-yellow-500" />
              )}
              AppointEase
            </a>
            <div className="hidden md:flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </a>
              <a
                href="/dashboard/appointments"
                className="text-muted-foreground hover:text-foreground"
              >
                Appointments
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
