<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('administrator can sign in and access device management', function () {
    $admin = createAdminTestUser();

    $this->get('/admin/login')
        ->assertOk()
        ->assertSee('Administrator Login');

    $this->post('/admin/login', [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect(route('admin.devices.index'));

    $this->get(route('admin.devices.index'))->assertOk();
});

test('regular users cannot sign in to device administration', function () {
    $user = User::factory()->create();

    $this->from('/admin/login')->post('/admin/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/admin/login')
        ->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('unauthenticated visitors are redirected to the administrator login', function () {
    $this->get('/admin/devices')->assertRedirect('/admin/login');
});

test('authenticated non-administrators cannot manage devices', function () {
    $this->actingAs(User::factory()->create())
        ->get('/admin/devices')
        ->assertForbidden();
});

test('administrator can log out', function () {
    $this->actingAs(createAdminTestUser())
        ->post('/admin/logout')
        ->assertRedirect('/admin/login');

    $this->assertGuest();
});
