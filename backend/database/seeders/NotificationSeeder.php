<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating test notifications...');

        // Find a test user, or get the first user
        $user = User::where('email', 'test@example.com')->first() ?? User::first();

        if (!$user) {
            $this->command->error('No users found to create notifications for!');
            return;
        }

        // Create a new appointment with a notification due soon
        $appointment = Appointment::create([
            'user_id' => $user->id,
            'title' => 'Test Notification Appointment',
            'description' => 'This appointment will trigger a notification',
            'start_time' => Carbon::now()->addMinutes(10),
            'end_time' => Carbon::now()->addMinutes(40),
            'status' => 'scheduled',
            'notifications_enabled' => true,
            'reminder_minutes' => 5,
        ]);

        $this->command->info("Created appointment with ID: {$appointment->id}");

        // Calculate when the notification should be sent (5 minutes before start time)
        $scheduledAt = Carbon::parse($appointment->start_time)->subMinutes($appointment->reminder_minutes);

        // Create an email notification due immediately (1 second ago)
        $emailNotification = Notification::create([
            'user_id' => $user->id,
            'appointment_id' => $appointment->id,
            'type' => 'reminder',
            'channel' => 'email',
            'status' => 'pending',
            'scheduled_at' => Carbon::now()->subSecond(),
            'data' => json_encode([
                'title' => $appointment->title,
                'start_time' => $appointment->start_time,
                'location' => 'Test Location',
            ]),
        ]);

        $this->command->info("Created email notification scheduled for: " . $emailNotification->scheduled_at->format('Y-m-d H:i:s') . " (Due immediately)");

        // Create a browser notification due immediately (1 second ago)
        $browserNotification = Notification::create([
            'user_id' => $user->id,
            'appointment_id' => $appointment->id,
            'type' => 'reminder',
            'channel' => 'browser',
            'status' => 'pending',
            'scheduled_at' => Carbon::now()->subSecond(),
            'data' => json_encode([
                'title' => $appointment->title,
                'start_time' => $appointment->start_time,
                'location' => 'Test Location',
            ]),
        ]);

        $this->command->info("Created browser notification scheduled for: " . $browserNotification->scheduled_at->format('Y-m-d H:i:s') . " (Due immediately)");

        // Also create a notification for an existing appointment
        $existingAppointment = Appointment::where('id', '!=', $appointment->id)->first();

        if ($existingAppointment) {
            $notification = Notification::create([
                'user_id' => $existingAppointment->user_id,
                'appointment_id' => $existingAppointment->id,
                'type' => 'reminder',
                'channel' => 'email',
                'status' => 'pending',
                'scheduled_at' => Carbon::now()->subSecond(),
                'data' => json_encode([
                    'title' => $existingAppointment->title,
                    'start_time' => $existingAppointment->start_time,
                ]),
            ]);

            $this->command->info("Created notification for existing appointment: {$existingAppointment->title} (Due immediately)");
        }

        $this->command->info('Test notifications created successfully!');
    }
}
