<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pending_approvals', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('pledge_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('requested_by')->constrained('users');
            $table->foreignUlid('reviewed_by')->nullable()->constrained('users');
            $table->decimal('loan_amount', 15, 2);
            $table->decimal('estimated_amount', 15, 2);
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pending_approvals');
    }
};
