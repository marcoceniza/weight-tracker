<?php

namespace App\Http\Controllers;

use App\Models\DeviceInfo;
use App\Models\OnboardingProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'current_weight' => ['required', 'numeric', 'gt:0'],
            'current_weight_date' => ['required', 'date_format:Y-m-d'],
            'unit' => ['required', 'in:kg,lbs'],
            'height_cm' => ['required', 'numeric', 'gt:0', 'lte:300'],
            'device_id' => ['nullable', 'integer', 'exists:device_infos,id'],
            'installation_token' => ['nullable', 'string', 'min:32', 'max:255'],
        ]);

        $deviceId = $this->resolveDeviceId($request);

        $profile = OnboardingProfile::create(array_merge($validated, [
            'current_weight_date' => $validated['current_weight_date'],
            'device_id' => $deviceId,
        ]));

        return response()->json([
            'success' => true,
            'data' => $profile,
        ], 201);
    }

    /**
     * Resolve the device an onboarding profile belongs to, from either an
     * explicit device id or a registration installation token.
     */
    private function resolveDeviceId(Request $request): ?int
    {
        if (! empty($validated = $validated['device_id'] ?? null)) {
            return (int) $validated;
        }

        $token = $validated['installation_token'] ?? null;

        if (! empty($token)) {
            return DeviceInfo::query()
                ->where('installation_token_hash', hash('sha256', $token))
                ->value('id');
        }

        return null;
    }
}
