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
        Schema::create('customer_loan_tracks', function (Blueprint $table) {
            $table->ulid('id')->primary();
            // Foreign keys
            $table->foreignUlid('loan_id')->constrained('loans')->cascadeOnDelete();
            $table->foreignUlid('branch_id')->constrained('branches')->cascadeOnDelete();
            
            // Tracking fields
            $table->string('tracking_code')->unique()->index();
            
            $table->timestamps();
        });

        Schema::create('customer_loan_status_logs', function (Blueprint $table) {
            $table->id();
            
            $table->foreignUlid('loan_id')->constrained('loans')->cascadeOnDelete();
            
            $table->string('status_code')->index(); // e.g., CREATED, ACTIVE, CLOSED
            $table->text('message')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_loan_status_logs');
        Schema::dropIfExists('customer_loan_tracks');
    }
};
