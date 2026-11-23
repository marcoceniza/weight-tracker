<?php

use App\Models\DeviceInfo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
 // ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function something()
{
    // ..
}

/**
 * @return array{0: DeviceInfo, 1: string}
 */
function createDeviceAccessTestFixture(array $attributes = []): array
{
    $deviceToken = Str::random(64);
    $deviceInfo = DeviceInfo::create(Arr::except($attributes, [
        'enabled',
        'installation_token_hash',
        'device_token_hash',
    ]));

    $deviceInfo->forceFill([
        'enabled' => $attributes['enabled'] ?? true,
        'installation_token_hash' => hash('sha256', Str::random(64)),
        'device_token_hash' => hash('sha256', $deviceToken),
    ])->save();

    return [$deviceInfo, $deviceToken];
}

function createAdminTestUser(): User
{
    $user = User::factory()->create();
    $user->forceFill(['is_admin' => true])->save();

    return $user;
}
