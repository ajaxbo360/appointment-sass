<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'email_enabled',
        'browser_enabled',
        'sms_enabled',
        'default_reminder_minutes',
        'notification_settings',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_enabled' => 'boolean',
        'browser_enabled' => 'boolean',
        'sms_enabled' => 'boolean',
        'default_reminder_minutes' => 'integer',
        'notification_settings' => 'json',
    ];

    /**
     * Get the user that owns the notification preferences.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all enabled channels as an array.
     */
    public function getEnabledChannels(): array
    {
        $channels = [];

        if ($this->email_enabled) {
            $channels[] = 'email';
        }

        if ($this->browser_enabled) {
            $channels[] = 'browser';
        }

        if ($this->sms_enabled) {
            $channels[] = 'sms';
        }

        return $channels;
    }

    /**
     * Check if a specific channel is enabled.
     */
    public function isChannelEnabled(string $channel): bool
    {
        return in_array($channel, $this->getEnabledChannels());
    }
}
