"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiClient } from "@/lib/api-client";
import { mockCategories } from "@/lib/mock-data";

interface Category {
  id: number;
  name: string;
  color?: string;
}

export default function CreateAppointment() {
  const router = useRouter();
  const { toast } = useToast();
  const apiClient = useApiClient();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    // Fetch categories when component mounts
    const fetchCategories = async () => {
      // Check if API client is ready before making the request
      if (!apiClient.isReady) {
        console.log(
          "[Categories Debug] API client not ready yet, using mock categories"
        );
        console.log("[Categories Debug] Mock data:", mockCategories);
        setCategories(mockCategories);
        return;
      }

      try {
        console.log(
          "[Categories Debug] API client ready, fetching from API endpoint"
        );
        const response = await apiClient.get("categories");
        console.log("[Categories Debug] API response:", response);

        // Ensure we're working with an array of categories
        if (response && Array.isArray(response)) {
          console.log("[Categories Debug] Using direct array response");
          setCategories(response);
        } else if (response && response.data && Array.isArray(response.data)) {
          // Some APIs wrap data in a data property
          console.log("[Categories Debug] Using nested data array response");
          setCategories(response.data);
        } else {
          console.error(
            "[Categories Debug] Unexpected categories format:",
            response
          );
          // Fallback to default categories
          console.log("[Categories Debug] Falling back to mock data");
          setCategories(mockCategories);
        }
      } catch (error) {
        console.error("[Categories Debug] Failed to fetch categories:", error);
        // Fallback to default categories if API fails
        console.log(
          "[Categories Debug] Falling back to mock data due to error"
        );
        setCategories(mockCategories);
      }
    };

    fetchCategories();
  }, [apiClient]);

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
    setIsLoading(true);

    try {
      console.log("Creating appointment with data:", formData);

      // Use the API client instead of direct fetch
      const data = await apiClient.post("appointments", formData);

      console.log("API success response:", data);

      toast({
        title: "Success!",
        description: "Appointment created successfully.",
      });

      router.push("/appointments");
    } catch (error) {
      console.error("Appointment creation error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure we always have an array of categories to work with
  const categoriesArray = Array.isArray(categories) ? categories : [];

  return (
    <div className="container max-w-md py-10">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Create Appointment</CardTitle>
            <CardDescription>
              Schedule a new appointment in your calendar.
            </CardDescription>
          </CardHeader>
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
                  {categoriesArray.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      <div className="flex items-center">
                        {category.color && (
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
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
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
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
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create Appointment"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
