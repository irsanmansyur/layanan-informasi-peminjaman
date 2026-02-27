<?php

namespace App\Services\Management;

use App\Models\Role;
use Illuminate\Support\Facades\DB;

class RoleService
{
    public function create(array $data): Role
    {
        return DB::transaction(static function () use ($data): Role {
            $role = Role::query()->create([
                'name'       => $data['name'],
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
        return DB::transaction(static function () use ($role, $data): Role {
            $role->name = $data['name'];

            if (array_key_exists('guard_name', $data)) {
                $role->guard_name = $data['guard_name'];
            }

            $role->save();

            if (array_key_exists('permissions', $data)) {
                $permissionIds = (array) ($data['permissions'] ?? []);
                $role->syncPermissions($permissionIds);
            }

            return $role;
        });
    }

    public function delete(Role $role): void
    {
        DB::transaction(static function () use ($role): void {
            $role->delete();
        });
    }
}

