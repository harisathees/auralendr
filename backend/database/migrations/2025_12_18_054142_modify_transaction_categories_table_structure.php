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
        Schema::table('transaction_categories', function (Blueprint $table) {
            $table->dropColumn('type');
            $table->boolean('is_credit')->default(true); // Can receive / Income
            $table->boolean('is_debit')->default(true);  // Can send / Expense
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaction_categories', function (Blueprint $table) {
            $table->dropColumn(['is_credit', 'is_debit']);
            $table->string('type')->default('both');
        });
    }
};
