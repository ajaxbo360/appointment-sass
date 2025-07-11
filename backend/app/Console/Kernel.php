<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * These schedules are run in the console.
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('inspire')->hourly();
        $schedule->command('app:send-due-notifications')->everyMinute();
        $schedule->command('app:update-appointment-statuses')->hourly();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }

    protected $commands = [
        \App\Console\Commands\SendDueNotifications::class,
        \App\Console\Commands\UpdateAppointmentStatuses::class,
    ];
}
