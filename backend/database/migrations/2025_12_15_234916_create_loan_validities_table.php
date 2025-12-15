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
        Schema::create('loan_validities', function (Blueprint $table) {
            $table->id();
            $table->integer('months'); // e.g. 3, 6, 12
            $table->string('label')->nullable(); // e.g. "3 Months"
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loan_validities');
    }
};
