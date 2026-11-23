<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin Dashboard | Weight Tracker</title>
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    @else
        <style>
            /*! tailwindcss v4.0.7 | MIT License | https://tailwindcss.com */ @layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-translate-x:0;--tw-translate-y:0;--tw-translate-z:0;--tw-rotate-x:initial;--tw-rotate-y:initial;--tw-rotate-z:initial;--tw-skew-x:initial;--tw-skew-y:initial;--tw-space-x-reverse:0;--tw-border-style:solid;--tw-leading:initial;--tw-font-weight:initial;--tw-tracking:initial;--tw-shadow:0 0 #0000;--tw-shadow-color:initial;--tw-shadow-alpha:100%;--tw-inset-shadow:0 0 #0000;--tw-inset-shadow-color:initial;--tw-inset-shadow-alpha:100%;--tw-ring-color:initial;--tw-ring-shadow:0 0 #0000;--tw-inset-ring-color:initial;--tw-inset-ring-shadow:0 0 #0000;--tw-ring-inset:initial;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-offset-shadow:0 0 #0000;--tw-blur:initial;--tw-brightness:initial;--tw-contrast:initial;--tw-grayscale:initial;--tw-hue-rotate:initial;--tw-opacity:initial;--tw-saturate:initial;--tw-sepia:initial;--tw-drop-shadow:initial;--tw-drop-shadow-color:initial;--tw-drop-shadow-alpha:100%;--tw-drop-shadow-size:initial;--tw-duration:initial;--tw-ease:initial;--tw-content:""}}}@layer theme{:root,:host{--font-sans:"Instrument Sans", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";--font-serif:ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;--font-mono:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;--color-red-50:oklch(97.1% .013 17.38);--color-red-100:oklch(93.6% .032 17.717);--color-red-200:oklch(88.5% .062 18.334);--color-red-300:oklch(80.8% .114 19.571);--color-red-400:oklch(70.4% .191 22.216);--color-red-500:oklch(63.7% .237 25.331);--color-red-600:oklch(57.7% .245 27.325);--color-red-700:oklch(50.5% .213 27.518);--color-red-800:oklch(44.4% .... [truncated]
        </style>
    @endif
