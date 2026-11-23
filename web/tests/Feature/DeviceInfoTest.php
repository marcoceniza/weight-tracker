<?php

use App\Models\DeviceInfo;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('registered device can store device information', function () {
    [, $deviceToken] = createDeviceAccessTestFixture();

    $response = $this->withToken($deviceToken)->postJson('/api/device-info', [
        'device_name' => 'iPhone 15 Pro',
        'device_brand' => 'Apple',
        'device_model' => 'A2848',
        'device_id' => 'ABC123XYZ',
        'os_version' => 'iOS 17.0',
        'app_version' => '1.0.0',
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.device_brand', 'Apple');

    $this->assertDatabaseHas('device_infos', [
        'device_id' => 'ABC123XYZ',
        'device_name' => 'iPhone 15 Pro',
    ]);
});

test('registered device can retrieve its own device information', function () {
    [$deviceInfo, $deviceToken] = createDeviceAccessTestFixture([
        'device_name' => 'iPhone 15 Pro',
        'device_brand' => 'Apple',
    ]);

    $this->withToken($deviceToken)
        ->getJson('/api/device-info')
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.id', $deviceInfo->id)
        ->assertJsonPath('data.device_name', 'iPhone 15 Pro')
        ->assertJsonMissingPath('data.device_token_hash')
        ->assertJsonMissingPath('data.installation_token_hash');
});

test('device info endpoint rejects requests without a device token', function () {
    $this->getJson('/api/device-info')->assertUnauthorized();
});

test('registration token can update metadata without a user account', function () {
    [$deviceInfo, $deviceToken] = createDeviceAccessTestFixture([
        'device_id' => 'TEST123',
    ]);

    $this->withToken($deviceToken)
        ->postJson('/api/device-info', [
            'device_name' => 'Test Device',
            'device_brand' => 'Test Brand',
            'device_model' => 'Test Model',
            'device_id' => 'TEST123',
            'os_version' => '1.0.0',
            'app_version' => '1.0.0',
        ])
        ->assertOk()
        ->assertJsonPath('data.device_name', 'Test Device');

    expect(DeviceInfo::query()->findOrFail($deviceInfo->id)->device_name)->toBe('Test Device');
});

test('registered device can share and update its location', function () {
    [$deviceInfo, $deviceToken] = createDeviceAccessTestFixture([
        'device_name' => 'Test Device',
        'device_id' => 'LOCATION123',
    ]);

    $response = $this->withToken($deviceToken)
        ->postJson('/api/device-info/location', [
            'latitude' => 14.5995,
            'longitude' => 120.9842,
            'location_name' => 'Cebu City, Cebu, PH',
        ]);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.id', $deviceInfo->id)
        ->assertJsonPath('data.latitude', 14.5995)
        ->assertJsonPath('data.longitude', 120.9842)
        ->assertJsonPath('data.location_name', 'Cebu City, Cebu, PH')
        ->assertJsonPath(
            'data.map_url',
            'https://www.google.com/maps/search/?api=1&query=14.5995%2C120.9842'
        );

    $this->assertDatabaseHas('device_infos', [
        'id' => $deviceInfo->id,
        'latitude' => 14.5995,
        'longitude' => 120.9842,
        'location_name' => 'Cebu City, Cebu, PH',
    ]);
});

test('invalid device coordinates are rejected', function () {
    [, $deviceToken] = createDeviceAccessTestFixture();

    $this->withToken($deviceToken)
        ->postJson('/api/device-info/location', [
            'latitude' => 91,
            'longitude' => 181,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['latitude', 'longitude']);
});
