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
        Schema::create('repledge_sources', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('branch')->nullable();
            $table->decimal('default_interest', 5, 2)->default(0);
            $table->integer('validity_months')->default(0);
            $table->decimal('post_validity_interest', 5, 2)->default(0);
            $table->string('payment_method')->nullable();
            $table->timestamps();
        });

        Schema::create('repledges', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('branch_id')->constrained()->onDelete('cascade');
            $table->foreignUlid('loan_id')->nullable()->constrained()->onDelete('set null'); // Optional link to original loan
            $table->string('loan_no'); // Keep string in case loan is deleted or external
            $table->string('re_no');
            $table->foreignUlid('repledge_source_id')->constrained('repledge_sources')->onDelete('cascade');
            $table->string('status')->default('active');
            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('processing_fee', 15, 2)->default(0);
            $table->decimal('interest_percent', 5, 2)->default(0);
            $table->integer('validity_period')->default(0); // in months
            $table->decimal('after_interest_percent', 5, 2)->default(0);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('due_date')->nullable();
            $table->string('payment_method')->nullable();
            $table->decimal('gross_weight', 10, 3)->default(0);
            $table->decimal('net_weight', 10, 3)->default(0);
            $table->decimal('stone_weight', 10, 3)->default(0);
            $table->timestamps();
        });

        Schema::create('branch_repledge_sources', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('branch_id')->constrained()->onDelete('cascade');
            $table->foreignUlid('repledge_source_id')->constrained('repledge_sources')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['branch_id', 'repledge_source_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branch_repledge_sources');
        Schema::dropIfExists('repledges');
        Schema::dropIfExists('repledge_sources');
    }
};
