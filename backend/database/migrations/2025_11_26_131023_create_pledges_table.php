<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('pledges', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('branch_id')->constrained()->restrictOnDelete();
            $table->foreignUlid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUlid('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('active');
            $table->string('reference_no')->nullable()->unique();
            $table->timestamps();
            $table->index(['branch_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('pledges');
    }
};
