<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendDueNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-due-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process and send due appointment notifications';

    /**
     * Execute the console command.
     */
    public function handle(NotificationService $notificationService)
    {
        $this->info('Starting to process due notifications...');

        try {
            $count = $notificationService->processDueNotifications();
            $this->info("Successfully processed {$count} notifications");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            Log::error('Error processing notifications: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            $this->error('Failed to process notifications: ' . $e->getMessage());

            return Command::FAILURE;
        }
    }
}
