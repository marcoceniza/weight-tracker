<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeviceInfo;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class DeviceController extends Controller
{
    public function index(): View
    {
        $devices = DeviceInfo::query()->latest()->paginate(25);

        $stats = [
            'total' => DeviceInfo::count(),
            'active' => DeviceInfo::where('enabled', true)->count(),
            'disabled' => DeviceInfo::where('enabled', false)->count(),
            'last_checkin' => DeviceInfo::whereNotNull('last_check_in_at')
                ->orderByDesc('last_check_in_at')
                ->value('last_check_in_at'),
        ];

        return view('admin.dashboard', compact('devices', 'stats'));
    }

    public function user(DeviceInfo $device): JsonResponse
    {
        $profile = $device->onboardingProfile;

        return response()->json([
            'device' => [
                'id' => $device->id,
                'device_name' => $device->device_name,
            ],
            'profile' => $profile === null ? null : [
                'id' => $profile->id,
                'name' => $profile->name,
                'current_weight' => $profile->current_weight,
                'unit' => $profile->unit,
                'height_cm' => $profile->height_cm,
                'current_weight_date' => $profile->current_weight_date?->toDateString(),
                'created_at' => $profile->created_at?->toDateString(),
            ],
        ]);
    }

    public function disable(DeviceInfo $device): RedirectResponse
    {
        $device->forceFill(['enabled' => false])->save();

        return redirect()
            ->route('admin.devices.index')
            ->with('success', 'Device has been disabled.');
    }

    public function enable(DeviceInfo $device): RedirectResponse
    {
        $device->forceFill(['enabled' => true])->save();

        return redirect()
            ->route('admin.devices.index')
            ->with('success', 'Device has been enabled.');
    }
}
