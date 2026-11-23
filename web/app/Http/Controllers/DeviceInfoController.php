<?php

namespace App\Http\Controllers;

use App\Http\Middleware\EnsureDeviceIsEnabled;
use App\Models\DeviceInfo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceInfoController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'device_name' => ['nullable', 'string', 'max:255'],
            'device_brand' => ['nullable', 'string', 'max:100'],
            'device_model' => ['nullable', 'string', 'max:100'],
            'device_id' => ['nullable', 'string', 'max:255'],
            'os_version' => ['nullable', 'string', 'max:100'],
            'app_version' => ['nullable', 'string', 'max:100'],
        ]);

        $deviceInfo = $this->deviceInfo($request);
        $deviceInfo->update($validated);

        return response()->json([
            'success' => true,
            'data' => $deviceInfo->fresh(),
        ]);
    }

    public function updateLocation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'location_name' => ['nullable', 'string', 'max:255'],
        ]);

        $deviceInfo = $this->deviceInfo($request);
        $deviceInfo->update([
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'location_name' => $validated['location_name'] ?? null,
            'location_captured_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $deviceInfo->fresh(),
        ]);
    }

    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->deviceInfo($request),
        ]);
    }

    private function deviceInfo(Request $request): DeviceInfo
    {
        $deviceInfo = $request->attributes->get(EnsureDeviceIsEnabled::DEVICE_ATTRIBUTE);

        abort_unless($deviceInfo instanceof DeviceInfo, 500, 'Device access middleware is missing.');

        return $deviceInfo;
    }
}
