<?php

namespace App\Repositories\Contracts;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

interface PermissionRepositoryInterface
{
    public function query(): Builder;

    public function create(array $attributes): Permission;

    public function save(Permission $permission): void;

    public function delete(Permission $permission): void;

    /**
     * @return Collection<int, Permission>
     */
    public function allOrderedByGroupAndName(): Collection;
}
