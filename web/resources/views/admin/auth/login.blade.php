<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Administrator Login | Weight Tracker</title>
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    @else
        <style>
            /*! tailwindcss v4.0.7 | MIT License | https://tailwindcss.com */
            @import url('https://cdn.jsdelivr.net/npm/tailwindcss@v4/dist/tailwind.min.css');
        </style>
    @endif
</head>
<body class="bg-[#FDFBF7] dark:bg-[#0A0A0A] text-[#1B1B18] dark:text-[#EDEDEC] min-h-screen antialiased flex flex-col">
    <main class="flex-1 w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2">
        <!-- Brand panel (desktop) -->
        <aside class="relative hidden lg:flex flex-col justify-between p-10 xl:p-12 text-white overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600">
            <!-- decorative blurs -->
            <div class="absolute inset-0 overflow-hidden" aria-hidden="true">
                <div class="absolute -top-24 -right-16 w-80 h-80 bg-violet-400/30 rounded-full blur-3xl"></div>
                <div class="absolute bottom-[-120px] left-[-80px] w-96 h-96 bg-indigo-300/25 rounded-full blur-3xl"></div>
                <div class="absolute inset-0 opacity-[0.12]" style="background-image:radial-gradient(#ffffff 1px, transparent 1px); background-size:24px 24px;"></div>
            </div>

            <div class="relative flex items-center gap-2.5 pb-12">
                <span class="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 ring-1 ring-white/30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.75 6H5.25m-1.5-4.5L3 12m14.25 6-1.59 1.59M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                </span>
                <span class="text-lg font-semibold tracking-tight">Weight Tracker</span>
            </div>

            <div class="relative max-w-md">
                <h1 class="text-4xl font-semibold leading-tight tracking-tight">
                    Welcome back to<br />the admin console.
                </h1>
                <p class="mt-4 text-white/75 text-base">
                    One secure place to monitor registered devices, manage access, and review check-ins.
                </p>

                <ul class="mt-8 space-y-3 text-sm text-white/85">
                    <li class="flex items-center gap-3">
                        <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </span>
                        Enable or disable device access instantly
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </span>
                        See the last time each device checked in
                    </li>
                    <li class="flex items-center gap-3">
                        <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </span>
                        Administrator-only access
                    </li>
                </ul>
            </div>

            <p class="relative text-xs text-white/50 mt-8">© 2026 Weight Tracker · Internal administration only.</p>
        </aside>

        <!-- Form side -->
        <div class="flex items-center justify-center p-6 sm:p-8">
            <div class="w-full max-w-md">
                <div class="lg:hidden flex items-center gap-2.5 mb-8">
                    <span class="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.75 6H5.25m-1.5-4.5L3 12m14.25 6-1.59 1.59M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    </span>
                    <span class="text-lg font-semibold tracking-tight">Weight Tracker</span>
                </div>

                <h2 class="text-2xl font-semibold tracking-tight">Sign in</h2>
                <p class="mt-1.5 text-sm text-[#706f6c] dark:text-[#A1A09A]">Use your administrator account to continue.</p>

                @if ($errors->any())
                    <div class="mt-6 mb-5 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 shrink-0 mt-0.5 text-red-500">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                        <span>{{ $errors->first() }}</span>
                    </div>
                @endif

                <form method="POST" action="{{ route('login.store') }}" class="space-y-4" autocomplete="on">
                    @csrf

                    <div>
                        <label for="email" class="block text-sm font-medium text-[#1B1B18] dark:text-gray-100">Email address</label>
                        <div class="mt-1 relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#908F8B] dark:text-[#807F7A]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H7.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0-6.64 4.5-6.649-4.5m13.799 0-6.64 4.5a2.248 2.248 0 0 1-2.5 0l-6.649-4.5" />
                                </svg>
                            </span>
                            <input id="email" name="email" type="email" value="{{ old('email') }}" required autofocus
                                placeholder="you@company.com"
                                class="block w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#D9D8D5] dark:border-[#3E3E3A] bg-white dark:bg-[#161615] text-[#1B1B18] dark:text-gray-100 placeholder-[#A8A7A3] transition shadow-sm sm:text-sm
                                    focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-0 dark:focus:ring-[#161615] dark:focus:border-indigo-500">
                        </div>
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-[#1B1B18] dark:text-gray-100">Password</label>
                        <div class="mt-1 relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#908F8B] dark:text-[#807F7A]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                            </span>
                            <input id="password" name="password" type="password" required
                                   autocomplete="current-password"
                                   placeholder="••••••••"
                                   class="block w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D9D8D5] dark:border-[#3E3E3A] bg-white dark:bg-[#161615] text-[#1B1B18] dark:text-gray-100 placeholder-[#A8A7A3] transition shadow-sm sm:text-sm
                                    focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-0 dark:focus:ring-[#161615] dark:focus:border-indigo-500">
                            <button type="button" id="togglePassword" aria-pressed="false" aria-label="Show password"
                                class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#908F8B] dark:text-[#807F7A] hover:text-[#1B1B18] dark:hover:text-gray-100 transition focus:outline-none">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 transition group-focus-text:text-[#1B1B18] dark:group-focus-text:text-gray-100">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="pt-2">
                        <button type="submit"
                            class="group flex w-full items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white rounded-xl bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 dark:focus:ring-[#161615] shadow-sm transition active:scale-[0.98]">
                            Sign in
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 group-hover:translate-x-0.5 transition">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>
                </form>
@if (!$adminExists)
    <p class="mt-4 text-center text-sm text-[#706F6C] dark:text-[#A1A09A]">
        Don’t have an account? <a href="{{ route('register') }}" class="font-semibold text-indigo-600 hover:text-indigo-500 underline-offset-2 hover:underline">Register</a>
    </p>
@endif
            </div>
        </div>
    </main>

    <script>
        (function () {
            var btn = document.getElementById('togglePassword');
            var input = document.getElementById('password');
            if (btn && input) {
                btn.addEventListener('click', function () {
                    var show = input.type === 'password';
                    input.type = show ? 'text' : 'password';
                    btn.setAttribute('aria-pressed', String(show));
                });
            }
        })();
    </script>
</body>
</html>
