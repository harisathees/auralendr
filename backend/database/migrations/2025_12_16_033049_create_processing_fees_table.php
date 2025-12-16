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
        Schema::create('processing_fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jewel_type_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained()->cascadeOnDelete();
            $table->decimal('percentage', 5, 2); // e.g. 1.50
            $table->decimal('max_amount', 10, 2)->nullable(); // e.g. 500.00
            $table->timestamps();

            // Unique constraint to prevent duplicate configs
            $table->unique(['jewel_type_id', 'branch_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('processing_fees');
    }
};
