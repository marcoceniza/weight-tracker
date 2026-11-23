<?php

namespace App\Http\Controllers;

use App\Http\Middleware\EnsureDeviceIsEnabled;
use App\Models\DeviceInfo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class DeviceRegistrationController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'installation_token' => ['required', 'string', 'min:32', 'max:255'],
            'device_name' => ['nullable', 'string', 'max:255'],
            'device_brand' => ['nullable', 'string', 'max:100'],
            'device_model' => ['nullable', 'string', 'max:100'],
            'device_id' => ['nullable', 'string', 'max:255'],
            'os_version' => ['nullable', 'string', 'max:100'],
            'app_version' => ['nullable', 'string', 'max:100'],
        ]);

        $installationTokenHash = hash('sha256', $validated['installation_token']);
        $deviceInfo = DeviceInfo::query()
            ->where('installation_token_hash', $installationTokenHash)
            ->first();

        if ($deviceInfo?->isDisabled()) {
            return response()->json([
                'success' => false,
                'error' => 'This device has been disabled.',
            ], 403);
        }

        $isNewDevice = $deviceInfo === null;
        $deviceInfo ??= new DeviceInfo;
        $deviceToken = Str::random(64);

        $deviceInfo->fill(Arr::only($validated, [
            'device_name',
            'device_brand',
            'device_model',
            'device_id',
            'os_version',
            'app_version',
        ]));
        $deviceAttributes = [
            'installation_token_hash' => $installationTokenHash,
            'device_token_hash' => hash('sha256', $deviceToken),
            'last_check_in_at' => now(),
        ];

        if ($isNewDevice) {
            $deviceAttributes['enabled'] = true;
        }

        $deviceInfo->forceFill($deviceAttributes)->save();

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $deviceToken,
                'enabled' => true,
                'device' => $deviceInfo->only([
                    'id',
                    'device_name',
                    'device_brand',
                    'device_model',
                    'device_id',
                    'os_version',
                    'app_version',
                    'enabled',
                ]),
                'last_check_in_at' => $deviceInfo->last_check_in_at,
            ],
        ], $isNewDevice ? 201 : 200);
    }

    public function checkStatus(Request $request): JsonResponse
    {
        $deviceInfo = $request->attributes->get(EnsureDeviceIsEnabled::DEVICE_ATTRIBUTE);

        abort_unless($deviceInfo instanceof DeviceInfo, 500, 'Device access middleware is missing.');

        return response()->json([
            'success' => true,
            'data' => [
                'enabled' => $deviceInfo->isEnabled(),
                'last_check_in_at' => $deviceInfo->last_check_in_at,
            ],
        ]);
    }
}
