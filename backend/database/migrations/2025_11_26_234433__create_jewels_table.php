<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('jewels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pledge_id')->constrained()->cascadeOnDelete();
            $table->string('jewel_type');
            $table->string('quality')->nullable();
            $table->text('description')->nullable();
            $table->integer('pieces')->default(1);
            $table->decimal('weight', 12, 3)->nullable();
            $table->decimal('stone_weight', 12, 3)->nullable();
            $table->decimal('net_weight', 12, 3)->nullable();
            $table->text('faults')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('jewels');
    }
};
