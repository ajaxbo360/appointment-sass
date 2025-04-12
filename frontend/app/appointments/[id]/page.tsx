"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useApiClient } from "@/lib/api-client";
import { format } from "date-fns";
import { Trash2, Edit, ArrowLeft, Calendar, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Appointment {
  id: number;
  title: string;
  description: string;
  category: {
    id: number;
    name: string;
    color: string;
  };
  scheduled_at: string;
  created_at: string;
  updated_at: string;
}

export default function AppointmentDetail() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const api = useApiClient();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await api.get(`/appointments/${params.id}`);
        setAppointment(response.data);
      } catch (error) {
        console.error("Failed to fetch appointment:", error);
        toast({
          title: "Error",
          description: "Failed to load appointment details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchAppointment();
    }
  }, [params.id, api, toast]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/appointments/${params.id}`);
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h2 className="text-2xl font-bold">Appointment not found</h2>
        <p className="mt-2 text-muted-foreground">
          The appointment you're looking for doesn't exist or you don't have
          permission to view it.
        </p>
        <Button className="mt-4" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const appointmentDate = new Date(appointment.scheduled_at);

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="mb-2"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <CardTitle className="text-2xl">{appointment.title}</CardTitle>
              <CardDescription>
                <Badge
                  style={{
                    backgroundColor: appointment.category.color || "#888888",
                  }}
                  className="mt-2"
                >
                  {appointment.category.name}
                </Badge>
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push(`/appointments/${params.id}/edit`)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this appointment? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Description</h3>
            <p className="mt-2 text-muted-foreground">
              {appointment.description || "No description provided"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(appointmentDate, "PPPP")}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground">
                  {format(appointmentDate, "p")}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Created: {format(new Date(appointment.created_at), "PPp")}
              {appointment.updated_at !== appointment.created_at && (
                <>
                  <br />
                  Last updated:{" "}
                  {format(new Date(appointment.updated_at), "PPp")}
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
