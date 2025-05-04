<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AppointmentNotificationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that notifications are created when an appointment is created
     */
    public function test_notifications_are_created_when_appointment_is_created()
    {
        // Mock Mail facade to prevent actual emails from being sent
        Mail::fake();

        // Create a user
        $user = User::factory()->create();

        // Create an appointment with notifications enabled
        $appointment = Appointment::create([
            'user_id' => $user->id,
            'title' => 'Test Appointment',
            'description' => 'This is a test appointment',
            'start_time' => Carbon::now()->addHours(2),
            'end_time' => Carbon::now()->addHours(3),
            'status' => 'scheduled',
            'notifications_enabled' => true,
            'reminder_minutes' => 30,
        ]);

        // Generate notifications for this appointment
        $appointment->generateNotifications();

        // Check that a notification was created
        $this->assertDatabaseHas('notifications', [
            'appointment_id' => $appointment->id,
            'user_id' => $user->id,
            'type' => 'reminder',
            'status' => 'pending',
        ]);

        // Verify notification was scheduled for the correct time
        $notification = Notification::where('appointment_id', $appointment->id)->first();
        $expectedTime = Carbon::parse($appointment->start_time)->subMinutes($appointment->reminder_minutes);

        // Allow 1 second tolerance for processing time
        $this->assertTrue(
            $notification->scheduled_at->timestamp >= $expectedTime->timestamp - 1 &&
                $notification->scheduled_at->timestamp <= $expectedTime->timestamp + 1,
            "Notification scheduled_at time does not match expected time"
        );
    }

    /**
     * Test that notification service processes due notifications
     */
    public function test_notification_service_processes_due_notifications()
    {
        // Mock Mail facade
        Mail::fake();

        // Create a user
        $user = User::factory()->create();

        // Create an appointment
        $appointment = Appointment::create([
            'user_id' => $user->id,
            'title' => 'Test Appointment',
            'start_time' => Carbon::now()->addHour(),
            'end_time' => Carbon::now()->addHours(2),
            'status' => 'scheduled',
            'notifications_enabled' => true,
        ]);

        // Create a notification that is due now
        $notification = Notification::create([
            'user_id' => $user->id,
            'appointment_id' => $appointment->id,
            'type' => 'reminder',
            'channel' => 'email',
            'status' => 'pending',
            'scheduled_at' => Carbon::now()->subMinutes(5), // Due 5 minutes ago
            'data' => json_encode([
                'title' => $appointment->title,
                'start_time' => $appointment->start_time,
            ]),
        ]);

        // Process due notifications
        $notificationService = new NotificationService();
        $processed = $notificationService->processDueNotifications();

        // Assert that one notification was processed
        $this->assertEquals(1, $processed);

        // Verify notification status was updated
        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'status' => 'sent',
        ]);

        // Verify the notification was sent
        $updatedNotification = Notification::find($notification->id);
        $this->assertNotNull($updatedNotification->sent_at);
    }

    /**
     * Test that notification preferences are respected
     */
    public function test_notification_preferences_are_respected()
    {
        // Mock Mail facade
        Mail::fake();

        // Create a user
        $user = User::factory()->create();

        // Set user preferences to disable email notifications
        $preferences = $user->getOrCreateNotificationPreference();
        $preferences->update([
            'email_enabled' => false,
            'browser_enabled' => true,
        ]);

        // Create an appointment without specific notification channels
        $appointment = Appointment::create([
            'user_id' => $user->id,
            'title' => 'Test Appointment',
            'start_time' => Carbon::now()->addHour(),
            'end_time' => Carbon::now()->addHours(2),
            'status' => 'scheduled',
            'notifications_enabled' => true,
        ]);

        // Generate notifications
        $appointment->generateNotifications();

        // Verify that no email notifications were created
        $this->assertDatabaseMissing('notifications', [
            'appointment_id' => $appointment->id,
            'channel' => 'email',
        ]);

        // Verify that browser notifications were created
        $this->assertDatabaseHas('notifications', [
            'appointment_id' => $appointment->id,
            'channel' => 'browser',
        ]);
    }
}
