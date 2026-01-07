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
        if (!Schema::hasTable('receipt_templates')) {
            Schema::create('receipt_templates', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->json('papersize'); // {width: 210, height: 297, unit: 'mm'}
                $table->string('orientation')->default('portrait'); // portrait, landscape
                $table->json('margin')->nullable(); // {top: 10, right: 10, bottom: 10, left: 10, unit: 'mm'}
                $table->integer('version')->default(1);
                $table->json('layout_config')->nullable(); // For field positions, visibility, styles
                $table->string('status')->default('active');
                $table->timestamps();
                $table->softDeletes();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipt_templates');
    }
};
