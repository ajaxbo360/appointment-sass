"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiClient } from "@/lib/api-client";
import ProtectedRoute from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { mockAppointments, type Appointment } from "@/lib/mock-data";
import { format } from "date-fns";
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  FilterIcon,
  SearchIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const api = useApiClient();
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        // Try to fetch from API first
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

  const handleAppointmentClick = (id: number) => {
    router.push(`/appointments/${id}`);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.description &&
        appointment.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "" || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">
              Manage all your scheduled appointments
            </p>
          </div>
          <Button onClick={() => router.push("/appointments/create")}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search appointments..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/3 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleAppointmentClick(appointment.id)}
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
                          <CardTitle className="text-lg">
                            {appointment.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {appointment.category?.name || "Uncategorized"}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            appointment.status === "scheduled"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      {appointment.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                          {appointment.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {format(
                            new Date(appointment.start_time),
                            "MMM d, yyyy"
                          )}
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
            ))
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-lg font-medium">No appointments found</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  {searchTerm || statusFilter
                    ? "Try adjusting your search or filters"
                    : "Create your first appointment to get started"}
                </p>
                {!searchTerm && !statusFilter && (
                  <Button onClick={() => router.push("/appointments/create")}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Appointment
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
