<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Console\Command;

class UpdateAppointmentStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-appointment-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically update appointment statuses based on their timing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();

        // Mark appointments as completed if they ended more than 1 hour ago
        $completedCount = Appointment::whereIn('status', ['scheduled', 'confirmed'])
            ->where('end_time', '<', $now->subHour())
            ->update(['status' => 'completed']);

        // Mark appointments as started/in-progress if they are currently happening
        // (This is optional - you might want to keep them as confirmed/scheduled until manually marked complete)

        $this->info("Updated {$completedCount} appointments to completed status.");

        // You can add more automatic status updates here:
        // - Mark as "confirmed" when reminder notifications are sent
        // - Mark as "no-show" if appointment time passed without any interaction
        // - etc.

        return 0;
    }
}
