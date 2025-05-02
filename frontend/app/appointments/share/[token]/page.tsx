"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Download, Plus } from "lucide-react";
import { format } from "date-fns";

interface SharedAppointment {
  id: number;
  title: string;
  description?: string;
  category?: {
    id: number;
    name: string;
    color?: string;
  };
  start_time: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
}

export default function SharedAppointmentPage() {
  const params = useParams();
  const token = params?.token
    ? typeof params.token === "string"
      ? params.token
      : Array.isArray(params.token)
      ? params.token[0]
      : null
    : null;
  const [appointment, setAppointment] = useState<SharedAppointment | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      setIsLoading(true);
      try {
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const response = await fetch(
          `${apiBaseUrl}/appointments/share/${token}`
        );

        if (!response.ok) {
          throw new Error("Invalid or expired share link");
        }

        const data = await response.json();
        if (data && data.data) {
          setAppointment(data.data);
        } else {
          console.error("Unexpected API response format:", data);
          setAppointment(data);
        }
      } catch (err) {
        console.error("Error fetching shared appointment:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load appointment"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchAppointment();
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">
              {error || "Invalid or expired share link"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formattedDate = appointment.start_time
    ? format(new Date(appointment.start_time), "PPP")
    : "No date specified";

  const formattedTime = appointment.start_time
    ? format(new Date(appointment.start_time), "h:mm a")
    : "No time specified";

  const formattedEndTime = appointment.end_time
    ? format(new Date(appointment.end_time), "h:mm a")
    : "";

  const timeDisplay = formattedEndTime
    ? `${formattedTime} - ${formattedEndTime}`
    : formattedTime;

  return (
    <div className="container max-w-3xl py-10 min-h-screen flex flex-col items-center">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{appointment.title}</CardTitle>
            {appointment.category && (
              <div
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: appointment.category.color || "#e2e8f0",
                  color: appointment.category.color
                    ? isDarkColor(appointment.category.color)
                      ? "white"
                      : "black"
                    : "black",
                }}
              >
                {appointment.category.name}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>{timeDisplay}</span>
            </div>
          </div>

          {appointment.description && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {appointment.description}
                </p>
              </div>
            </>
          )}

          <Separator />

          <div className="flex flex-col space-y-4">
            <h3 className="font-medium">Add to Calendar</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const apiBaseUrl =
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:8000/api";
                  try {
                    const response = await fetch(
                      `${apiBaseUrl}/appointments/share/${token}/google-calendar`
                    );
                    if (!response.ok)
                      throw new Error("Failed to get calendar link");
                    const data = await response.json();
                    window.open(data.google_calendar_url, "_blank");
                  } catch (error) {
                    console.error("Error opening Google Calendar:", error);
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Google Calendar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const apiBaseUrl =
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:8000/api";
                  try {
                    // For iCal, we directly download the file instead of trying to parse JSON
                    window.location.href = `${apiBaseUrl}/appointments/share/${token}/ical`;
                  } catch (error) {
                    console.error("Error downloading iCal:", error);
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download iCal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to determine if a color is dark
function isDarkColor(color: string): boolean {
  // Remove the # if it exists
  const hex = color.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return whether the color is dark
  return luminance < 0.5;
}
