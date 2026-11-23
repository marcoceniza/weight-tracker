<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('the login page renders with a link to registration', function () {
    $this->get(route('login'))
        ->assertOk()
        ->assertViewIs('admin.auth.login')
        ->assertSee('href="'.route('register').'"', false);
});

test('the registration page renders while no administrator exists', function () {
    $this->get(route('register'))
        ->assertOk()
        ->assertViewIs('admin.auth.register')
        ->assertSee('action="'.route('register.store').'"', false);
});

test('the first administrator can register even when regular users already exist', function () {
    User::factory()->create();

    $this->post(route('register.store'), [
        'name' => 'First Administrator',
        'email' => 'admin@example.test',
        'password' => 'long-password-123',
        'password_confirmation' => 'long-password-123',
    ])->assertRedirect(route('admin.devices.index'));

    $administrator = User::query()->where('email', 'admin@example.test')->firstOrFail();

    $this->assertAuthenticatedAs($administrator);
    $this->assertDatabaseHas('users', [
        'id' => $administrator->id,
        'is_admin' => true,
    ]);
    expect(Hash::check('long-password-123', $administrator->password))->toBeTrue();
});

test('registration is unavailable after an administrator exists', function () {
    createAdminTestUser();

    $this->get(route('register'))->assertRedirect(route('login'));

    $this->post(route('register.store'), [
        'name' => 'Second Administrator',
        'email' => 'second-admin@example.test',
        'password' => 'long-password-123',
        'password_confirmation' => 'long-password-123',
    ])->assertRedirect(route('login'));

    $this->assertDatabaseCount('users', 1);
});

test('registration requires account details', function () {
    $this->from(route('register'))
        ->post(route('register.store'))
        ->assertRedirect(route('register'))
        ->assertSessionHasErrors(['name', 'email', 'password']);

    $this->assertDatabaseCount('users', 0);
});

test('registration rejects passwords shorter than twelve characters', function () {
    $this->from(route('register'))
        ->post(route('register.store'), [
            'name' => 'First Administrator',
            'email' => 'admin@example.test',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])
        ->assertRedirect(route('register'))
        ->assertSessionHasErrors([
            'password' => 'The password field must be at least 12 characters.',
        ]);

    $this->assertDatabaseCount('users', 0);
});

test('registration requires a matching password confirmation', function () {
    $this->from(route('register'))
        ->post(route('register.store'), [
            'name' => 'First Administrator',
            'email' => 'admin@example.test',
            'password' => 'long-password-123',
            'password_confirmation' => 'different-password',
        ])
        ->assertRedirect(route('register'))
        ->assertSessionHasErrors([
            'password' => 'The password field confirmation does not match.',
        ]);

    $this->assertDatabaseCount('users', 0);
});
