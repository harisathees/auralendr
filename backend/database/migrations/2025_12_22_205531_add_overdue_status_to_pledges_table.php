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
            // Only run raw SQL on MySQL/MariaDB drivers as syntax is specific
            // SQLite/Postgres would require different handling (or are not primary targets here)
            if (in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'])) {
                // Get table name with prefix to be safe
                $table = DB::getTablePrefix() . 'pledges';
                
                // Expand ENUM to include 'overdue'. Safe to run multiple times.
                // We wrap the table name in backticks for safety.
                DB::statement("ALTER TABLE `$table` MODIFY COLUMN status ENUM('active', 'released', 'cancelled', 'overdue') NOT NULL DEFAULT 'active'");
            }
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
        // Query builder handles prefixes automatically
        DB::table('pledges')->where('status', 'overdue')->update(['status' => 'active']);

        // Revert ENUM definition
        if (in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'])) {
            $table = DB::getTablePrefix() . 'pledges';
            DB::statement("ALTER TABLE `$table` MODIFY COLUMN status ENUM('active', 'released', 'cancelled') NOT NULL DEFAULT 'active'");
        }
    }
};
