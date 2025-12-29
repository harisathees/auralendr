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
        // Add 'closed' to the enum by converting to VARCHAR to be safe/flexible
        DB::statement("ALTER TABLE pledges MODIFY COLUMN status VARCHAR(50) DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert ensuring 'closed' data is handled or just revert definition if safe
        // Warning: Changing back might causing truncation if 'closed' data exists
        DB::statement("ALTER TABLE pledges MODIFY COLUMN status ENUM('active', 'released', 'cancelled') DEFAULT 'active'");
    }
};
