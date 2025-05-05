<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category_id',
        'user_id',
        'scheduled_at',
        'start_time',
        'end_time',
        'status',
        'notifications_enabled',
        'reminder_minutes',
        'notification_channels',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'notifications_enabled' => 'boolean',
        'reminder_minutes' => 'integer',
        'notification_channels' => 'json',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the shares for this appointment.
     */
    public function shares(): HasMany
    {
        return $this->hasMany(AppointmentShare::class);
    }

    /**
     * Get the notifications for this appointment.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Generate notifications for this appointment.
     */
    public function generateNotifications(): void
    {
        // Don't generate notifications if they're disabled
        if (!$this->notifications_enabled) {
            return;
        }

        // Delete any pending notifications for this appointment
        $this->notifications()->where('status', 'pending')->delete();

        // Get the user's notification preferences
        $preferences = $this->user->getOrCreateNotificationPreference();

        // Calculate time until appointment starts (in minutes)
        $minutesUntilStart = now()->diffInMinutes($this->start_time, false);

        // Set notification type
        $notificationType = 'reminder';

        // Determine if this appointment is starting soon
        $isStartingSoon = false;

        // Set scheduled time for the notification
        $scheduledAt = now(); // Default to immediate notification

        // Get the reminder minutes (from appointment or default)
        $reminderMinutes = $this->reminder_minutes ?? $preferences->default_reminder_minutes;

        // Case 1: Appointment is in the future with enough time for the normal reminder
        if ($minutesUntilStart > $reminderMinutes) {
            // Standard reminder - schedule for reminder_minutes before start
            $scheduledAt = (clone $this->start_time)->subMinutes($reminderMinutes);
            $notificationType = 'reminder';
        }
        // Case 2: Appointment is in the future but happening soon (less than reminder_minutes)
        else if ($minutesUntilStart > 0) {
            // It's an imminent appointment - notify immediately
            $scheduledAt = now();
            $notificationType = 'starting_soon';
            $isStartingSoon = true;
        }
        // Case 3: Appointment has already started (minutesUntilStart <= 0)
        else {
            // Don't create notifications for appointments that already started
            return;
        }

        // Get notification channels (from appointment or user preferences)
        $channels = json_decode($this->notification_channels ?? '[]') ?: [];

        if (empty($channels)) {
            if ($preferences->email_enabled) $channels[] = 'email';
            if ($preferences->browser_enabled) $channels[] = 'browser';
        }

        // Create a notification record for each channel
        foreach ($channels as $channel) {
            $this->notifications()->create([
                'user_id' => $this->user_id,
                'type' => $notificationType,
                'channel' => $channel,
                'scheduled_at' => $scheduledAt,
                'status' => 'pending',
                'data' => json_encode([
                    'title' => $this->title,
                    'start_time' => $this->start_time,
                    'location' => $this->location ?? '',
                    'is_starting_soon' => $isStartingSoon
                ])
            ]);
        }
    }
}
