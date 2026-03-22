<?php

namespace App\Services\Management\Roles;

use App\Models\Role;
use App\Repositories\Contracts\RoleRepositoryInterface;
use Illuminate\Support\Facades\DB;

class RoleService
{
    public function __construct(
        private readonly RoleRepositoryInterface $roles,
    ) {}

    public function create(array $data): Role
    {
        return DB::transaction(function () use ($data): Role {
            $role = $this->roles->create([
                'name' => $data['name'],
                'guard_name' => $data['guard_name'] ?? 'web',
            ]);

            $permissionIds = (array) ($data['permissions'] ?? []);

            if ($permissionIds !== []) {
                $role->syncPermissions($permissionIds);
            }

            return $role;
        });
    }

    public function update(Role $role, array $data): Role
    {
        return DB::transaction(function () use ($role, $data): Role {
            $role->name = $data['name'];

            if (array_key_exists('guard_name', $data)) {
                $role->guard_name = $data['guard_name'];
            }

            $this->roles->save($role);

            if (array_key_exists('permissions', $data)) {
                $permissionIds = (array) ($data['permissions'] ?? []);
                $role->syncPermissions($permissionIds);
            }

            return $role;
        });
    }

    public function delete(Role $role): void
    {
        DB::transaction(function () use ($role): void {
            $this->roles->delete($role);
        });
    }
}
