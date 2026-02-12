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
        Schema::table('jewels', function (Blueprint $table) {
            $table->decimal('weight_reduction', 8, 2)->nullable()->after('stone_weight');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jewels', function (Blueprint $table) {
            $table->dropColumn('weight_reduction');
        });
    }
};
