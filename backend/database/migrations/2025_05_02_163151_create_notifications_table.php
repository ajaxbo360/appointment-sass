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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->string('type'); // 'reminder', 'update', 'cancellation', etc.
            $table->string('channel'); // 'email', 'browser', etc.
            $table->timestamp('scheduled_at'); // When this notification should be sent
            $table->timestamp('sent_at')->nullable(); // When it was actually sent
            $table->string('status')->default('pending'); // pending, sent, failed, read
            $table->text('error')->nullable(); // For tracking delivery failures
            $table->json('data')->nullable(); // Additional payload data
            $table->timestamps();

            // Add index for efficient querying
            $table->index(['status', 'scheduled_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
