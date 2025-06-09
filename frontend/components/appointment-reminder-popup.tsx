"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useApiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Clock, Calendar, Bell } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface UpcomingAppointment {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  category?: {
    name: string;
    color: string;
  };
}

interface AppointmentReminderPopupProps {
  checkIntervalMs?: number;
  reminderMinutes?: number;
}

export function AppointmentReminderPopup({
  checkIntervalMs = 60000,
  reminderMinutes = 15,
}: AppointmentReminderPopupProps) {
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    UpcomingAppointment[]
  >([]);
  const [dismissedAppointments, setDismissedAppointments] = useState<
    Set<number>
  >(new Set());
  const api = useApiClient();
  const router = useRouter();

  const checkUpcomingAppointments = useCallback(async () => {
    console.log("🔍 Checking for upcoming appointments...");

    if (!api.isReady) {
      console.log("❌ API not ready");
      return;
    }

    try {
      const response = await api.get("/api/appointments");
      console.log("📋 API Response:", response);

      if (!response?.data) {
        console.log("❌ No data in response");
        return;
      }

      const now = new Date();
      const reminderTime = new Date(
        now.getTime() + reminderMinutes * 60 * 1000
      );

      console.log("⏰ Current time:", now.toISOString());
      console.log("⏰ Reminder time:", reminderTime.toISOString());

      const upcoming = response.data.filter(
        (appointment: UpcomingAppointment) => {
          const startTime = new Date(appointment.start_time);
          const isUpcoming = startTime > now && startTime <= reminderTime;
          const notDismissed = !dismissedAppointments.has(appointment.id);

          console.log(`📅 Appointment "${appointment.title}":`, {
            startTime: startTime.toISOString(),
            isUpcoming,
            notDismissed,
            willShow: isUpcoming && notDismissed,
          });

          return isUpcoming && notDismissed;
        }
      );

      console.log(
        `✅ Found ${upcoming.length} upcoming appointments:`,
        upcoming
      );
      setUpcomingAppointments(upcoming);

      // Browser notifications
      upcoming.forEach((appointment: UpcomingAppointment) => {
        if ("Notification" in window && Notification.permission === "granted") {
          const timeUntil = Math.round(
            (new Date(appointment.start_time).getTime() - now.getTime()) /
              (1000 * 60)
          );
          new Notification(`Appointment Starting Soon`, {
            body: `${appointment.title} starts in ${timeUntil} minute(s)`,
            icon: "/favicon.ico",
            tag: `appointment-${appointment.id}`,
          });
        }
      });
    } catch (error) {
      console.error("❌ Error checking upcoming appointments:", error);
    }
  }, [api, reminderMinutes, dismissedAppointments]);

  const dismissAppointment = (appointmentId: number) => {
    console.log("🗑️ Dismissing appointment:", appointmentId);
    setDismissedAppointments((prev) => new Set([...prev, appointmentId]));
    setUpcomingAppointments((prev) =>
      prev.filter((apt) => apt.id !== appointmentId)
    );
  };

  const dismissAll = () => {
    console.log("🗑️ Dismissing all appointments");
    upcomingAppointments.forEach((apt) => {
      setDismissedAppointments((prev) => new Set([...prev, apt.id]));
    });
    setUpcomingAppointments([]);
  };

  const viewAppointmentDetails = (appointmentId: number) => {
    router.push(`/appointments/${appointmentId}`);
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    console.log(
      "🚀 Setting up appointment reminder with",
      reminderMinutes,
      "minute window"
    );
    checkUpcomingAppointments();
    const interval = setInterval(checkUpcomingAppointments, checkIntervalMs);
    return () => clearInterval(interval);
  }, [checkUpcomingAppointments, checkIntervalMs]);

  console.log("🎯 Popup render - appointments:", upcomingAppointments.length);

  if (upcomingAppointments.length === 0) {
    console.log("❌ No appointments to show");
    return null;
  }

  console.log(
    "✅ Rendering popup with",
    upcomingAppointments.length,
    "appointments"
  );

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-sm space-y-3">
      {upcomingAppointments.map((appointment) => {
        const startTime = new Date(appointment.start_time);
        const timeUntil = Math.round(
          (startTime.getTime() - new Date().getTime()) / (1000 * 60)
        );

        return (
          <Card
            key={appointment.id}
            className="shadow-lg border bg-card text-card-foreground backdrop-blur-sm"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-full">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-medium text-card-foreground">
                    Appointment Starting Soon
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAppointment(appointment.id)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-foreground leading-tight">
                  {appointment.title}
                </h4>
                {appointment.category && (
                  <Badge
                    variant="secondary"
                    className="shrink-0"
                    style={{
                      backgroundColor: appointment.category.color + "15",
                      color: appointment.category.color,
                      borderColor: appointment.category.color + "30",
                    }}
                  >
                    {appointment.category.name}
                  </Badge>
                )}
              </div>

              {appointment.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {appointment.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">
                    {timeUntil <= 1 ? (
                      <span className="text-destructive font-semibold">
                        Starting now!
                      </span>
                    ) : (
                      `In ${timeUntil} min`
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{format(startTime, "h:mm a")}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={() => viewAppointmentDetails(appointment.id)}
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => dismissAppointment(appointment.id)}
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {upcomingAppointments.length > 1 && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={dismissAll}
            className="text-xs text-muted-foreground border-border hover:bg-accent"
          >
            Dismiss All ({upcomingAppointments.length})
          </Button>
        </div>
      )}
    </div>
  );
}
