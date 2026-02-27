<?php

namespace Tests\Feature\Management;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\PermissionGroupsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolesManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionGroupsSeeder::class);
        $this->admin = User::factory()->create();
        $this->admin->assignRole(Role::where('name', 'admin')->first());
    }

    public function test_guests_cannot_access_roles_index(): void
    {
        $response = $this->get(route('roles.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_users_without_permission_cannot_access_roles_index(): void
    {
        $user = User::factory()->create();
        $user->assignRole(Role::where('name', 'user')->first());

        $response = $this->actingAs($user)->get(route('roles.index'));
        $response->assertForbidden();
    }

    public function test_admin_can_access_roles_index(): void
    {
        $response = $this->actingAs($this->admin)->get(route('roles.index'));
        $response->assertOk();
    }

    public function test_admin_can_fetch_roles_data(): void
    {
        $response = $this->actingAs($this->admin)->getJson(route('roles.fetch-data'));
        $response->assertOk();
        $response->assertJsonStructure(['roles' => ['data']]);
    }

    public function test_admin_can_fetch_role_list(): void
    {
        $response = $this->actingAs($this->admin)->getJson(route('roles.list'));
        $response->assertOk();
        $response->assertJsonStructure(['roles']);
    }

    public function test_admin_can_view_role(): void
    {
        $role = Role::where('name', 'admin')->first();

        $response = $this->actingAs($this->admin)->getJson(route('roles.show', $role));
        $response->assertOk();
        $response->assertJsonStructure(['role', 'permissions']);
    }

    public function test_admin_can_create_role(): void
    {
        $permission = Permission::first();
        $data = [
            'name' => 'editor',
            'guard_name' => 'web',
            'permissions' => $permission ? [$permission->id] : [],
        ];

        $response = $this->actingAs($this->admin)->post(route('roles.store'), $data);
        $response->assertRedirect();

        $this->assertDatabaseHas('roles', ['name' => 'editor']);
    }

    public function test_admin_can_update_role(): void
    {
        $role = Role::where('name', 'user')->first();

        $response = $this->actingAs($this->admin)->put(route('roles.update', $role), [
            'name' => 'member',
            'guard_name' => 'web',
        ]);
        $response->assertRedirect();

        $role->refresh();
        $this->assertSame('member', $role->name);
    }

    public function test_admin_can_delete_role(): void
    {
        $role = Role::create(['name' => 'deletable', 'guard_name' => 'web']);

        $response = $this->actingAs($this->admin)->delete(route('roles.destroy', $role));
        $response->assertRedirect();

        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }
}
