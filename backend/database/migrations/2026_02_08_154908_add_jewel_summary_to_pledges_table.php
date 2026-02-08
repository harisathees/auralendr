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
        Schema::table('pledges', function (Blueprint $table) {
            $table->decimal('total_weight', 8, 2)->nullable()->after('status');
            $table->integer('total_pieces')->nullable()->after('total_weight');
            $table->decimal('total_stone_weight', 8, 2)->nullable()->after('total_pieces');
            $table->decimal('total_weight_reduction', 8, 2)->nullable()->after('total_stone_weight');
            $table->decimal('total_net_weight', 8, 2)->nullable()->after('total_weight_reduction');
            $table->text('jewel_types_summary')->nullable()->after('total_net_weight');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pledges', function (Blueprint $table) {
            $table->dropColumn([
                'total_weight',
                'total_pieces',
                'total_stone_weight',
                'total_weight_reduction',
                'total_net_weight',
                'jewel_types_summary'
            ]);
        });
    }
};
