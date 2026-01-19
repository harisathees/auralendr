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
        Schema::create('repledge_closures', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('repledge_id')->constrained()->onDelete('cascade');
            $table->foreignUlid('created_by')->constrained('users');
            $table->date('closed_date');

            // Financials
            $table->decimal('principal_amount', 12, 2); // Amount we borrowed originally (snapshot)
            $table->decimal('interest_paid', 12, 2)->default(0);
            $table->decimal('total_paid_amount', 12, 2); // Total amount paid to bank

            $table->string('remarks')->nullable();
            $table->string('status')->default('closed'); // redundant but good for history

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('repledge_closures');
    }
};
