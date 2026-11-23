<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Link an onboarding profile to the device it was created from.
     */
    public function up(): void
    {
        Schema::table('onboarding_profiles', function (Blueprint $table): void {
            $table->foreignId('device_id')
                ->nullable()
                ->after('id')
                ->constrained('device_infos')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('onboarding_profiles', function (Blueprint $table): void {
            $table->dropForeign(['device_id']);
            $table->dropColumn('device_id');
        });
    }
};
