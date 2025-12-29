<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('staff_time_restrictions', function (Blueprint $table) {
            $table->id();
            $table->string('key');
            $table->text('value')->nullable();
            $table->string('group')->nullable()->index();
            $table->unsignedBigInteger('branch_id')->nullable()->index();
            $table->timestamps();

            // Unique key per branch. Global settings have NULL branch_id.
            $table->unique(['key', 'branch_id']);
            
            // Optional: Foreign key if you want strict referential integrity
            // $table->foreign('branch_id')->references('id')->on('branches')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
