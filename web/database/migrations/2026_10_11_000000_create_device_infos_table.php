<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDeviceInfosTable extends Migration
{
    public function up()
    {
        Schema::create('device_infos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('device_name')->nullable();
            $table->string('device_brand')->nullable();
            $table->string('device_model')->nullable();
            $table->string('device_id')->nullable();
            $table->string('os_version')->nullable();
            $table->string('app_version')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('device_infos');
    }
}
