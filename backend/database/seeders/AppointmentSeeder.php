<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Category;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AppointmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->info('No users found. Creating a test user...');

            // Create a test user if none exists
            $user = User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
            ]);

            $users = collect([$user]);
        }

        // Get all categories (or create default ones if none exist)
        $categories = Category::all();

        if ($categories->isEmpty()) {
            $this->command->info('No categories found. Run the CategorySeeder first.');
            return;
        }

        $this->command->info('Creating appointments for ' . $users->count() . ' users...');

        // Create different types of appointments for each user
        foreach ($users as $user) {
            // Today's appointments
            $this->createAppointment($user, $categories->random(), 'Team Standup Meeting', 'Daily team sync to discuss progress and blockers', Carbon::today()->setHour(9)->setMinute(0), 'scheduled');
            $this->createAppointment($user, $categories->random(), 'Lunch with Client', 'Discuss project requirements and timeline', Carbon::today()->setHour(12)->setMinute(30), 'scheduled');

            // Tomorrow's appointments
            $this->createAppointment($user, $categories->random(), 'Dental Checkup', 'Regular dental cleaning and examination', Carbon::tomorrow()->setHour(10)->setMinute(0), 'scheduled');
            $this->createAppointment($user, $categories->random(), 'Project Review', 'End of sprint project review with stakeholders', Carbon::tomorrow()->setHour(14)->setMinute(0), 'scheduled');

            // Next week appointments
            $this->createAppointment($user, $categories->random(), 'Coffee with Mentor', 'Career advice and guidance discussion', Carbon::today()->addDays(5)->setHour(11)->setMinute(0), 'scheduled');

            // Past appointments (completed and cancelled)
            $this->createAppointment($user, $categories->random(), 'Code Review Session', 'Review PRs and discuss code quality', Carbon::today()->subDays(2)->setHour(15)->setMinute(0), 'completed');
            $this->createAppointment($user, $categories->random(), 'Team Building Event', 'Office social event with games and activities', Carbon::today()->subDays(5)->setHour(16)->setMinute(0), 'cancelled');

            // Future appointments (next month)
            $this->createAppointment($user, $categories->random(), 'Annual Performance Review', 'Yearly performance evaluation and goal setting', Carbon::today()->addMonth()->setHour(13)->setMinute(0), 'scheduled');
            $this->createAppointment($user, $categories->random(), 'Tech Conference', 'Industry conference on latest technologies', Carbon::today()->addMonth()->addDays(5)->setHour(9)->setMinute(0), 'scheduled');
        }

        $this->command->info('Created appointments successfully!');
    }

    /**
     * Create an appointment with the given details
     */
    private function createAppointment(User $user, Category $category, string $title, string $description, Carbon $startTime, string $status): void
    {
        $endTime = (clone $startTime)->addHour();

        Appointment::create([
            'user_id' => $user->id,
            'title' => $title,
            'description' => $description,
            'category_id' => $category->id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => $status,
        ]);
    }
}
