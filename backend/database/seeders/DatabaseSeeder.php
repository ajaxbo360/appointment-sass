<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run TestDataSeeder for appointment sharing feature
        $this->call([
            TestDataSeeder::class,
        ]);

        // Create categories first
        $categories = [
            ['name' => 'Work', 'color' => '#4f46e5', 'description' => 'Work-related appointments and meetings'],
            ['name' => 'Personal', 'color' => '#10b981', 'description' => 'Personal appointments and errands'],
            ['name' => 'Medical', 'color' => '#ef4444', 'description' => 'Doctor visits and health-related appointments'],
            ['name' => 'Education', 'color' => '#f59e0b', 'description' => 'Classes, courses, and learning opportunities'],
            ['name' => 'Social', 'color' => '#8b5cf6', 'description' => 'Meetups with friends and social events'],
            ['name' => 'Business', 'color' => '#FF33F6', 'description' => 'Business meetings and conferences'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }

        // Find or create the user
        $user = User::firstOrCreate(
            ['email' => 'ajakak.2016@gmail.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'google_id' => 'temp_' . time(), // Temporary Google ID
                'avatar' => 'https://ui-avatars.com/api/?name=Test+User', // Default avatar
            ]
        );

        $this->command->info("Creating appointments for user: {$user->email}");

        // Sample appointments data with a mix of past, present, and future appointments
        $appointments = [
            // Today's appointments
            [
                'title' => 'Team Standup Meeting',
                'description' => 'Daily team sync to discuss progress and blockers',
                'start_time' => Carbon::today()->setHour(9)->setMinute(0),
                'end_time' => Carbon::today()->setHour(10)->setMinute(0),
                'status' => 'scheduled',
                'category_id' => Category::where('name', 'Work')->first()->id,
            ],
            [
                'title' => 'Client Presentation',
                'description' => 'Present project progress to the client',
                'start_time' => Carbon::today()->setHour(14)->setMinute(0),
                'end_time' => Carbon::today()->setHour(15)->setMinute(0),
                'status' => 'scheduled',
                'category_id' => Category::where('name', 'Business')->first()->id,
            ],
            [
                'title' => 'Lunch Break with Team',
                'description' => 'Team lunch and casual discussion',
                'start_time' => Carbon::today()->setHour(12)->setMinute(0),
                'end_time' => Carbon::today()->setHour(13)->setMinute(0),
                'status' => 'scheduled',
                'category_id' => Category::where('name', 'Social')->first()->id,
            ],
            // Yesterday's appointments (Past)
            [
                'title' => 'Dental Checkup',
                'description' => 'Regular dental cleaning and examination',
                'start_time' => Carbon::yesterday()->setHour(10)->setMinute(0),
                'end_time' => Carbon::yesterday()->setHour(11)->setMinute(0),
                'status' => 'completed',
                'category_id' => Category::where('name', 'Medical')->first()->id,
            ],
            [
                'title' => 'Team Building Event',
                'description' => 'Monthly team building activity',
                'start_time' => Carbon::yesterday()->setHour(15)->setMinute(0),
                'end_time' => Carbon::yesterday()->setHour(17)->setMinute(0),
                'status' => 'cancelled',
                'category_id' => Category::where('name', 'Social')->first()->id,
            ],
            [
                'title' => 'Code Review',
                'description' => 'Review pull requests and provide feedback',
                'start_time' => Carbon::yesterday()->setHour(13)->setMinute(0),
                'end_time' => Carbon::yesterday()->setHour(14)->setMinute(0),
                'status' => 'completed',
                'category_id' => Category::where('name', 'Work')->first()->id,
            ],
            // Tomorrow's appointments
            [
                'title' => 'Project Planning',
                'description' => 'Plan next sprint and assign tasks',
                'start_time' => Carbon::tomorrow()->setHour(11)->setMinute(0),
                'end_time' => Carbon::tomorrow()->setHour(12)->setMinute(0),
                'status' => 'scheduled',
                'category_id' => Category::where('name', 'Work')->first()->id,
            ],
            [
                'title' => 'Gym Session',
                'description' => 'Personal training session',
                'start_time' => Carbon::tomorrow()->setHour(7)->setMinute(0),
                'end_time' => Carbon::tomorrow()->setHour(8)->setMinute(0),
                'status' => 'scheduled',
                'category_id' => Category::where('name', 'Personal')->first()->id,
            ],
            [
                'title' => 'Team Retrospective',
                'description' => 'Monthly team retrospective meeting',
                'start_time' => Carbon::tomorrow()->setHour(15)->setMinute(0),
                'end_time' => Carbon::tomorrow()->setHour(16)->setMinute(0),
                'status' => 'scheduled',
                'category_id' => Category::where('name', 'Work')->first()->id,
            ],
            // Next week appointments
            [
                'title' => 'Online Course Session',
                'description' => 'Advanced TypeScript Programming Course',
                'start_time' => Carbon::today()->addDays(5)->setHour(13)->setMinute(0),
                'end_time' => Carbon::today()->addDays(5)->setHour(14)->setMinute(30),
                'status' => 'scheduled',
                'category_id' => Category::where('name', 'Education')->first()->id,
            ],
            [
                'title' => 'Quarterly Planning',
                'description' => 'Q3 Planning and Strategy Meeting',
                'start_time' => Carbon::today()->addDays(6)->setHour(10)->setMinute(0),
                'end_time' => Carbon::today()->addDays(6)->setHour(12)->setMinute(0),
                'status' => 'scheduled',
                'category_id' => Category::where('name', 'Business')->first()->id,
            ],
            [
                'title' => 'Family Dinner',
                'description' => 'Monthly family gathering',
                'start_time' => Carbon::today()->addDays(7)->setHour(18)->setMinute(0),
                'end_time' => Carbon::today()->addDays(7)->setHour(20)->setMinute(0),
                'status' => 'scheduled',
                'category_id' => Category::where('name', 'Personal')->first()->id,
            ],
            // Next month appointments
            [
                'title' => 'Annual Review',
                'description' => 'Yearly performance evaluation meeting',
                'start_time' => Carbon::today()->addMonth()->setHour(10)->setMinute(0),
                'end_time' => Carbon::today()->addMonth()->setHour(11)->setMinute(0),
                'status' => 'scheduled',
                'category_id' => Category::where('name', 'Work')->first()->id,
            ],
            [
                'title' => 'Tech Conference',
                'description' => 'Annual Developer Conference',
                'start_time' => Carbon::today()->addMonth()->addDays(2)->setHour(9)->setMinute(0),
                'end_time' => Carbon::today()->addMonth()->addDays(2)->setHour(18)->setMinute(0),
                'status' => 'scheduled',
                'category_id' => Category::where('name', 'Education')->first()->id,
            ],
            [
                'title' => 'Medical Checkup',
                'description' => 'Annual health examination',
                'start_time' => Carbon::today()->addMonth()->addDays(5)->setHour(14)->setMinute(0),
                'end_time' => Carbon::today()->addMonth()->addDays(5)->setHour(15)->setMinute(30),
                'status' => 'scheduled',
                'category_id' => Category::where('name', 'Medical')->first()->id,
            ],
            // Two months ahead
            [
                'title' => 'Company Retreat',
                'description' => 'Annual company team building retreat',
                'start_time' => Carbon::today()->addMonths(2)->setHour(9)->setMinute(0),
                'end_time' => Carbon::today()->addMonths(2)->addDays(2)->setHour(17)->setMinute(0),
                'status' => 'scheduled',
                'category_id' => Category::where('name', 'Work')->first()->id,
            ],
        ];

        // Create appointments for the user
        foreach ($appointments as $appointment) {
            $user->appointments()->updateOrCreate(
                [
                    'title' => $appointment['title'],
                    'start_time' => $appointment['start_time']
                ],
                $appointment
            );
        }

        $this->command->info('Appointments created successfully!');

        $this->command->info('Created appointments for the following categories:');
        foreach ($categories as $category) {
            $count = Appointment::where('category_id', Category::where('name', $category['name'])->first()->id)
                ->where('user_id', $user->id)
                ->count();
            $this->command->info("- {$category['name']}: {$count} appointments");
        }
    }
}
