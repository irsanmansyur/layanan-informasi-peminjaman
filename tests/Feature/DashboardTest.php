<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $response = $this->get(route('dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('is_admin', false)
            ->where('greeting_name', $user->name)
            ->has('roles')
            ->missing('admin')
        );
    }

    public function test_admin_role_receives_admin_dashboard_payload(): void
    {
        $adminRole = Role::query()->firstOrCreate(
            ['name' => 'admin', 'guard_name' => 'web'],
        );

        $user = User::factory()->create();
        $user->assignRole($adminRole);

        User::factory()->count(2)->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('is_admin', true)
            ->has('admin', fn (Assert $admin) => $admin
                ->where('users_count', 3)
                ->where('roles_count', 1)
                ->has('activity_trend', 7)
                ->etc()
            )
        );
    }
}
