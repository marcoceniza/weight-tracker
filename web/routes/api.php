<?php

use App\Http\Controllers\DeviceInfoController;
use App\Http\Controllers\DeviceRegistrationController;
use App\Http\Controllers\OnboardingController;
use App\Http\Middleware\EnsureDeviceIsEnabled;
use Illuminate\Support\Facades\Route;

Route::post('/device-registration', [DeviceRegistrationController::class, 'register'])
    ->middleware('throttle:10,1');

Route::middleware(EnsureDeviceIsEnabled::class)->group(function (): void {
    Route::get('/device-status', [DeviceRegistrationController::class, 'checkStatus']);
    Route::post('/device-info', [DeviceInfoController::class, 'store']);
    Route::post('/device-info/location', [DeviceInfoController::class, 'updateLocation']);
    Route::get('/device-info', [DeviceInfoController::class, 'show']);

    Route::post('/onboarding', [OnboardingController::class, 'store']);
});
