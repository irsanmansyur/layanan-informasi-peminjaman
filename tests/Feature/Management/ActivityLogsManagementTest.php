<?php

namespace Tests\Feature\Management;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\PermissionGroupsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityLogsManagementTest extends TestCase
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

    public function test_guests_cannot_access_activity_logs_index(): void
    {
        $response = $this->get(route('activity-logs.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_users_without_permission_cannot_access_activity_logs_index(): void
    {
        $user = User::factory()->create();
        $user->assignRole(Role::where('name', 'user')->first());

        $response = $this->actingAs($user)->get(route('activity-logs.index'));
        $response->assertForbidden();
    }

    public function test_admin_can_access_activity_logs_index(): void
    {
        $response = $this->actingAs($this->admin)->get(route('activity-logs.index'));
        $response->assertOk();
    }

    public function test_admin_can_fetch_activity_logs_data(): void
    {
        $response = $this->actingAs($this->admin)->getJson(route('activity-logs.fetch-data'));
        $response->assertOk();
        $response->assertJsonStructure(['logs' => ['data']]);
    }
}
