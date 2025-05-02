<?php

// Use this script to test the appointment sharing functionality
// Run with: docker exec backend php test-appointment-share.php

require __DIR__ . '/vendor/autoload.php';

use App\Models\Appointment;
use App\Models\User;
use App\Services\AppointmentShareService;
use App\Services\CalendarExportService;
use Illuminate\Support\Facades\App;

// Bootstrap Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get test user and appointment
$user = User::where('email', 'test@example.com')->first();
$appointment = Appointment::where('title', 'Test Appointment for Sharing')->first();

if (!$user) {
    echo "Test user not found. Please run the TestDataSeeder first.\n";
    exit(1);
}

if (!$appointment) {
    echo "Test appointment not found. Please run the TestDataSeeder first.\n";
    exit(1);
}

echo "Test User: {$user->name} (ID: {$user->id})\n";
echo "Test Appointment: {$appointment->title} (ID: {$appointment->id})\n";
echo "Start Time: {$appointment->start_time->format('Y-m-d H:i:s')}\n";
echo "End Time: {$appointment->end_time->format('Y-m-d H:i:s')}\n\n";

// Create a share via the service
$shareService = App::make(AppointmentShareService::class);
$share = $shareService->createShare($appointment);

echo "Created share with token: {$share->token}\n";
echo "Share URL would be: " . url("/api/appointments/share/{$share->token}") . "\n\n";

// Test the view tracking
$shareService->trackView($share);
$refreshedShare = $share->fresh();
echo "Share view count after tracking: {$refreshedShare->views}\n\n";

// Generate iCalendar
$calendarService = App::make(CalendarExportService::class);
$icsContent = $calendarService->generateICalendar($appointment);
echo "iCalendar content preview: \n" . substr($icsContent, 0, 200) . "...\n\n";

// Generate Google Calendar URL
$googleCalUrl = $calendarService->generateGoogleCalendarUrl($appointment);
echo "Google Calendar URL: {$googleCalUrl}\n\n";

echo "Test completed successfully!\n";
