<?php

namespace Database\Seeders;

use App\Services\PermissionGroupService;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class PermissionGroupsSeeder extends Seeder
{
    public function run(): void
    {
        $service = new PermissionGroupService();

        $service->createGroup('User Module', [
            'users.create',
            'users.read',
            'users.update',
            'users.delete',
        ]);

        $service->createGroup('Role Module', [
            'roles.create',
            'roles.read',
            'roles.update',
            'roles.delete',
        ]);

        $service->createGroup('Permission Module', [
            'permissions.create',
            'permissions.read',
            'permissions.update',
            'permissions.delete',
        ]);

        $service->createGroup('Profile Module', [
            'profile.read',
            'profile.update',
        ]);

        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web',
        ]);
        $userRole = Role::firstOrCreate([
            'name' => 'user',
            'guard_name' => 'web',
        ]);

        $service->assignGroupToRole($adminRole, 'User Module');
        $service->assignGroupToRole($adminRole, 'Role Module');
        $service->assignGroupToRole($adminRole, 'Permission Module');
        $service->assignGroupToRole($adminRole, 'Profile Module');
        $service->assignGroupToRole($userRole, 'Profile Module');
    }
}
