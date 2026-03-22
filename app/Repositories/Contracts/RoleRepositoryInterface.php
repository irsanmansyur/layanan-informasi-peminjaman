<?php

namespace App\Repositories\Contracts;

use App\Models\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

interface RoleRepositoryInterface
{
    public function queryWithPermissions(): Builder;

    public function create(array $attributes): Role;

    public function save(Role $role): void;

    public function delete(Role $role): void;

    /**
     * @return Collection<int, Role>
     */
    public function allOrderedByName(): Collection;
}
