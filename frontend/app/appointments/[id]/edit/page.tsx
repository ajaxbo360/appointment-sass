"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiClient } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { mockCategories } from "@/lib/mock-data";

interface Category {
  id: number;
  name: string;
}

interface Appointment {
  id: number;
  title: string;
  description: string;
  category_id: number;
  start_time: string;
  end_time?: string;
  status: string;
}

export default function EditAppointment() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const api = useApiClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    date: "",
    time: "",
    status: "scheduled",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!params || !params.id) {
          router.push("/dashboard");
          return null;
        }

        // Check if API client is ready
        if (!api.isReady) {
          console.log(
            "[Categories Debug] API client not ready yet, cannot fetch appointment data"
          );
          toast({
            title: "Error",
            description:
              "API service is not available. Please try again later.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const id = params.id;

        // Fetch appointment data
        const appointmentResponse = await api.get(`/appointments/${id}`);
        const appointment = appointmentResponse.data;

        // Fetch categories
        let categoryData = [];
        try {
          console.log("[Categories Debug] Fetching categories from API");
          const categoriesResponse = await api.get("/categories");
          console.log(
            "[Categories Debug] Categories API response:",
            categoriesResponse
          );

          if (categoriesResponse && categoriesResponse.data) {
            if (Array.isArray(categoriesResponse.data)) {
              console.log(
                "[Categories Debug] Using direct array from data property"
              );
              categoryData = categoriesResponse.data;
            } else if (
              categoriesResponse.data.data &&
              Array.isArray(categoriesResponse.data.data)
            ) {
              console.log("[Categories Debug] Using nested data.data array");
              categoryData = categoriesResponse.data.data;
            } else {
              console.log(
                "[Categories Debug] Response format unexpected, using empty array"
              );
              categoryData = [];
            }
          }
        } catch (error) {
          console.error(
            "[Categories Debug] Failed to fetch categories:",
            error
          );
          console.log(
            "[Categories Debug] Using mock categories instead:",
            mockCategories
          );
          categoryData = mockCategories;
        }

        console.log(
          "[Categories Debug] Final category data being used:",
          categoryData
        );
        setCategories(categoryData);

        // Parse the appointment date from start_time
        let parsedDate = null;

        console.log("[Date Debug] Appointment data:", appointment);

        if (appointment.start_time) {
          try {
            const scheduledDate = new Date(appointment.start_time);
            // Check if the date is valid
            if (!isNaN(scheduledDate.getTime())) {
              parsedDate = scheduledDate;
              setDate(scheduledDate);
              console.log(
                "[Date Debug] Successfully parsed date:",
                scheduledDate
              );
            } else {
              console.error(
                "[Date Debug] Invalid date:",
                appointment.start_time
              );
            }
          } catch (error) {
            console.error(
              "[Date Debug] Error parsing start_time:",
              error,
              appointment.start_time
            );
          }
        } else {
          console.log(
            "[Date Debug] No start_time field found in appointment data"
          );
        }

        // Set form data with safe date handling
        setFormData({
          title: appointment.title,
          description: appointment.description || "",
          category_id: appointment.category_id.toString(),
          date: parsedDate ? format(parsedDate, "yyyy-MM-dd") : "",
          time: parsedDate ? format(parsedDate, "HH:mm") : "",
          status: appointment.status || "scheduled",
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Failed to load appointment data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params && params.id) {
      fetchData();
    }
  }, [params, api, toast, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      setFormData((prev) => ({ ...prev, date: format(date, "yyyy-MM-dd") }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!params || !params.id) {
        throw new Error("Appointment ID is missing");
      }

      await api.put(`/appointments/${params.id}`, formData);

      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });

      router.push(`/appointments/${params.id}`);
    } catch (error) {
      console.error("Failed to update appointment:", error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 w-fit"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <CardTitle>Edit Appointment</CardTitle>
          <CardDescription>
            Update the details of your appointment
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                onValueChange={(value) =>
                  handleSelectChange("category_id", value)
                }
                value={formData.category_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) => handleSelectChange("status", value)}
                value={formData.status || "scheduled"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Scheduled
                    </div>
                  </SelectItem>
                  <SelectItem value="confirmed">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Confirmed
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Cancelled
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date && !isNaN(date.getTime()) ? (
                      format(date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
