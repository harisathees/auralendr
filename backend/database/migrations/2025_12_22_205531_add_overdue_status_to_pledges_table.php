<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Safety: Prevent crash if table does not exist (e.g. erratic migration order)
        if (!Schema::hasTable('pledges')) {
            return;
        }

        // Idempotency: Modify if exists, Add if missing
        if (Schema::hasColumn('pledges', 'status')) {
            // Expand ENUM to include 'overdue'. Safe to run multiple times.
            DB::statement("ALTER TABLE pledges MODIFY COLUMN status ENUM('active', 'released', 'cancelled', 'overdue') NOT NULL DEFAULT 'active'");
        } else {
            Schema::table('pledges', function (Blueprint $table) {
                $table->enum('status', ['active', 'released', 'cancelled', 'overdue'])
                      ->default('active');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('pledges') || !Schema::hasColumn('pledges', 'status')) {
            return;
        }

        // Safety: Migrate 'overdue' records to a safe default before removing the option
        DB::table('pledges')->where('status', 'overdue')->update(['status' => 'active']);

        // Revert ENUM definition
        DB::statement("ALTER TABLE pledges MODIFY COLUMN status ENUM('active', 'released', 'cancelled') NOT NULL DEFAULT 'active'");
    }
};
