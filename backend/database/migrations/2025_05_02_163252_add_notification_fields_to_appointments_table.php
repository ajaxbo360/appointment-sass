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
            $table->boolean('notifications_enabled')->default(true)->after('status');
            $table->integer('reminder_minutes')->nullable()->after('notifications_enabled');
            $table->json('notification_channels')->nullable()->after('reminder_minutes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn([
                'notifications_enabled',
                'reminder_minutes',
                'notification_channels'
            ]);
        });
    }
};
