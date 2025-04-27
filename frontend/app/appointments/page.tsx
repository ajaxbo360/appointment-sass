"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
  Eye,
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
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const api = useApiClient();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Auth check - redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoadingAppointments(true);
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
        setIsLoadingAppointments(false);
      }
    };

    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [api, isAuthenticated]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage all your scheduled appointments
          </p>
        </div>
        <div className="relative">
          <Button onClick={() => router.push("/appointments/create")} disabled>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
          <Badge className="absolute -top-3 -right-3 bg-amber-500 hover:bg-amber-500/90">
            Coming Soon
          </Badge>
        </div>
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
        {isLoadingAppointments ? (
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
              className="overflow-hidden hover:shadow-md transition-shadow"
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
                  <CardContent className="pb-2">
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
                  <CardFooter className="border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAppointmentClick(appointment.id);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5 mr-2" />
                      View Details
                    </Button>
                  </CardFooter>
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
                <div className="relative inline-block">
                  <Button
                    onClick={() => router.push("/appointments/create")}
                    disabled
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Appointment
                  </Button>
                  <Badge className="absolute -top-3 -right-3 bg-amber-500 hover:bg-amber-500/90">
                    Coming Soon
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
