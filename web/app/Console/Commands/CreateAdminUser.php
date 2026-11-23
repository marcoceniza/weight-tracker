<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

#[Signature('app:create-admin-user')]
#[Description('Create an administrator account or promote an existing user.')]
class CreateAdminUser extends Command
{
    public function handle(): int
    {
        $email = mb_strtolower(trim((string) $this->ask('Administrator email')));
        $emailValidator = Validator::make(['email' => $email], [
            'email' => ['required', 'email', 'max:255'],
        ]);

        if ($emailValidator->fails()) {
            $this->error($emailValidator->errors()->first('email'));

            return self::FAILURE;
        }

        $user = User::query()->where('email', $email)->first();

        if ($user?->isAdmin()) {
            $this->info('This account is already an administrator.');

            return self::SUCCESS;
        }

        if ($user !== null) {
            if (! $this->confirm('Promote this existing account to administrator?')) {
                return self::FAILURE;
            }
        } else {
            $name = trim((string) $this->ask('Administrator name'));
            $password = (string) $this->secret('Password (at least 12 characters)');
            $passwordConfirmation = (string) $this->secret('Confirm password');

            $validator = Validator::make([
                'name' => $name,
                'password' => $password,
                'password_confirmation' => $passwordConfirmation,
            ], [
                'name' => ['required', 'string', 'max:255'],
                'password' => ['required', 'string', 'min:12', 'confirmed'],
            ]);

            if ($validator->fails()) {
                $this->error($validator->errors()->first());

                return self::FAILURE;
            }

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => $password,
            ]);
        }

        $user->forceFill(['is_admin' => true])->save();
        $this->info('Administrator account is ready.');

        return self::SUCCESS;
    }
}
