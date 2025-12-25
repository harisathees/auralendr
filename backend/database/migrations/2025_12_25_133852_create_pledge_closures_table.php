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
        Schema::create('pledge_closures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pledge_id')->constrained()->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users');

            // Closure Details
            $table->date('closed_date');
            $table->string('calculation_method');

            // Financials
            $table->decimal('balance_amount', 15, 2)->default(0)->comment('Pending amount to be paid later');
            $table->decimal('reduction_amount', 15, 2)->default(0)->comment('Manual reduction given');

            // Calculation Results Snapshot
            $table->decimal('calculated_interest', 15, 2);
            $table->decimal('interest_reduction', 15, 2)->default(0);
            $table->decimal('additional_reduction', 15, 2)->default(0);
            $table->decimal('total_payable', 15, 2);

            // Meta Snapshots
            $table->string('duration_str')->nullable(); // e.g. "5 Months"
            $table->string('interest_rate_snapshot')->nullable(); // e.g. "2% per month"

            $table->string('status')->default('closed'); // Snapshot of status

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pledge_closures');
    }
};
