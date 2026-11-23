<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RegisteredUserController extends Controller
{
    public function create(): View|RedirectResponse
    {
        if ($this->administratorExists()) {
            return redirect()->route('login');
        }

        return view('admin.auth.register');
    }

    public function store(Request $request): RedirectResponse
    {
        if ($this->administratorExists()) {
            return redirect()->route('login');
        }

        $email = $request->input('email');

        if (is_string($email)) {
            $request->merge(['email' => mb_strtolower(trim($email))]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:12', 'confirmed'],
        ]);

        try {
            $administrator = Cache::lock('admin-registration', 30)->block(5, function () use ($validated): ?User {
                return DB::transaction(function () use ($validated): ?User {
                    if ($this->administratorExists()) {
                        return null;
                    }

                    $user = User::create([
                        'name' => $validated['name'],
                        'email' => $validated['email'],
                        'password' => $validated['password'],
                    ]);

                    $user->forceFill(['is_admin' => true])->save();

                    return $user;
                });
            });
        } catch (LockTimeoutException) {
            return back()->withErrors([
                'registration' => 'Administrator registration is already in progress. Please try again.',
            ]);
        }

        if ($administrator === null) {
            return redirect()->route('login');
        }

        Auth::login($administrator);
        $request->session()->regenerate();

        return redirect()->route('admin.devices.index');
    }

    private function administratorExists(): bool
    {
        return User::query()->where('is_admin', true)->exists();
    }
}
