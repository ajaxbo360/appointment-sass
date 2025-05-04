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

        // Use appointment-specific reminder time or user's default
        $reminderMinutes = $this->reminder_minutes ?? $preferences->default_reminder_minutes;

        // Calculate when the notification should be sent
        $scheduledAt = (clone $this->start_time)->subMinutes($reminderMinutes);

        // Skip if the scheduled time is in the past
        if ($scheduledAt->isPast()) {
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
                'type' => 'reminder',
                'channel' => $channel,
                'scheduled_at' => $scheduledAt,
                'status' => 'pending',
                'data' => json_encode([
                    'title' => $this->title,
                    'start_time' => $this->start_time,
                    'location' => $this->location ?? '',
                ])
            ]);
        }
    }
}
