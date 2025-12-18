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
        // 1. Rename tables
        Schema::rename('repledge_banks', 'repledge_sources');
        Schema::rename('branch_repledge_banks', 'branch_repledge_sources');

        // 2. Rename columns in pivot table
        Schema::table('branch_repledge_sources', function (Blueprint $table) {
            $table->renameColumn('repledge_bank_id', 'repledge_source_id');
        });

        // 3. Rename column in repledges table
        Schema::table('repledges', function (Blueprint $table) {
            $table->renameColumn('bank_id', 'repledge_source_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Rename columns back
        Schema::table('repledges', function (Blueprint $table) {
            $table->renameColumn('repledge_source_id', 'bank_id');
        });

        Schema::table('branch_repledge_sources', function (Blueprint $table) {
            $table->renameColumn('repledge_source_id', 'repledge_bank_id');
        });

        // 2. Rename tables back
        Schema::rename('branch_repledge_sources', 'branch_repledge_banks');
        Schema::rename('repledge_sources', 'repledge_banks');
    }
};
