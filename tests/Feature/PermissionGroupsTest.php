<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionGroupsTest extends TestCase
{
    use RefreshDatabase;

    public function test_permission_groups_are_seeded_and_assignable_to_roles(): void
    {
        $this->seed(\Database\Seeders\PermissionGroupsSeeder::class);

        $role = Role::where('name', 'admin')->first();

        $this->assertNotNull($role);
        $this->assertTrue($role->hasPermissionTo('users.create'));
        $this->assertTrue($role->hasPermissionTo('users.read'));
        $this->assertTrue($role->hasPermissionTo('users.update'));
        $this->assertTrue($role->hasPermissionTo('users.delete'));
    }

    public function test_user_can_receive_permissions_via_group_assigned_role(): void
    {
        $this->seed(\Database\Seeders\PermissionGroupsSeeder::class);

        $user = User::factory()->create();
        $role = Role::where('name', 'admin')->first();

        $this->assertNotNull($role);

        $user->assignRole($role);

        $this->assertTrue($user->hasRole('admin'));
        $this->assertTrue($user->can('users.create'));
        $this->assertTrue($user->can('users.read'));
        $this->assertTrue($user->can('users.update'));
        $this->assertTrue($user->can('users.delete'));
    }
}

