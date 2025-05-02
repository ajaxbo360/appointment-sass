<?php

namespace App\Services;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Str;

class CalendarExportService
{
    /**
     * Generate an iCalendar (.ics) file content for an appointment
     *
     * @param Appointment $appointment
     * @return string
     */
    public function generateICalendar(Appointment $appointment): string
    {
        $description = strip_tags($appointment->description ?? '');
        $uid = Str::uuid()->toString();
        $created = $appointment->created_at->format('Ymd\THis\Z');

        $startDateTime = $appointment->start_time;
        $endDateTime = $appointment->end_time ?? (clone $startDateTime)->addHour();

        $startDate = $startDateTime->format('Ymd');
        $startTime = $startDateTime->format('His');
        $endTime = $endDateTime->format('His');

        $ics = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Appointment App//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'UID:' . $uid,
            'SUMMARY:' . $this->escapeString($appointment->title),
            'DESCRIPTION:' . $this->escapeString($description),
            'DTSTAMP:' . $created,
            'DTSTART:' . $startDate . 'T' . $startTime,
            'DTEND:' . $startDate . 'T' . $endTime,
            'STATUS:CONFIRMED',
            'SEQUENCE:0',
            'TRANSP:OPAQUE',
            'END:VEVENT',
            'END:VCALENDAR',
        ];

        return implode("\r\n", $ics);
    }

    /**
     * Generate a Google Calendar URL for an appointment
     *
     * @param Appointment $appointment
     * @return string
     */
    public function generateGoogleCalendarUrl(Appointment $appointment): string
    {
        $startDateTime = $appointment->start_time->format('Ymd\THis\Z');
        $endDateTime = ($appointment->end_time ?? $appointment->start_time->addHour())->format('Ymd\THis\Z');

        $params = [
            'action' => 'TEMPLATE',
            'text' => $appointment->title,
            'details' => strip_tags($appointment->description ?? ''),
            'dates' => $startDateTime . '/' . $endDateTime,
        ];

        return 'https://calendar.google.com/calendar/render?' . http_build_query($params);
    }

    /**
     * Format a date and time for Google Calendar URL
     *
     * @param Carbon $date
     * @param Carbon|null $time
     * @return string
     */
    protected function formatDateTimeForGoogle(Carbon $date, ?Carbon $time = null): string
    {
        if ($time) {
            $dateTime = Carbon::create(
                $date->year,
                $date->month,
                $date->day,
                $time->hour,
                $time->minute,
                $time->second
            );
        } else {
            $dateTime = $date;
        }

        return $dateTime->format('Ymd\THis\Z');
    }

    /**
     * Escape special characters in iCalendar strings
     *
     * @param string $text
     * @return string
     */
    protected function escapeString(string $text): string
    {
        $text = str_replace('\\', '\\\\', $text);
        $text = str_replace(',', '\,', $text);
        $text = str_replace(';', '\;', $text);
        $text = str_replace("\n", '\n', $text);
        $text = str_replace("\r", '', $text);

        return $text;
    }
}
