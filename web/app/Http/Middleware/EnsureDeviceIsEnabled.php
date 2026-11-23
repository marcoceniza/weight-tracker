<?php

namespace App\Http\Middleware;

use App\Models\DeviceInfo;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureDeviceIsEnabled
{
    public const DEVICE_ATTRIBUTE = 'device_info';

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if ($token === null || $token === '') {
            return response()->json([
                'success' => false,
                'error' => 'A valid device token is required.',
            ], 401);
        }

        $deviceInfo = DeviceInfo::query()
            ->where('device_token_hash', hash('sha256', $token))
            ->first();

        if ($deviceInfo === null) {
            return response()->json([
                'success' => false,
                'error' => 'A valid device token is required.',
            ], 401);
        }

        if ($deviceInfo->isDisabled()) {
            return response()->json([
                'success' => false,
                'error' => 'This device has been disabled.',
            ], 403);
        }

        $deviceInfo->forceFill(['last_check_in_at' => now()])->save();
        $request->attributes->set(self::DEVICE_ATTRIBUTE, $deviceInfo);

        return $next($request);
    }
}
