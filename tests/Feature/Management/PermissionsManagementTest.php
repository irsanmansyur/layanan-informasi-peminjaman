<?php

namespace Tests\Feature\Management;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\PermissionGroupsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionsManagementTest extends TestCase
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

    public function test_guests_cannot_access_permissions_index(): void
    {
        $response = $this->get(route('permissions.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_users_without_permission_cannot_access_permissions_index(): void
    {
        $user = User::factory()->create();
        $user->assignRole(Role::where('name', 'user')->first());

        $response = $this->actingAs($user)->get(route('permissions.index'));
        $response->assertForbidden();
    }

    public function test_admin_can_access_permissions_index(): void
    {
        $response = $this->actingAs($this->admin)->get(route('permissions.index'));
        $response->assertOk();
    }

    public function test_admin_can_fetch_permissions_data(): void
    {
        $response = $this->actingAs($this->admin)->getJson(route('permissions.fetch-data'));
        $response->assertOk();
        $response->assertJsonStructure(['permissions' => ['data']]);
    }

    public function test_admin_can_fetch_permission_list(): void
    {
        $response = $this->actingAs($this->admin)->getJson(route('permissions.list'));
        $response->assertOk();
        $response->assertJsonStructure(['permissions']);
    }

    public function test_admin_can_create_permission(): void
    {
        $data = [
            'name' => 'custom.permission',
            'group' => 'Custom',
            'guard_name' => 'web',
        ];

        $response = $this->actingAs($this->admin)->post(route('permissions.store'), $data);
        $response->assertRedirect();

        $this->assertDatabaseHas('permissions', ['name' => 'custom.permission']);
    }

    public function test_admin_can_update_permission(): void
    {
        $permission = Permission::first();
        $this->assertNotNull($permission);

        $response = $this->actingAs($this->admin)->put(route('permissions.update', $permission), [
            'name' => $permission->name,
            'group' => 'Updated Group',
            'guard_name' => 'web',
        ]);
        $response->assertRedirect();

        $permission->refresh();
        $this->assertSame('Updated Group', $permission->group);
    }

    public function test_admin_can_delete_permission(): void
    {
        $permission = Permission::create([
            'name' => 'deletable.permission',
            'guard_name' => 'web',
        ]);

        $response = $this->actingAs($this->admin)->delete(route('permissions.destroy', $permission));
        $response->assertRedirect();

        $this->assertDatabaseMissing('permissions', ['id' => $permission->id]);
    }
}
