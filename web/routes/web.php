<?php

use App\Http\Controllers\Admin\AuthenticatedSessionController;
use App\Http\Controllers\Admin\DeviceController;
use App\Http\Controllers\Admin\RegisteredUserController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['message' => 'Weight Tracker Admin API']));

Route::get('/health', function () {
    DB::select('select 1');

    return response('ok', 200)->header('Content-Type', 'text/plain');
});

Route::get('/admin/register', [RegisteredUserController::class, 'create'])->name('register');
Route::post('/admin/register', [RegisteredUserController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('register.store');
Route::get('/ping', fn () => response()->json(['message' => 'pong']));

Route::get('/admin/login', [AuthenticatedSessionController::class, 'create'])->name('login');
Route::post('/admin/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('login.store');

Route::post('/admin/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::middleware(['auth', 'can:manage-devices'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/dashboard', fn () => redirect()->route('admin.devices.index'))->name('dashboard');
    Route::get('/devices', [DeviceController::class, 'index'])->name('devices.index');
    Route::get('/devices/{device}/user', [DeviceController::class, 'user'])->name('devices.user');
    Route::post('/devices/{device}/disable', [DeviceController::class, 'disable'])->name('devices.disable');
    Route::post('/devices/{device}/enable', [DeviceController::class, 'enable'])->name('devices.enable');
});
