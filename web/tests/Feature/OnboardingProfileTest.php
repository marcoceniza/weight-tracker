<?php

use App\Models\OnboardingProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('registered device can store an onboarding profile without a user account', function () {
    [, $deviceToken] = createDeviceAccessTestFixture();

    $response = $this->withToken($deviceToken)->postJson('/api/onboarding', [
        'name' => 'Marco',
        'current_weight' => 68.25,
        'current_weight_date' => '2026-10-10',
        'unit' => 'kg',
        'height_cm' => 170,
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.name', 'Marco')
        ->assertJsonPath('data.current_weight', 68.25)
        ->assertJsonPath('data.current_weight_date', '2026-10-10')
        ->assertJsonPath('data.unit', 'kg')
        ->assertJsonPath('data.height_cm', 170);

    $this->assertDatabaseHas('onboarding_profiles', [
        'name' => 'Marco',
        'current_weight' => 68.25,
        'current_weight_date' => '2026-10-10',
        'unit' => 'kg',
        'height_cm' => 170,
    ]);
});

test('onboarding profile validates the submitted values', function () {
    [, $deviceToken] = createDeviceAccessTestFixture();

    $response = $this->withToken($deviceToken)->postJson('/api/onboarding', [
        'name' => '',
        'current_weight' => -1,
        'current_weight_date' => 'not-a-date',
        'unit' => 'stone',
        'height_cm' => 301,
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors([
            'name',
            'current_weight',
            'current_weight_date',
            'unit',
            'height_cm',
        ]);

    expect(OnboardingProfile::count())->toBe(0);
});
