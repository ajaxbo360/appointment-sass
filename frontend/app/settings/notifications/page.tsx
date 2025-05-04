"use client";

import React from "react";
import NotificationPreferenceForm from "@/components/notifications/NotificationPreferenceForm";

export default function NotificationSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
      <NotificationPreferenceForm />
    </div>
  );
}
