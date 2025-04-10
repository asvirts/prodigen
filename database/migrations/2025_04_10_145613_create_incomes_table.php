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
        Schema::create('incomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('description');
            $table->decimal('amount', 8, 2); // Example precision, adjust as needed
            $table->date('date');
            $table->enum('recurrence_frequency', ['none', 'monthly', 'yearly'])->default('none');
            $table->date('recurrence_end_date')->nullable();
            $table->date('next_recurrence_date')->nullable()->index(); // Index for performance when querying for due recurrences
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incomes');
    }
};