</head>
<body class="bg-[#FDFBF7] dark:bg-[#0A0A0A] text-[#1B1B18] dark:text-[#EDEDEC] min-h-screen flex flex-col">
    <header class="sticky top-0 z-30 border-b border-[#E3E3E0] dark:border-[#2A2A27] bg-white/80 dark:bg-[#161615]/80 backdrop-blur-md">
        <nav class="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
            <!-- Brand -->
            <a href="{{ route('admin.devices.index') }}"
               class="flex items-center gap-2.5 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40">
                <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.75 6H5.25m-1.5-4.5L3 12m14.25 6-1.59 1.59M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                </span>
                <span>
                    <span class="block text-sm font-semibold tracking-tight text-[#1B1B18] dark:text-[#EDEDEC]">Weight Tracker</span>
                    <span class="block text-xs text-[#706F6C] dark:text-[#A1A09A] font-normal">Admin console</span>
                </span>
            </a>

            <!-- Actions -->
            <div class="flex items-center gap-1.5">
                <a href="{{ route('admin.devices.index') }}"
                   class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white/10 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:hover:bg-white/5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    Devices
                </a>
                <form method="POST" action="{{ route('logout') }}" class="inline">
                    @csrf
                    <button type="submit"
                            class="flex items-center cursor-pointer gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white/10 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 dark:hover:bg-white/5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V13.5a2.25 2.25 0 0 1 2.25-2.25h6a2.25 2.25 0 0 1 2.25 2.25v6a2.25 2.25 0 0 1-2.25 2.25h-6a2.25 2.25 0 0 1-2.25-2.25Z" />
                        </svg>
                        Logout
                    </button>
                </form>
            </div>
        </nav>
    </header>

    <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
        <div class="mb-6">
            <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight">Device Administration</h1>
            <p class="text-sm text-[#706F6C] dark:text-[#A1A09A] mt-1.5">
                View registered devices and manage their enabled/disabled status. Disabled devices cannot check in or access device-related API endpoints.
            </p>
        </div>

        @if (session('success'))
            <div class="mb-4 flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 shrink-0 mt-0.5 text-green-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span>{{ session('success') }}</span>
            </div>
        @endif

        @if (session('error'))
            <div class="mb-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 shrink-0 mt-0.5 text-red-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <span>{{ session('error') }}</span>
            </div>
        @endif

        <!-- KPI Overview -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div class="bg-white dark:bg-[#161615] rounded-xl p-4 sm:p-5 border border-[#E3E3E0] dark:border-[#2A2A27] shadow-sm">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-medium text-[#706F6C] dark:text-[#A1A09A]">Total</span>
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </span>
                </div>
                <p class="text-2xl sm:text-3xl font-bold tracking-tight">{{ $stats['total'] ?? 0 }}</p>
            </div>
            <div class="bg-white dark:bg-[#161615] rounded-xl p-4 sm:p-5 border border-[#E3E3E0] dark:border-[#2A2A27] shadow-sm">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-medium text-[#706F6C] dark:text-[#A1A09A]">Enabled</span>
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    </span>
                </div>
                <p class="text-2xl sm:text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">{{ $stats['active'] ?? 0 }}</p>
            </div>
            <div class="bg-white dark:bg-[#161615] rounded-xl p-4 sm:p-5 border border-[#E3E3E0] dark:border-[#2A2A27] shadow-sm">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-medium text-[#706F6C] dark:text-[#A1A09A]">Disabled</span>
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9V3m0 18v-3m9-8h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2m-12 0h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2m10.5-8.5-2 2m0 0 .5 2m0 0 2 1m4-7h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" />
                        </svg>
                    </span>
                </div>
                <p class="text-2xl sm:text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">{{ $stats['disabled'] ?? 0 }}</p>
            </div>
            <div class="bg-white dark:bg-[#161615] rounded-xl p-4 sm:p-5 border border-[#E3E3E0] dark:border-[#2A2A27] shadow-sm">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-medium text-[#706F6C] dark:text-[#A1A09A]">Last Check-in</span>
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </span>
                </div>
                <p class="text-2xl sm:text-3xl font-bold tracking-tight">{{ $stats['last_checkin']?->format('M d, Y') ?? 'Never' }}</p>
            </div>
        </div>

        <!-- Devices Table -->
        <div class="bg-white dark:bg-[#161615] rounded-xl border border-[#E3E3E0] dark:border-[#2A2A27] shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E3E3E0] dark:border-[#2A2A27]">
                <h2 class="text-base font-semibold tracking-tight">Registered Devices</h2>
                <span class="text-xs text-[#706F6C] dark:text-[#A1A09A]">{{ $devices->total() }} total</span>
            </div>

            @if($devices->isEmpty())
                <div class="px-4 sm:px-6 py-16 text-center">
                    <span class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#2A2A27] text-[#908F8B] dark:text-[#6B675F]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </span>
                    <p class="mt-4 text-sm font-medium text-[#1B1B18] dark:text-[#EDEDEC]">No devices registered</p>
                    <p class="mt-1 text-sm text-[#706F6C] dark:text-[#A1A09A]">Use the registration flow to add a new device.</p>
                </div>
            @else
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="bg-[#F7F7F5] dark:bg-[#1A1A18]">
                                <th class="px-4 sm:px-6 py-3 text-left font-medium text-[#706F6C] dark:text-[#A1A09A]">Device</th>
                                <th class="px-4 sm:px-6 py-3 text-left font-medium text-[#706F6C] dark:text-[#A1A09A]">Brand / Model</th>
                                <th class="px-4 sm:px-6 py-3 text-left font-medium text-[#706F6C] dark:text-[#A1A09A]">Device ID</th>
                                <th class="px-4 sm:px-6 py-3 text-left font-medium text-[#706F6C] dark:text-[#A1A09A]">OS / App</th>
                                <th class="px-4 sm:px-6 py-3 text-left font-medium text-[#706F6C] dark:text-[#A1A09A]">Status</th>
                                <th class="px-4 sm:px-6 py-3 text-left font-medium text-[#706F6C] dark:text-[#A1A09A]">Last Check-in</th>
                                <th class="px-4 sm:px-6 py-3 text-left font-medium text-[#706F6C] dark:text-[#A1A09A]">User</th>
                                <th class="px-4 sm:px-6 py-3 text-left font-medium text-[#706F6C] dark:text-[#A1A09A]">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-[#E3E3E0] dark:divide-[#2A2A27]">
                            @foreach($devices as $device)
                                <tr class="group hover:bg-[#F7F7F5] dark:hover:bg-[#1E1E1B] transition-colors">
                                    <td class="px-4 sm:px-6 py-4 font-medium">
                                        <div class="flex items-center gap-2.5">
                                            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
                                                {{ strtoupper(substr($device->device_name ?? 'U', 0, 1)) }}
                                            </span>
                                            <span class="max-w-24 truncate">{{ $device->device_name ?? 'Unnamed' }}</span>
                                        </div>
                                    </td>
                                    <td class="px-4 sm:px-6 py-4 text-[#706F6C] dark:text-[#A1A09A]">
                                        <span class="inline-flex items-center gap-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                            </svg>
                                            {{ $device->device_brand ?? '-' }}
                                        </span>
                                        <span class="text-xs font-medium text-[#1B1B18] dark:text-[#EDEDEC] ml-1.5">{{ $device->device_model ?? '-' }}</span>
                                    </td>
                                    <td class="px-4 sm:px-6 py-4 text-[#706F6C] dark:text-[#A1A09A] font-mono text-xs">{{ $device->device_id ?? '-' }}</td>
                                    <td class="px-4 sm:px-6 py-4 text-[#706F6C] dark:text-[#A1A09A] text-xs">
                                        {{ $device->os_version ?? '-' }}
                                        <span class="mx-1">/</span>
                                        {{ $device->app_version ?? '-' }}
                                    </td>
                                    <td class="px-4 sm:px-6 py-4">
                                        @if($device->isEnabled())
                                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                </svg>
                                                Enabled
                                            </span>
                                        @else
                                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                                Disabled
                                            </span>
                                        @endif
                                    </td>
                                    <td class="px-4 sm:px-6 py-4 text-[#706F6C] dark:text-[#A1A09A] text-xs">
                                        {{ $device->last_check_in_at?->format('M d, Y g:i A') ?? 'Never' }}
                                    </td>
                                    <td class="px-4 sm:px-6 py-4">
                                        <button
                                            type="button"
                                            data-view-user="{{ $device->id }}"
                                            data-url="{{ route('admin.devices.user', $device->id) }}"
                                            class="inline-flex items-center gap-1.5 px-3 py-1.5 cursor-pointer rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                            View
                                        </button>
                                    </td>
                                    <td class="px-4 sm:px-6 py-4">
                                        <form method="POST" action="{{ route('admin.devices.' . ($device->isEnabled() ? 'disable' : 'enable'), $device) }}" class="inline">
                                            @csrf
                                            <button
                                                type="submit"
                                                class="inline-flex items-center gap-1.5 px-3 py-1.5 cursor-pointer rounded-lg text-xs font-medium
                                                    {{ $device->isEnabled() ? 'bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/60 transition' : 'bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/60 transition' }}"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                                {{ $device->isEnabled() ? 'Disable' : 'Enable' }}
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endif
        </div>

        <div class="mt-4 text-center text-xs text-[#706F6C] dark:text-[#A1A09A]">
            Showing <strong>{{ $devices->total() }}</strong> registered device{{ $devices->total() !== 1 ? 's' : '' }}.
        </div>
    </main>

    <!-- User Profile Modal -->
    <div id="userModal" class="relative z-50 hidden" aria-modal="true" role="dialog" aria-labelledby="userModalTitle">
        <div
            id="userModalBackdrop"
            class="fixed inset-0 flex min-h-full items-center justify-center p-4 bg-black/50"
        >
            <div class="w-full max-w-md transform transition-all bg-white dark:bg-[#161615] rounded-2xl border border-[#E3E3E0] dark:border-[#2A2A27] shadow-sm text-left">
                <!-- Header -->
                <div class="flex items-center justify-between px-5 py-4 border-b border-[#E3E3E0] dark:border-[#2A2A27]">
                    <h3 id="userModalTitle" class="text-base font-semibold tracking-tight text-[#1B1B18] dark:text-[#EDEDEC]">User Profile</h3>
                    <button
                        type="button"
                        data-close-user-modal
                        class="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#706F6C] dark:text-[#A1A09A] hover:bg-[#F7F7F5] dark:hover:bg-[#1A1A18] transition"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Body -->
                <div class="px-5 py-4">
                    <div id="userModalBody" class="space-y-4">
                        <p class="text-sm text-[#706F6C] dark:text-[#A1A09A]">Loading&hellip;</p>
                    </div>

                    <div id="userModalEmpty" class="hidden px-5 pb-5 text-center">
                        <span class="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#F7F7F5] dark:bg-[#1A1A18] text-[#908F8B] dark:text-[#6B675F]">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.04-.04m12.72-1.08a5 5 0 1 1-8.6 0 5 5 0 0 1 8.6 0Zm-.13 10.06a7 7 0 1 1-9.4 0 7 7 0 0 1 9.4 0Z" />
                            </svg>
                        </span>
                        <p class="mt-3 text-sm font-medium text-[#1B1B18] dark:text-[#EDEDEC]">No user linked</p>
                        <p class="mt-1 text-sm text-[#706F6C] dark:text-[#A1A09A]">This device has not been linked to an onboarding profile yet.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
    (function () {
        const modal = document.getElementById('userModal');
        const body = document.getElementById('userModalBody');
        const empty = document.getElementById('userModalEmpty');
        const backdrop = document.getElementById('userModalBackdrop');
        const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

        function renderProfile(data) {
            const profile = data && data.profile;

            if (!profile) {
                body.innerHTML = '';
                empty.classList.remove('hidden');
                return;
            }

            const initial = String(profile.name || '?').charAt(0).toUpperCase();
            const deviceName = (data.device && data.device.device_name) ? data.device.device_name : '';

            body.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-semibold text-white shadow-sm">${escapeHtml(initial)}</span>
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-semibold tracking-tight text-[#1B1B18] dark:text-[#EDEDEC]">${escapeHtml(profile.name)}</p>
                        <p class="truncate text-xs text-[#706F6C] dark:text-[#A1A09A]">${escapeHtml(deviceName) || 'No device linked'}</p>
                    </div>
                </div>
                <dl class="grid grid-cols-2 gap-3">
                    <div class="rounded-xl bg-[#F7F7F5] dark:bg-[#1A1A18] px-3.5 py-3">
                        <dt class="text-xs text-[#706F6C] dark:text-[#A1A09A]">Weight</dt>
                        <dd class="mt-0.5 text-sm font-semibold text-[#1B1B18] dark:text-[#EDEDEC]">${escapeHtml(profile.current_weight + ' ' + profile.unit)}</dd>
                    </div>
                    <div class="rounded-xl bg-[#F7F7F5] dark:bg-[#1A1A18] px-3.5 py-3">
                        <dt class="text-xs text-[#706F6C] dark:text-[#A1A09A]">Height</dt>
                        <dd class="mt-0.5 text-sm font-semibold text-[#1B1B18] dark:text-[#EDEDEC]">${escapeHtml(profile.height_cm + ' cm')}</dd>
                    </div>
                    <div class="col-span-2 rounded-xl bg-[#F7F7F5] dark:bg-[#1A1A18] px-3.5 py-3">
                        <dt class="text-xs text-[#706F6C] dark:text-[#A1A09A]">Weight date</dt>
                        <dd class="mt-0.5 text-sm font-semibold text-[#1B1B18] dark:text-[#EDEDEC]">${escapeHtml(profile.current_weight_date || '&mdash;')}</dd>
                    </div>
                    <div class="col-span-2 rounded-xl bg-[#F7F7F5] dark:bg-[#1A1A18] px-3.5 py-3">
                        <dt class="text-xs text-[#706F6C] dark:text-[#A1A09A]">Joined</dt>
                        <dd class="mt-0.5 text-sm font-semibold text-[#1B1B18] dark:text-[#EDEDEC]">${escapeHtml(profile.created_at || '&mdash;')}</dd>
                    </div>
                </dl>
            `;
            empty.classList.add('hidden');
        }

        function openModal(url) {
            modal.classList.remove('hidden');
            body.innerHTML = '<p class="text-sm text-[#706F6C] dark:text-[#A1A09A]">Loading&hellip;</p>';
            empty.classList.add('hidden');
            fetch(url, { headers: { 'X-Requested-With': 'fetch' }, credentials: 'same-origin' })
                .then(function (response) { return response.json(); })
                .then(renderProfile)
                .catch(function () { renderProfile(null); });
        }

        function closeModal() {
            modal.classList.add('hidden');
        }

        document.addEventListener('click', function (event) {
            const openButton = event.target.closest('[data-view-user]');
            if (openButton) {
                openModal(openButton.getAttribute('data-url'));
                return;
            }
            if (event.target.closest('[data-close-user-modal]') || event.target === backdrop) {
                closeModal();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });
    })()
    </script>

    <footer class="text-center text-xs text-[#706F6C] dark:text-[#A1A09A] py-4 border-t border-[#E3E3E0] dark:border-[#2A2A27]">
        Weight Tracker Admin · Internal administration only
    </footer>
</body>
</html>
