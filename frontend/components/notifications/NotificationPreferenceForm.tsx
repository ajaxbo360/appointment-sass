"use client";

import React, { useEffect, useState } from "react";
import { useApiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

// Define the form schema with zod
const notificationPreferenceSchema = z.object({
  email_enabled: z.boolean().default(true),
  browser_enabled: z.boolean().default(true),
  default_reminder_minutes: z
    .number()
    .int()
    .min(1, { message: "Reminder time must be at least 1 minute." })
    .max(10080, { message: "Reminder time cannot exceed 1 week." })
    .default(30),
});

type NotificationPreferenceFormValues = z.infer<
  typeof notificationPreferenceSchema
>;

// Define reminder time options (in minutes)
const reminderOptions = [
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 120, label: "2 hours before" },
  { value: 360, label: "6 hours before" },
  { value: 720, label: "12 hours before" },
  { value: 1440, label: "1 day before" },
  { value: 2880, label: "2 days before" },
  { value: 10080, label: "1 week before" },
];

export default function NotificationPreferenceForm() {
  const apiClient = useApiClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<NotificationPreferenceFormValues>({
    resolver: zodResolver(notificationPreferenceSchema),
    defaultValues: {
      email_enabled: true,
      browser_enabled: true,
      default_reminder_minutes: 30,
    },
  });

  // Fetch existing preferences when component mounts
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!apiClient.isReady) return;

      setIsLoading(true);
      try {
        const response = await apiClient.get("/notification-preferences");
        if (response.data) {
          // Update form values with fetched preferences
          form.reset({
            email_enabled: response.data.email_enabled,
            browser_enabled: response.data.browser_enabled,
            default_reminder_minutes: response.data.default_reminder_minutes,
          });
        }
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
        toast({
          title: "Error",
          description: "Failed to load your notification preferences.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [apiClient, apiClient.isReady, form, toast]);

  // Handle form submission
  const onSubmit = async (values: NotificationPreferenceFormValues) => {
    if (!apiClient.isReady) return;

    setIsLoading(true);
    try {
      await apiClient.put("/notification-preferences", values);

      toast({
        title: "Success",
        description: "Your notification preferences have been updated.",
      });
      // Reset form with current values to clear dirty state after successful save
      form.reset(values, { keepValues: true });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update your notification preferences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Configure how and when you'd like to be notified about your
          appointments.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="email_enabled"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  NotificationPreferenceFormValues,
                  "email_enabled"
                >;
              }) => (
                <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4 gap-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Email Notifications
                    </FormLabel>
                    <FormDescription>
                      Receive appointment reminders and updates via email.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="browser_enabled"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  NotificationPreferenceFormValues,
                  "browser_enabled"
                >;
              }) => (
                <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4 gap-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Browser Notifications
                    </FormLabel>
                    <FormDescription>
                      Receive push notifications in your browser when you're
                      online.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="default_reminder_minutes"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  NotificationPreferenceFormValues,
                  "default_reminder_minutes"
                >;
              }) => (
                <FormItem>
                  <FormLabel>Default Reminder Time</FormLabel>
                  <FormDescription>
                    When should we remind you about your upcoming appointments
                    by default?
                  </FormDescription>
                  <Select
                    disabled={isLoading}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a default reminder time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reminderOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value.toString()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isDirty}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Preferences
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
