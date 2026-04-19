<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Services\PermissionGroupService;
use Illuminate\Database\Seeder;

class PermissionGroupsSeeder extends Seeder
{
    public function run(): void
    {
        $service = new PermissionGroupService;

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

        $service->createGroup('Activity Log Module', [
            'activity-logs.read',
        ]);

        $service->createGroup('Borrower Module', [
            'borrowers.create',
            'borrowers.read',
            'borrowers.update',
            'borrowers.delete',
        ]);

        $service->createGroup('Information Module', [
            'informations.create',
            'informations.read',
            'informations.update',
            'informations.delete',
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
        $service->assignGroupToRole($adminRole, 'Activity Log Module');
        $service->assignGroupToRole($adminRole, 'Borrower Module');
        $service->assignGroupToRole($adminRole, 'Information Module');
        // Semua user (termasuk role 'user') dapat melihat informasi
        $userRole->givePermissionTo('informations.read');
    }
}
