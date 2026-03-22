<?php

namespace App\Presenters\Management;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Support\Collection;

final class RoleEditPresenter
{
    /**
     * @param  Collection<int, Permission>  $allPermissions
     * @return array{role: array<string, mixed>, permissions: Collection<int, array<string, mixed>>}
     */
    public static function forShowJson(Role $role, Collection $allPermissions): array
    {
        $role->loadMissing('permissions');

        return [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'permissions' => $role->permissions->pluck('id')->values(),
            ],
            'permissions' => $allPermissions->map(static function (Permission $permission): array {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'group' => $permission->group,
                    'guard_name' => $permission->guard_name,
                ];
            }),
        ];
    }
}
