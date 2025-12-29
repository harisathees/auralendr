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
        DB::statement("ALTER TABLE pledges MODIFY COLUMN status ENUM('active', 'released', 'cancelled', 'overdue') NOT NULL DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE pledges MODIFY COLUMN status ENUM('active', 'released', 'cancelled') NOT NULL DEFAULT 'active'");
    }
};
