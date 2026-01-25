<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('loans', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('pledge_id')->constrained()->cascadeOnDelete();
            $table->string('loan_no')->nullable()->unique();
            $table->date('date')->nullable();
            $table->decimal('amount', 15, 2);
            $table->decimal('interest_percentage', 5, 2)->default(0);
            $table->integer('validity_months')->default(0);
            $table->date('due_date')->nullable();
            $table->string('payment_method')->nullable();
            $table->decimal('processing_fee', 12, 2)->nullable();
            $table->decimal('estimated_amount', 15, 2)->nullable();
            $table->boolean('include_processing_fee')->default(false);
            $table->boolean('interest_taken')->default(false);
            $table->decimal('amount_to_be_given', 15,2)->nullable();
            $table->decimal('metal_rate', 10, 2)->nullable();
            $table->enum('status', ['active','closed'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('loans');
    }
};
