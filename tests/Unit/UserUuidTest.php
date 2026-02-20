<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class UserUuidTest extends TestCase
{
    use RefreshDatabase;

    public function test_uuid_is_generated_when_creating_user(): void
    {
        $user = User::factory()->create();

        $this->assertNotEmpty($user->id);
        $this->assertTrue(Str::isUuid($user->id));
    }
}

