"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { useEffect, useState } from "react";
import NotificationBell from "./notifications/NotificationBell";

export function DashboardNav() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const isActivePath = (path: string) => {
    return pathname === path;
  };

  if (!mounted) {
    return null; // or a loading skeleton
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="font-semibold flex items-center gap-2"
            >
              {mounted && theme === "dark" ? (
                <MoonIcon className="h-5 w-5 text-purple-400" />
              ) : (
                <SunIcon className="h-5 w-5 text-yellow-500" />
              )}
              AppointEase
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboard"
                className={cn(
                  "transition-colors hover:text-foreground",
                  isActivePath("/dashboard")
                    ? "text-foreground font-bold border-b-2 border-primary pb-1"
                    : "text-muted-foreground"
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/appointments"
                className={cn(
                  "transition-colors hover:text-foreground",
                  isActivePath("/appointments")
                    ? "text-foreground font-bold border-b-2 border-primary pb-1"
                    : "text-muted-foreground"
                )}
              >
                Appointments
              </Link>
              <Link
                href="/calendar"
                className={cn(
                  "transition-colors hover:text-foreground",
                  isActivePath("/calendar")
                    ? "text-foreground font-bold border-b-2 border-primary pb-1"
                    : "text-muted-foreground"
                )}
              >
                Calendar
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-2">
                <NotificationBell />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.avatar || ""}
                          alt={user?.name || "User"}
                        />
                        <AvatarFallback>
                          {user?.name
                            ? user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
