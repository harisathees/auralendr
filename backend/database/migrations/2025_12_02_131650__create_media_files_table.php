<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('media_files', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('customer_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignUlid('pledge_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignUlid('loan_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('jewel_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('type');         // image / audio / video / pdf
            $table->string('category');     // id_proof, customer_image, jewel_image, etc.
            $table->string('file_path');
            $table->string('mime_type')->nullable();
            $table->bigInteger('size')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('media_files');
    }
};
