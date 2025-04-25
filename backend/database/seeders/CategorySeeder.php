<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define common categories with colors that match the frontend
        $categories = [
            [
                'name' => 'Work',
                'color' => '#4f46e5', // indigo
                'description' => 'Work-related appointments and meetings'
            ],
            [
                'name' => 'Personal',
                'color' => '#10b981', // emerald
                'description' => 'Personal appointments and errands'
            ],
            [
                'name' => 'Medical',
                'color' => '#ef4444', // red
                'description' => 'Doctor visits and health-related appointments'
            ],
            [
                'name' => 'Education',
                'color' => '#f59e0b', // amber
                'description' => 'Classes, courses, and learning opportunities'
            ],
            [
                'name' => 'Social',
                'color' => '#8b5cf6', // violet
                'description' => 'Meetups with friends and social events'
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name']],
                [
                    'color' => $category['color'],
                    'description' => $category['description']
                ]
            );
        }
    }
}
