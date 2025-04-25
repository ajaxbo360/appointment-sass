<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Add new columns for start and end time
            $table->dateTime('start_time')->after('description')->nullable();
            $table->dateTime('end_time')->after('start_time')->nullable();

            // Drop old columns if they exist
            if (Schema::hasColumn('appointments', 'date')) {
                $table->dropColumn('date');
            }
            if (Schema::hasColumn('appointments', 'time')) {
                $table->dropColumn('time');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Add back old columns
            $table->date('date')->after('description')->nullable();
            $table->time('time')->after('date')->nullable();

            // Drop new columns
            $table->dropColumn(['start_time', 'end_time']);
        });
    }
};
