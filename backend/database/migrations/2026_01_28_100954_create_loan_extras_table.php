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
        Schema::create('loan_extras', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('loan_id');
            $table->decimal('extra_amount', 15, 2);
            $table->date('disbursement_date');
            $table->string('payment_method');
            $table->text('notes')->nullable();
            $table->ulid('created_by');
            $table->timestamps();

            $table->foreign('loan_id')->references('id')->on('loans')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loan_extras');
    }
};
