<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('onboarding_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('current_weight', 10, 2);
            $table->string('unit', 3);
            $table->decimal('height_cm', 5, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('onboarding_profiles');
    }
};
