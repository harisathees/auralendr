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
        Schema::create('cash_reconciliations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('branch_id')->constrained('branches');
            $table->foreignUlid('user_id')->constrained('users'); // Staff who reconciled
            $table->date('date');

            // Financials
            $table->decimal('system_expected_amount', 15, 2);
            $table->decimal('physical_amount', 15, 2);
            $table->decimal('difference', 15, 2);

            // Denominations Breakdown (stored as JSON)
            // Example: {"500": 10, "200": 5, ...}
            $table->json('denominations')->nullable();

            $table->text('notes')->nullable();
            $table->string('status')->default('pending'); // pending, verified, closed

            $table->timestamps();

            // Indexes for faster querying
            $table->index(['branch_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_reconciliations');
    }
};
