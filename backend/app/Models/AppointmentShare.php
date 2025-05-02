<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppointmentShare extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'token',
        'expires_at',
        'views',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'views' => 'integer',
    ];

    /**
     * Get the appointment that this share belongs to.
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
