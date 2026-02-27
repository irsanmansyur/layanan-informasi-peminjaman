<?php

namespace Tests\Feature\Management;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\PermissionGroupsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsersManagementTest extends TestCase
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

    public function test_guests_cannot_access_users_index(): void
    {
        $response = $this->get(route('users.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_users_without_permission_cannot_access_users_index(): void
    {
        $user = User::factory()->create();
        $user->assignRole(Role::where('name', 'user')->first());

        $response = $this->actingAs($user)->get(route('users.index'));
        $response->assertForbidden();
    }

    public function test_admin_can_access_users_index(): void
    {
        $response = $this->actingAs($this->admin)->get(route('users.index'));
        $response->assertOk();
    }

    public function test_admin_can_fetch_users_data(): void
    {
        User::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)->getJson(route('users.fetch-data'));
        $response->assertOk();
        $response->assertJsonStructure(['users' => ['data']]);
    }

    public function test_admin_can_create_user(): void
    {
        $data = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ];

        $response = $this->actingAs($this->admin)->post(route('users.store'), $data);
        $response->assertRedirect();

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    public function test_admin_can_create_user_with_roles(): void
    {
        $data = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'roles' => ['admin'],
        ];

        $response = $this->actingAs($this->admin)->post(route('users.store'), $data);
        $response->assertRedirect();

        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('admin'));
    }

    public function test_admin_can_update_user(): void
    {
        $user = User::factory()->create(['name' => 'Old Name', 'email' => 'old@example.com']);

        $response = $this->actingAs($this->admin)->put(route('users.update', $user), [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
        ]);
        $response->assertRedirect();

        $user->refresh();
        $this->assertSame('Updated Name', $user->name);
        $this->assertSame('updated@example.com', $user->email);
    }

    public function test_admin_can_delete_user(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($this->admin)->delete(route('users.destroy', $user));
        $response->assertRedirect();

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_admin_can_bulk_delete_users(): void
    {
        $users = User::factory()->count(3)->create();
        $ids = $users->pluck('id')->all();

        $response = $this->actingAs($this->admin)->deleteJson(route('users.bulk-destroy'), [
            'ids' => $ids,
        ]);
        $response->assertOk();
        $response->assertJson(['deleted_count' => 3]);

        foreach ($users as $user) {
            $this->assertDatabaseMissing('users', ['id' => $user->id]);
        }
    }

    public function test_bulk_delete_excludes_current_user(): void
    {
        $response = $this->actingAs($this->admin)->deleteJson(route('users.bulk-destroy'), [
            'ids' => [$this->admin->id],
        ]);
        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'Tidak ada user yang dapat dihapus.']);

        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    }
}
