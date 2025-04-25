"use client";

import { useState, useEffect } from "react";
import { useApiClient } from "@/lib/api-client";
import ProtectedRoute from "@/components/auth/protected-route";
import { mockAppointments, type Appointment } from "@/lib/mock-data";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const api = useApiClient();
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        try {
          const data = await api.get("/api/appointments");
          console.log("API appointments data:", data);
          if (data && data.data && data.data.length > 0) {
            setAppointments(data.data);
            return;
          }
        } catch (apiError) {
          console.log("API fetch failed, using mock data");
        }

        // If API fails or returns empty, use mock data
        console.log("Using mock appointments data");
        setAppointments(mockAppointments);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        toast({
          title: "Error",
          description: "Could not load appointments. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [api]);

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = "EEEE";
    const days = [];
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center py-2 font-medium text-sm">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="grid grid-cols-7 border-b">{days}</div>;
  };

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;

        // Get appointments for this day
        const dayAppointments = appointments.filter((appointment) =>
          isSameDay(new Date(appointment.start_time), cloneDay)
        );

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[120px] border p-1 ${
              !isSameMonth(day, monthStart)
                ? "bg-muted/50 text-muted-foreground"
                : isSameDay(day, new Date())
                ? "bg-primary/10 font-bold"
                : ""
            }`}
          >
            <div className="text-right mb-1">{formattedDate}</div>
            <div className="overflow-y-auto max-h-[80px] space-y-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </>
              ) : (
                dayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="text-xs p-1 rounded cursor-pointer truncate"
                    style={{
                      backgroundColor: appointment.category?.color || "#CBD5E1",
                      color: isLightColor(
                        appointment.category?.color || "#CBD5E1"
                      )
                        ? "#000"
                        : "#fff",
                    }}
                    onClick={() =>
                      router.push(`/appointments/${appointment.id}`)
                    }
                  >
                    {format(new Date(appointment.start_time), "HH:mm")}{" "}
                    {appointment.title}
                  </div>
                ))
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  // Helper function to determine if we should use black or white text on a background color
  const isLightColor = (color: string) => {
    // Default to true if no color
    if (!color) return true;

    // Convert hex to RGB
    let hex = color.replace("#", "");
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Calculate brightness (standard formula)
    let brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return true if the color is light
    return brightness > 128;
  };

  return (
    <ProtectedRoute>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              View and manage your appointments in calendar view
            </p>
          </div>
          <Button onClick={() => router.push("/appointments/create")}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
