<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('color')->nullable();
                $table->timestamps();
            });

            // Insert default categories
            DB::table('categories')->insert([
                ['name' => 'Work', 'color' => '#4285F4', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Personal', 'color' => '#EA4335', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Health', 'color' => '#34A853', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Education', 'color' => '#FBBC05', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
