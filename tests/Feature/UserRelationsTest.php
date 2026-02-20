<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class UserRelationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_sessions_foreign_key_uses_uuid_and_cascades_on_delete(): void
    {
        $user = User::factory()->create();

        DB::table('sessions')->insert([
            'id' => 'test-session-id',
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'test-agent',
            'payload' => 'test',
            'last_activity' => time(),
        ]);

        $this->assertDatabaseHas('sessions', [
            'id' => 'test-session-id',
            'user_id' => $user->id,
        ]);

        $user->delete();

        $this->assertDatabaseMissing('sessions', [
            'id' => 'test-session-id',
        ]);
    }
}

