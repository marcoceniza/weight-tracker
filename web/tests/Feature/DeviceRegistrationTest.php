<?php

use App\Models\DeviceInfo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('device registration stores token hashes and returns an enabled device token', function () {
    $installationToken = str_repeat('i', 48);

    $response = $this->postJson('/api/device-registration', [
        'installation_token' => $installationToken,
        'device_name' => 'iPhone 15 Pro',
        'device_brand' => 'Apple',
        'device_model' => 'A2848',
        'device_id' => 'ABC123XYZ',
        'os_version' => 'iOS 17.0',
        'app_version' => '1.0.0',
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.enabled', true)
        ->assertJsonStructure(['data' => ['token', 'enabled', 'device', 'last_check_in_at']])
        ->assertJsonMissingPath('data.device.device_token_hash')
        ->assertJsonMissingPath('data.device.installation_token_hash');

    $device = DeviceInfo::query()
        ->where('installation_token_hash', hash('sha256', $installationToken))
        ->firstOrFail();

    expect($response->json('data.token'))->toHaveLength(64)
        ->and($device->device_token_hash)->toBe(hash('sha256', $response->json('data.token')))
        ->and($device->enabled)->toBeTrue()
        ->and($device->device_name)->toBe('iPhone 15 Pro')
        ->and($device->device_brand)->toBe('Apple')
        ->and($device->device_model)->toBe('A2848')
        ->and($device->device_id)->toBe('ABC123XYZ')
        ->and($device->os_version)->toBe('iOS 17.0')
        ->and($device->app_version)->toBe('1.0.0')
        ->and($device->last_check_in_at)->not->toBeNull();
});

test('registration with an existing installation token updates metadata without creating another device', function () {
    $installationToken = str_repeat('e', 48);
    $firstResponse = $this->postJson('/api/device-registration', [
        'installation_token' => $installationToken,
        'device_name' => 'Old Device',
        'device_id' => 'OLD123',
    ])->assertCreated();

    $response = $this->postJson('/api/device-registration', [
        'installation_token' => $installationToken,
        'device_name' => 'New Device',
        'device_brand' => 'New Brand',
        'device_model' => 'NEW123',
        'device_id' => 'OLD123',
        'os_version' => 'iOS 18.0',
        'app_version' => '1.1.0',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.device.device_name', 'New Device')
        ->assertJsonPath('data.device.device_brand', 'New Brand');

    $device = DeviceInfo::query()
        ->where('installation_token_hash', hash('sha256', $installationToken))
        ->firstOrFail();

    expect(DeviceInfo::query()->count())->toBe(1)
        ->and($device->device_token_hash)->toBe(hash('sha256', $response->json('data.token')))
        ->and($response->json('data.token'))->not->toBe($firstResponse->json('data.token'));
});

test('registration cannot re-enable a disabled device', function () {
    $installationToken = str_repeat('d', 48);
    $this->postJson('/api/device-registration', [
        'installation_token' => $installationToken,
        'device_name' => 'Disabled Device',
    ])->assertCreated();

    $device = DeviceInfo::query()
        ->where('installation_token_hash', hash('sha256', $installationToken))
        ->firstOrFail();
    $oldTokenHash = $device->device_token_hash;
    $device->forceFill(['enabled' => false])->save();

    $this->postJson('/api/device-registration', [
        'installation_token' => $installationToken,
        'device_name' => 'Re-register attempt',
    ])->assertForbidden()
        ->assertJsonPath('error', 'This device has been disabled.');

    expect($device->fresh()->enabled)->toBeFalse()
        ->and($device->fresh()->device_token_hash)->toBe($oldTokenHash);
});

test('registration requires an installation token', function () {
    $this->postJson('/api/device-registration', [
        'device_name' => 'Invalid Device',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('installation_token');
});

test('registration rejects a weak installation token', function () {
    $this->postJson('/api/device-registration', [
        'device_name' => 'Invalid Device',
        'installation_token' => 'too-short',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('installation_token');
});

test('status check returns the enabled status for a valid bearer token', function () {
    [$deviceInfo, $deviceToken] = createDeviceAccessTestFixture([
        'device_name' => 'Test Device',
        'device_id' => 'TEST123',
    ]);

    $response = $this->withToken($deviceToken)->getJson('/api/device-status');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.enabled', true)
        ->assertJsonStructure(['data' => ['enabled', 'last_check_in_at']]);

    expect($deviceInfo->fresh()->last_check_in_at)->not->toBeNull();
});

test('status check rejects an unknown bearer token', function () {
    $this->withToken(str_repeat('x', 64))
        ->getJson('/api/device-status')
        ->assertUnauthorized()
        ->assertJsonPath('error', 'A valid device token is required.');
});

test('disabled device returns a clear error on status check', function () {
    [, $deviceToken] = createDeviceAccessTestFixture([
        'device_name' => 'Disabled Device',
        'enabled' => false,
    ]);

    $this->withToken($deviceToken)
        ->getJson('/api/device-status')
        ->assertForbidden()
        ->assertJsonPath('error', 'This device has been disabled.');
});

test('device info update requires a valid device token and does not mutate disabled devices', function () {
    [$deviceInfo, $deviceToken] = createDeviceAccessTestFixture([
        'device_name' => 'Disabled Store Device',
        'enabled' => false,
    ]);

    $this->withToken($deviceToken)
        ->postJson('/api/device-info', ['device_name' => 'Updated Name'])
        ->assertForbidden();

    expect($deviceInfo->fresh()->device_name)->toBe('Disabled Store Device');
});

test('device info update rejects requests without a device token', function () {
    $this->postJson('/api/device-info', ['device_name' => 'No token'])
        ->assertUnauthorized();
});

test('location updates only affect the device authenticated by its token', function () {
    [$deviceA, $tokenA] = createDeviceAccessTestFixture(['device_name' => 'Device A']);
    [$deviceB] = createDeviceAccessTestFixture(['device_name' => 'Device B']);

    $this->withToken($tokenA)
        ->postJson('/api/device-info/location', [
            'device_id' => $deviceB->device_id,
            'latitude' => 14.5995,
            'longitude' => 120.9842,
            'location_name' => 'Cebu City',
        ])
        ->assertOk()
        ->assertJsonPath('data.id', $deviceA->id)
        ->assertJsonPath('data.location_name', 'Cebu City');

    expect($deviceA->fresh()->latitude)->toBe(14.5995)
        ->and($deviceB->fresh()->latitude)->toBeNull();
});

test('disabled device cannot update its location', function () {
    [$deviceInfo, $deviceToken] = createDeviceAccessTestFixture([
        'device_name' => 'Disabled Location Device',
        'enabled' => false,
    ]);

    $this->withToken($deviceToken)
        ->postJson('/api/device-info/location', [
            'latitude' => 14.5995,
            'longitude' => 120.9842,
            'location_name' => 'Cebu City',
        ])
        ->assertForbidden();

    expect($deviceInfo->fresh()->latitude)->toBeNull();
});

test('unauthenticated visitors are redirected to administrator login', function () {
    $this->get('/admin/devices')->assertRedirect('/admin/login');
});

test('authenticated non-administrators cannot access device management', function () {
    $this->actingAs(User::factory()->create())
        ->get('/admin/devices')
        ->assertForbidden();
});

test('authenticated non-administrators cannot disable a device', function () {
    [$device] = createDeviceAccessTestFixture();

    $this->actingAs(User::factory()->create())
        ->post(route('admin.devices.disable', $device))
        ->assertForbidden();

    expect($device->fresh()->enabled)->toBeTrue();
});

test('administrator can disable a device', function () {
    [$device] = createDeviceAccessTestFixture([
        'device_name' => 'Test Device',
        'device_id' => 'DIS123',
    ]);

    $this->actingAs(createAdminTestUser())
        ->post(route('admin.devices.disable', $device))
        ->assertRedirect(route('admin.devices.index'))
        ->assertSessionHas('success', 'Device has been disabled.');

    expect($device->fresh()->enabled)->toBeFalse();
});

test('administrator can re-enable a device', function () {
    [$device] = createDeviceAccessTestFixture([
        'device_name' => 'Test Device',
        'device_id' => 'EN123',
        'enabled' => false,
    ]);

    $this->actingAs(createAdminTestUser())
        ->post(route('admin.devices.enable', $device))
        ->assertRedirect(route('admin.devices.index'))
        ->assertSessionHas('success', 'Device has been enabled.');

    expect($device->fresh()->enabled)->toBeTrue();
});

test('admin device list paginates records and escapes device metadata', function () {
    $script = '<script>alert(1)</script>';
    createDeviceAccessTestFixture(['device_name' => $script]);

    $response = $this->actingAs(createAdminTestUser())
        ->get(route('admin.devices.index'));

    $response->assertOk()
        ->assertSee('&lt;script&gt;alert(1)&lt;/script&gt;', false)
        ->assertDontSee($script, false);
});
