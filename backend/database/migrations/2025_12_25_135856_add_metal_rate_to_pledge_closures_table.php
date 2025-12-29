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
        Schema::table('pledge_closures', function (Blueprint $table) {
            $table->decimal('metal_rate', 15, 2)->nullable()->after('interest_rate_snapshot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pledge_closures', function (Blueprint $table) {
            $table->dropColumn('metal_rate');
        });
    }
};
