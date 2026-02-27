<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\Role;


class PermissionGroupService
{
    public function createGroup(string $group, array $permissions, string $guardName = 'web'): void
    {
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                [
                    'name' => $permission,
                    'guard_name' => $guardName,
                ],
                [
                    'group' => $group,
                ],
            );
        }
    }

    public function assignGroupToRole(Role $role, string $group): void
    {
        $permissions = Permission::query()
            ->where('group', $group)
            ->pluck('name')
            ->all();

        if ($permissions === []) {
            return;
        }

        $role->givePermissionTo($permissions);
    }
}

