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
        // Instead of creating a new table, add columns to the existing one
        Schema::table('appointments', function (Blueprint $table) {

            // Add any other custom columns here
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the added columns
        Schema::table('appointments', function (Blueprint $table) {});
    }
};
