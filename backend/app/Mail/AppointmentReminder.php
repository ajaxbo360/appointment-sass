<?php

namespace App\Mail;

use App\Models\Appointment;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class AppointmentReminder extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * The appointment instance.
     */
    public $appointment;

    /**
     * The notification instance.
     */
    public $notification;

    /**
     * Create a new message instance.
     */
    public function __construct(Appointment $appointment, Notification $notification)
    {
        $this->appointment = $appointment;
        $this->notification = $notification;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reminder: ' . $this->appointment->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-reminder',
            with: [
                'appointment' => $this->appointment,
                'notification' => $this->notification,
                'user' => $this->appointment->user,
                'startTime' => Carbon::parse($this->appointment->start_time),
                'endTime' => Carbon::parse($this->appointment->end_time),
                'title' => $this->appointment->title,
                'description' => $this->appointment->description,
                'category' => $this->appointment->category ? $this->appointment->category->name : 'Uncategorized',
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        // TODO: Add ICS calendar attachment
        return [];
    }
}
