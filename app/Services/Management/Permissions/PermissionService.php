<?php

namespace App\Services\Management\Permissions;

use App\Models\Permission;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use Illuminate\Support\Facades\DB;

class PermissionService
{
    public function __construct(
        private readonly PermissionRepositoryInterface $permissions,
    ) {}

    public function create(array $data): Permission
    {
        return DB::transaction(function () use ($data): Permission {
            return $this->permissions->create([
                'name' => $data['name'],
                'group' => $data['group'] ?? null,
                'guard_name' => $data['guard_name'] ?? 'web',
            ]);
        });
    }

    public function update(Permission $permission, array $data): Permission
    {
        return DB::transaction(function () use ($permission, $data): Permission {
            $permission->name = $data['name'];
            $permission->group = $data['group'] ?? null;

            if (array_key_exists('guard_name', $data)) {
                $permission->guard_name = $data['guard_name'];
            }

            $this->permissions->save($permission);

            return $permission;
        });
    }

    public function delete(Permission $permission): void
    {
        DB::transaction(function () use ($permission): void {
            $this->permissions->delete($permission);
        });
    }
}
