<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use Illuminate\Console\Command;

class TestStatusUpdate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-status-update';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test appointment status updates';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $appointment = Appointment::first();

        if (!$appointment) {
            $this->error('No appointments found.');
            return 1;
        }

        $this->info("Current appointment: {$appointment->title}");
        $this->info("Current status: {$appointment->status}");

        // Test updating status
        $appointment->update(['status' => 'confirmed']);
        $appointment->refresh();

        $this->info("Updated status: {$appointment->status}");

        if ($appointment->status === 'confirmed') {
            $this->info('✅ Status update working correctly!');
        } else {
            $this->error('❌ Status update failed!');
        }

        return 0;
    }
}
