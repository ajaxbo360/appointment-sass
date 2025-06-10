"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TabsContent, TabsList, TabsTrigger, Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useApiClient } from "@/lib/api-client";
import { Calendar, Clock, Copy, Link2, Share2 } from "lucide-react";

interface Appointment {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
}

interface ShareResponse {
  id: number;
  token: string;
  expires_at: string | null;
  url: string;
}

interface ShareAppointmentModalProps {
  appointment: Appointment;
  trigger?: React.ReactNode;
}

export default function ShareAppointmentModal({
  appointment,
  trigger,
}: ShareAppointmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("link");
  const [isLoading, setIsLoading] = useState(false);
  const [shareData, setShareData] = useState<ShareResponse | null>(null);
  const { toast } = useToast();
  const apiClient = useApiClient();

  const handleCreateShare = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(
        `appointments/${appointment.id}/share`
      );

      // Make sure we have share data from the response
      if (response && response.share) {
        // Create a properly formatted frontend URL instead of using the API URL directly
        const apiUrl = response.share.url;
        const token = response.share.token;

        // Create a frontend-friendly URL that points to our share page
        const frontendUrl = `${window.location.origin}/share/${token}`;

        // Save the modified share data with the frontend URL
        setShareData({
          ...response.share,
          url: frontendUrl,
        });

        toast({
          title: "Share link created!",
          description: "You can now share this appointment with others.",
        });
      } else {
        throw new Error("Invalid share response format");
      }
    } catch (error) {
      console.error("Error creating share link:", error);
      toast({
        title: "Error",
        description: "Failed to create share link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied!",
          description: "Link copied to clipboard",
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      }
    );
  };

  const getCalendarLinks = () => {
    if (!shareData) return { google: "", ical: "" };

    // Extract the token from the URL
    const token = shareData.token;

    // Use the backend API URL for calendar endpoints
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    return {
      google: `${apiBaseUrl}/appointments/share/${token}/google-calendar`,
      ical: `${apiBaseUrl}/appointments/share/${token}/ical`,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Appointment</DialogTitle>
          <DialogDescription>
            Share &quot;{appointment.title}&quot; publicly with anyone who has
            the link. No login required.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="link"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">
              <Link2 className="h-4 w-4 mr-2" />
              Share Link
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Add to Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="mt-4">
            {!shareData ? (
              <div className="flex flex-col items-center justify-center gap-4 py-4">
                <div className="text-center space-y-2">
                  <p className="font-medium">🌐 Public Link</p>
                  <p className="text-sm text-muted-foreground">
                    Anyone with this link can view the appointment details
                    without logging in.
                  </p>
                </div>
                <Button onClick={handleCreateShare} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Public Link"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="share-link">
                    🌐 Public Link{" "}
                    <span className="text-xs text-muted-foreground">
                      (Anyone can view)
                    </span>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="share-link"
                      value={shareData.url}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(shareData.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  💡 This link allows anyone to view appointment details without
                  signing up or logging in
                </div>
                {shareData.expires_at && (
                  <p className="text-sm text-muted-foreground">
                    This link will expire on{" "}
                    {new Date(shareData.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            {!shareData ? (
              <div className="flex flex-col items-center justify-center gap-4 py-4">
                <p>Create a public link first to enable calendar options.</p>
                <Button onClick={handleCreateShare} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Public Link"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    <span>Google Calendar</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await fetch(getCalendarLinks().google);
                        if (!response.ok)
                          throw new Error("Failed to get calendar link");
                        const data = await response.json();
                        window.open(data.google_calendar_url, "_blank");
                      } catch (error) {
                        console.error("Error opening Google Calendar:", error);
                        toast({
                          title: "Error",
                          description: "Failed to open Google Calendar",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-red-500" />
                    <span>Download iCal (.ics)</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href = getCalendarLinks().ical;
                    }}
                  >
                    Download
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-start">
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
