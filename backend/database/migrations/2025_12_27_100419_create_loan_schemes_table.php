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
        Schema::create('loan_schemes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('interest_rate', 5, 2); // e.g., 2.00, 1.50
            $table->string('interest_period')->default('monthly'); // monthly, daily, yearly
            $table->string('calculation_type')->default('simple'); // simple, compound, day_basis
            $table->json('scheme_config')->nullable(); // For extra rules like tiers, grace periods
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loan_schemes');
    }
};
