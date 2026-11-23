<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('manage-devices', fn (User $user): bool => $user->isAdmin());

        // Registration is only available when no administrator exists yet.
        View::composer('admin.auth.login', function ($view) {
            $view->with('adminExists', User::query()->where('is_admin', true)->exists());
        });
    }
}
