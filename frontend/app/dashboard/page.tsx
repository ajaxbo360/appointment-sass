"use client";

import { useEffect, useState } from "react";
import { useApiClient } from "@/lib/api-client";
import ProtectedRoute from "@/components/auth/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import AuthDebug from "@/components/auth-debug";

interface Appointment {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: string;
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApiClient();
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        console.log("Fetching appointments...");
        const data = await api.get("/appointments");
        console.log("Appointments data:", data);
        setAppointments(data.data || []);
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
  }, [api, toast]);

  return (
    <ProtectedRoute>
      <AuthDebug />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={() => router.push("/appointments/create")}>
            Create Appointment
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-full mt-2"></div>
                  </CardContent>
                </Card>
              ))
          ) : appointments.length > 0 ? (
            appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <CardTitle>{appointment.title}</CardTitle>
                  <CardDescription>
                    {new Date(appointment.start_time).toLocaleDateString()} at{" "}
                    {new Date(appointment.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {appointment.description}
                  </p>
                  <div className="mt-4 flex justify-end">
                    <Link href={`/appointments/${appointment.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium">No appointments yet</h3>
              <p className="text-muted-foreground mt-1">
                Create your first appointment to get started
              </p>
              <Link href="/appointments/create" className="mt-4 inline-block">
                <Button>Create Appointment</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
