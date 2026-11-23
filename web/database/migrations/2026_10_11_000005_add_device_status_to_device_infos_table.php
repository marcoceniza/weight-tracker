<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add device status, installation token hash, device token, and last check-in.
     */
    public function up(): void
    {
        Schema::table('device_infos', function (Blueprint $table) {
            $table->boolean('enabled')->default(true)->after('device_id');
            $table->string('installation_token_hash', 64)->nullable()->unique()->index()->after('enabled');
            $table->string('device_token', 40)->nullable()->unique()->after('installation_token_hash');
            $table->timestamp('last_check_in_at')->nullable()->after('device_token');
        });
    }

    public function down(): void
    {
        Schema::table('device_infos', function (Blueprint $table) {
            $table->dropColumn(['enabled', 'installation_token_hash', 'device_token', 'last_check_in_at']);
        });
    }
};
