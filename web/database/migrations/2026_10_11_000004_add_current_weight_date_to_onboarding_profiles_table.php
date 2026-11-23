<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('onboarding_profiles', function (Blueprint $table) {
            $table->date('current_weight_date')->nullable()->after('current_weight');
        });

        DB::table('onboarding_profiles')
            ->whereNull('current_weight_date')
            ->update(['current_weight_date' => DB::raw('DATE(created_at)')]);
    }

    public function down(): void
    {
        Schema::table('onboarding_profiles', function (Blueprint $table) {
            $table->dropColumn('current_weight_date');
        });
    }
};
