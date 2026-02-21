<?php

namespace App\Services\Management;

use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;

class PermissionService
{
    public function create(array $data): Permission
    {
        return DB::transaction(static function () use ($data): Permission {
            return Permission::query()->create([
                'name'       => $data['name'],
                'group'      => $data['group'] ?? null,
                'guard_name' => $data['guard_name'] ?? 'web',
            ]);
        });
    }

    public function update(Permission $permission, array $data): Permission
    {
        return DB::transaction(static function () use ($permission, $data): Permission {
            $permission->name = $data['name'];
            $permission->group = $data['group'] ?? null;

            if (array_key_exists('guard_name', $data)) {
                $permission->guard_name = $data['guard_name'];
            }

            $permission->save();

            return $permission;
        });
    }

    public function delete(Permission $permission): void
    {
        DB::transaction(static function () use ($permission): void {
            $permission->delete();
        });
    }
}

