<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('users.read');
    }

    public function view(User $user, User $model): bool
    {
        return $user->can('users.read');
    }

    public function create(User $user): bool
    {
        return $user->can('users.create');
    }

    public function update(User $user, User $model): bool
    {
        return $user->can('users.update');
    }

    public function delete(User $user, User $model): bool
    {
        return $user->can('users.delete');
    }

    /**
     * Bulk delete (route tanpa model; izin sama dengan delete user).
     */
    public function bulkDestroy(User $user): bool
    {
        return $user->can('users.delete');
    }
}
