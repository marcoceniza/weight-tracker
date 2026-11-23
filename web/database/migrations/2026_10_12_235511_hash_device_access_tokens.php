<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('device_infos', function (Blueprint $table) {
            $table->string('device_token_hash', 64)->nullable()->unique()->after('device_token');
        });

        DB::table('device_infos')
            ->whereNotNull('device_token')
            ->orderBy('id')
            ->chunkById(100, function ($devices): void {
                foreach ($devices as $device) {
                    DB::table('device_infos')
                        ->where('id', $device->id)
                        ->update(['device_token_hash' => hash('sha256', $device->device_token)]);
                }
            });

        Schema::table('device_infos', function (Blueprint $table) {
            $table->dropUnique(['device_token']);
            $table->dropColumn('device_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Hashed access tokens cannot be restored; existing app tokens must be reissued.
        Schema::table('device_infos', function (Blueprint $table) {
            $table->string('device_token', 64)->nullable()->after('installation_token_hash');
            $table->dropUnique(['device_token_hash']);
            $table->dropColumn('device_token_hash');
        });
    }
};
