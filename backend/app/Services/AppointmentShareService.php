<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\AppointmentShare;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AppointmentShareService
{
    /**
     * Create a new appointment share token
     *
     * @param Appointment $appointment
     * @param int|null $expiresInDays Number of days before the token expires (null for never)
     * @return AppointmentShare
     */
    public function createShare(Appointment $appointment, ?int $expiresInDays = 30): AppointmentShare
    {
        return AppointmentShare::create([
            'appointment_id' => $appointment->id,
            'token' => $this->generateUniqueToken(),
            'expires_at' => $expiresInDays ? Carbon::now()->addDays($expiresInDays) : null,
            'views' => 0,
        ]);
    }

    /**
     * Find a valid appointment share by token
     *
     * @param string $token
     * @return AppointmentShare|null
     */
    public function findValidShareByToken(string $token): ?AppointmentShare
    {
        $share = AppointmentShare::where('token', $token)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', Carbon::now());
            })
            ->first();

        return $share;
    }

    /**
     * Track a view for a specific share
     *
     * @param AppointmentShare $share
     * @return void
     */
    public function trackView(AppointmentShare $share): void
    {
        $share->increment('views');
    }

    /**
     * Revoke a share by setting its expiration date to now
     *
     * @param AppointmentShare $share
     * @return bool
     */
    public function revokeShare(AppointmentShare $share): bool
    {
        return $share->update([
            'expires_at' => Carbon::now(),
        ]);
    }

    /**
     * Generate a unique token for sharing
     *
     * @return string
     */
    protected function generateUniqueToken(): string
    {
        $token = Str::random(32);

        // Ensure token uniqueness
        while (AppointmentShare::where('token', $token)->exists()) {
            $token = Str::random(32);
        }

        return $token;
    }
}
