<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('interest_rates', function (Blueprint $table) {
            $table->decimal('estimation_percentage', 5, 2)->after('rate')->nullable(); // Making it nullable initially for existing records
        });
    }

    public function down()
    {
        Schema::table('interest_rates', function (Blueprint $table) {
            $table->dropColumn('estimation_percentage');
        });
    }
};
