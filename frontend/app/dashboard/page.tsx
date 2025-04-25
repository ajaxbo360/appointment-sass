"use client";

import { useEffect, useState } from "react";
import { useApiClient } from "@/lib/api-client";
import ProtectedRoute from "@/components/auth/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { mockAppointments, type Appointment } from "@/lib/mock-data";
import { CalendarIcon, ClockIcon, BadgeInfo, Tag } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApiClient();
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        console.log("Fetching appointments...");
        // Try to fetch from API first
        try {
          const data = await api.get("/api/appointments");
          console.log("API appointments data:", data);
          if (data && data.data && data.data.length > 0) {
            setAppointments(data.data);
            setIsLoading(false);
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

  // Group appointments by date
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const upcomingAppointments = appointments
    .filter((apt) => new Date(apt.start_time) >= today)
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

  const todayAppointments = upcomingAppointments.filter(
    (apt) => new Date(apt.start_time).toDateString() === today.toDateString()
  );

  const tomorrowAppointments = upcomingAppointments.filter(
    (apt) => new Date(apt.start_time).toDateString() === tomorrow.toDateString()
  );

  const laterAppointments = upcomingAppointments.filter(
    (apt) =>
      new Date(apt.start_time).toDateString() !== today.toDateString() &&
      new Date(apt.start_time).toDateString() !== tomorrow.toDateString()
  );

  const viewAppointmentDetails = (id: number) => {
    router.push(`/appointments/${id}`);
  };

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your upcoming appointments.
            </p>
          </div>
          <Button onClick={() => router.push("/appointments/create")} size="lg">
            Create Appointment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>
                {isLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `You have ${upcomingAppointments.length} upcoming appointments`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4">
                  {isLoading
                    ? renderSkeletonAppointments(3)
                    : renderAppointmentList(
                        upcomingAppointments,
                        viewAppointmentDetails
                      )}
                </TabsContent>
                <TabsContent value="today" className="space-y-4">
                  {isLoading ? (
                    renderSkeletonAppointments(2)
                  ) : todayAppointments.length > 0 ? (
                    renderAppointmentList(
                      todayAppointments,
                      viewAppointmentDetails
                    )
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">
                      No appointments scheduled for today
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="tomorrow" className="space-y-4">
                  {isLoading ? (
                    renderSkeletonAppointments(2)
                  ) : tomorrowAppointments.length > 0 ? (
                    renderAppointmentList(
                      tomorrowAppointments,
                      viewAppointmentDetails
                    )
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">
                      No appointments scheduled for tomorrow
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/appointments")}
              >
                View All Appointments
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Overview of your schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <>
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" /> Today
                      </h3>
                      <Badge variant="outline">
                        {todayAppointments.length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" /> Tomorrow
                      </h3>
                      <Badge variant="outline">
                        {tomorrowAppointments.length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" /> Upcoming
                      </h3>
                      <Badge variant="outline">
                        {upcomingAppointments.length}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <h3 className="font-medium mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(
                        new Set(
                          appointments.map(
                            (apt) => apt.category?.name || "Unknown"
                          )
                        )
                      ).map((category) => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function renderSkeletonAppointments(count: number) {
  return Array(count)
    .fill(0)
    .map((_, index) => (
      <Card key={`skeleton-${index}`} className="overflow-hidden">
        <div className="flex">
          <div className="w-2 bg-gray-300"></div>
          <div className="flex-1">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    ));
}

function renderAppointmentList(
  appointments: Appointment[],
  onClickView: (id: number) => void
) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No appointments yet</h3>
        <p className="text-muted-foreground mt-1">
          Create your first appointment to get started
        </p>
      </div>
    );
  }

  return appointments.map((appointment) => (
    <Card
      key={appointment.id}
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClickView(appointment.id)}
    >
      <div className="flex">
        {appointment.category?.color && (
          <div
            className="w-2"
            style={{ backgroundColor: appointment.category.color }}
          ></div>
        )}
        <div className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{appointment.title}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Tag className="mr-1 h-3 w-3" />
                  {appointment.category?.name || "Uncategorized"}
                </CardDescription>
              </div>
              <Badge
                variant={
                  appointment.status === "scheduled" ? "outline" : "secondary"
                }
              >
                {appointment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            {appointment.description && (
              <p className="text-sm text-muted-foreground mb-2">
                {appointment.description}
              </p>
            )}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <CalendarIcon className="mr-1 h-3 w-3" />
                {format(new Date(appointment.start_time), "MMM d, yyyy")}
              </span>
              <span className="flex items-center">
                <ClockIcon className="mr-1 h-3 w-3" />
                {format(new Date(appointment.start_time), "h:mm a")}
              </span>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  ));
}
