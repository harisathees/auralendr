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
        // 1. Add balance_amount to loans table
        Schema::table('loans', function (Blueprint $table) {
            $table->decimal('balance_amount', 15, 2)->nullable()->after('amount');
        });

        // Initialize balance_amount with original amount for existing loans
        DB::table('loans')->update(['balance_amount' => DB::raw('amount')]);

        // 2. Create loan_payments table
        Schema::create('loan_payments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('loan_id')->constrained()->cascadeOnDelete();
            
            $table->decimal('total_paid_amount', 15, 2);
            $table->decimal('principal_amount', 15, 2)->default(0);
            $table->decimal('interest_amount', 15, 2)->default(0);
            
            $table->date('payment_date');
            $table->string('payment_method')->nullable(); 
            $table->text('notes')->nullable();
            
            $table->foreignUlid('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loan_payments');

        Schema::table('loans', function (Blueprint $table) {
            $table->dropColumn('balance_amount');
        });
    }
};
