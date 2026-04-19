<?php

namespace App\Policies;

use App\Models\Information;
use App\Models\User;

class InformationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('informations.read');
    }

    public function view(User $user, Information $information): bool
    {
        return $user->can('informations.read');
    }

    public function create(User $user): bool
    {
        return $user->can('informations.create');
    }

    public function update(User $user, Information $information): bool
    {
        return $user->can('informations.update');
    }

    public function delete(User $user, Information $information): bool
    {
        return $user->can('informations.delete');
    }

    public function bulkDestroy(User $user): bool
    {
        return $user->can('informations.delete');
    }
}
