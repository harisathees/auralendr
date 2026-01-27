<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Make Processing Fees Global
        Schema::table('processing_fees', function (Blueprint $table) {
            // A. Drop the Foreign Key for jewel_type_id because it relies on the unique index we are about to drop
            // We'll re-add it later.
            $jewelFkName = 'processing_fees_jewel_type_id_foreign';
            $fkExists = DB::select("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'processing_fees' AND CONSTRAINT_NAME = ? LIMIT 1", [$jewelFkName]);
            if (!empty($fkExists)) {
                $table->dropForeign($jewelFkName);
            }

            // B. Drop branch_id Foreign Key
            $branchFkName = 'processing_fees_branch_id_foreign';
            $branchFkExists = DB::select("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'processing_fees' AND CONSTRAINT_NAME = ? LIMIT 1", [$branchFkName]);
            if (!empty($branchFkExists)) {
                $table->dropForeign($branchFkName);
            }

            // C. Drop the Unique Index (now safe as no FKs depend on it)
            $indexName = 'processing_fees_jewel_type_id_branch_id_unique';
            $indexExists = DB::select("SHOW INDEX FROM processing_fees WHERE Key_name = ?", [$indexName]);
            if (!empty($indexExists)) {
                $table->dropIndex($indexName); // Use dropIndex for explicit index drop
            }
            
            // D. Drop the branch_id column
            if (Schema::hasColumn('processing_fees', 'branch_id')) {
                $table->dropColumn('branch_id');
            }

            // E. Add New Unique Index on jewel_type_id
            $newIndexName = 'processing_fees_jewel_type_id_unique';
            $newIndexExists = DB::select("SHOW INDEX FROM processing_fees WHERE Key_name = ?", [$newIndexName]);
             if (empty($newIndexExists)) {
                 $table->unique('jewel_type_id');
             }

            // F. Restore the Jewel Type Foreign Key
            // We check if it exists just in case strict mode or restore logic.
            // But since we dropped it (or it didn't exist), we should be able to add it back.
            // Note: Adding a foreign key will use the new unique index for performance.
             $table->foreign('jewel_type_id')->references('id')->on('jewel_types')->cascadeOnDelete();
        });

        // 2. Create Repledge Fees Table (Global)
        if (!Schema::hasTable('repledge_fees')) {
            Schema::create('repledge_fees', function (Blueprint $table) {
                $table->id();
                $table->foreignId('jewel_type_id')->constrained()->cascadeOnDelete();
                $table->decimal('percentage', 5, 2); // e.g. 1.50
                $table->decimal('max_amount', 10, 2)->nullable(); // e.g. 500.00
                $table->timestamps();

                // Unique constraint for global config per jewel type
                $table->unique('jewel_type_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Revert Processing Fees (This is tricky as we lost data, but we restore schema)
        Schema::table('processing_fees', function (Blueprint $table) {
            $table->dropUnique(['jewel_type_id']);
            $table->foreignUlid('branch_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unique(['jewel_type_id', 'branch_id']);
        });

        // 2. Drop Repledge Fees
        Schema::dropIfExists('repledge_fees');
    }
};
