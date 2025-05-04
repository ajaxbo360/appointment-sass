<?php

// Test script for notifications system
use Illuminate\Support\Facades\Hash;

// 1. Create a test user
$user = \App\Models\User::firstOrCreate(
    ['email' => 'test.notifications@example.com'],
    [
        'name' => 'Test Notification User',
        'password' => Hash::make('password'),
    ]
);
echo "Test user created with ID: {$user->id}\n";

// 2. Create notification preferences for the user
$preferences = $user->getOrCreateNotificationPreference();
$preferences->update([
    'email_enabled' => true,
    'browser_enabled' => true,
    'default_reminder_minutes' => 30,
]);
echo "Notification preferences created for user\n";

// 3. Create a test appointment set for 30 minutes from now
$startTime = now()->addMinutes(30);
$endTime = $startTime->copy()->addHour();

$appointment = \App\Models\Appointment::create([
    'user_id' => $user->id,
    'title' => 'Test Notification Appointment',
    'description' => 'This is a test appointment to verify notifications',
    'start_time' => $startTime,
    'end_time' => $endTime,
    'status' => 'scheduled',
    'notifications_enabled' => true,
    'reminder_minutes' => 5, // 5 minutes before appointment
]);
echo "Test appointment created with ID: {$appointment->id}\n";
echo "Appointment scheduled for: {$startTime->format('Y-m-d H:i:s')}\n";

// 4. Generate notifications for this appointment
$notificationService = new \App\Services\NotificationService();
$notificationService->createNotificationsForAppointment($appointment);

// 5. Verify notification records were created
$notifications = \App\Models\Notification::where('appointment_id', $appointment->id)->get();
echo "Number of notifications created: {$notifications->count()}\n";

if ($notifications->count() > 0) {
    echo "Notification details:\n";
    foreach ($notifications as $notification) {
        echo "ID: {$notification->id}, Channel: {$notification->channel}, Status: {$notification->status}\n";
        echo "Scheduled for: {$notification->scheduled_at->format('Y-m-d H:i:s')}\n";
    }
}

// 6. For immediate testing, manually set a notification to be due right now
if ($notifications->count() > 0) {
    $notification = $notifications->first();
    $notification->scheduled_at = now()->subMinute();
    $notification->save();
    echo "Updated notification {$notification->id} to be due now\n";

    // 7. Manually process due notifications
    $count = $notificationService->processDueNotifications();
    echo "Processed {$count} notifications\n";

    // 8. Verify the notification status was updated
    $notification->refresh();
    echo "Notification status is now: {$notification->status}\n";

    if ($notification->status === 'sent') {
        echo "SUCCESS: Notification was sent successfully!\n";
    } else {
        echo "WARNING: Notification was not sent as expected. Check logs for details.\n";
    }
}

echo "\nTest completed.\n";
