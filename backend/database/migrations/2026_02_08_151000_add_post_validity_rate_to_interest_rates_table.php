<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('interest_rates', function (Blueprint $table) {
            $table->decimal('post_validity_rate', 5, 2)->nullable()->after('rate');
        });
    }

    public function down(): void
    {
        Schema::table('interest_rates', function (Blueprint $table) {
            $table->dropColumn('post_validity_rate');
        });
    }
};
