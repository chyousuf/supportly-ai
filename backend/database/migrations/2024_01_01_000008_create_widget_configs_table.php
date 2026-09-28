<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('widget_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('assistant_name')->default('AI Assistant');
            $table->string('welcome_message')->nullable();
            $table->string('brand_color')->default('#4f46e5');
            $table->enum('position', ['right', 'left'])->default('right');
            $table->string('logo_url')->nullable();
            $table->json('suggested_questions')->nullable();
            $table->json('business_hours')->nullable();
            $table->timestamps();
            
            $table->unique('business_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('widget_configs');
    }
};
