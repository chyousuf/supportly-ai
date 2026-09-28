<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_sources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['faq', 'url', 'document']);
            $table->string('title');
            $table->longText('content')->nullable();
            $table->string('url')->nullable();
            $table->string('file_path')->nullable();
            $table->enum('status', ['active', 'processing', 'error'])->default('active');
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['business_id', 'type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_sources');
    }
};
