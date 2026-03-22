<?php

namespace App\Repositories\Eloquent;

use App\Models\Permission;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class PermissionRepository implements PermissionRepositoryInterface
{
    public function query(): Builder
    {
        return Permission::query();
    }

    public function create(array $attributes): Permission
    {
        return Permission::query()->create($attributes);
    }

    public function save(Permission $permission): void
    {
        $permission->save();
    }

    public function delete(Permission $permission): void
    {
        $permission->delete();
    }

    public function allOrderedByGroupAndName(): Collection
    {
        return Permission::query()
            ->orderBy('group')
            ->orderBy('name')
            ->get();
    }
}
