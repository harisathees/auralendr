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
        if (!Schema::hasTable('money_sources')) {
            Schema::create('money_sources', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('type')->default('cash'); // cash, bank, wallet
                $table->decimal('balance', 15, 2)->default(0);
                $table->text('description')->nullable();
                $table->boolean('is_outbound')->default(true);
                $table->boolean('is_inbound')->default(true);
                $table->boolean('is_active')->default(true);
                $table->boolean('show_balance')->default(true);
                $table->timestamps();
            });
        } else {
            // If table exists, ensure columns exist
            Schema::table('money_sources', function (Blueprint $table) {
                if (!Schema::hasColumn('money_sources', 'show_balance')) {
                    $table->boolean('show_balance')->default(true);
                }
                if (!Schema::hasColumn('money_sources', 'is_active')) {
                    $table->boolean('is_active')->default(true);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('money_sources');
    }
};
