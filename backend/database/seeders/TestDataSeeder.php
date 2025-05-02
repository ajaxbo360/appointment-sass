<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test user
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
            ]
        );

        // Create a test category
        $category = Category::firstOrCreate(
            ['name' => 'Test Category'],
            ['description' => 'Test category description']
        );

        // Create a test appointment for sharing
        $tomorrow = Carbon::tomorrow();
        $startTime = Carbon::tomorrow()->setHour(14)->setMinute(0);
        $endTime = Carbon::tomorrow()->setHour(15)->setMinute(0);

        $appointment = Appointment::firstOrCreate(
            [
                'title' => 'Test Appointment for Sharing',
                'user_id' => $user->id,
            ],
            [
                'description' => 'This is a test appointment to check sharing functionality',
                'category_id' => $category->id,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'status' => 'confirmed',
            ]
        );

        $this->command->info('Test data created successfully!');
        $this->command->info("Test User ID: {$user->id}");
        $this->command->info("Test Category ID: {$category->id}");
        $this->command->info("Test Appointment ID: {$appointment->id}");
    }
}
