<?php

namespace App\Services\Management;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserService
{
    public function create(array $data): User
    {
        return DB::transaction(static function () use ($data): User {
            $user           = new User();
            $user->name     = $data['name'];
            $user->email    = $data['email'];
            $user->password = $data['password'];
            $user->save();

            if (! empty($data['roles'])) {
                $user->syncRoles($data['roles']);
            }

            return $user;
        });
    }

    public function update(User $user, array $data): User
    {
        return DB::transaction(static function () use ($user, $data): User {
            $user->name  = $data['name'];
            $user->email = $data['email'];

            if (! empty($data['password'])) {
                $user->password = $data['password'];
            }

            $user->save();

            if (array_key_exists('roles', $data)) {
                $user->syncRoles($data['roles'] ?? []);
            }

            return $user;
        });
    }

    public function delete(User $user): void
    {
        DB::transaction(static function () use ($user): void {
            $user->delete();
        });
    }
}

