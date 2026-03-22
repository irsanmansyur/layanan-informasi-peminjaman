<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;

class UserRepository implements UserRepositoryInterface
{
    public function queryWithRoles(): Builder
    {
        return User::query()->with('roles');
    }

    public function create(array $attributes): User
    {
        return User::query()->create($attributes);
    }

    public function save(User $user): void
    {
        $user->save();
    }

    public function delete(User $user): void
    {
        $user->delete();
    }

    public function deleteWhereIdsIn(array $ids): void
    {
        if ($ids === []) {
            return;
        }

        User::query()->whereIn('id', $ids)->delete();
    }
}
