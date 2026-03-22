<?php

namespace App\Repositories\Eloquent;

use App\Models\Role;
use App\Repositories\Contracts\RoleRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class RoleRepository implements RoleRepositoryInterface
{
    public function queryWithPermissions(): Builder
    {
        return Role::query()->with('permissions');
    }

    public function create(array $attributes): Role
    {
        return Role::query()->create($attributes);
    }

    public function save(Role $role): void
    {
        $role->save();
    }

    public function delete(Role $role): void
    {
        $role->delete();
    }

    public function allOrderedByName(): Collection
    {
        return Role::query()->orderBy('name')->get();
    }
}
