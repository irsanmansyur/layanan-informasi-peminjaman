<?php

namespace Database\Seeders;

use App\Models\Role;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionGroupsSeeder::class,
            InformationSeeder::class,
            BorrowerSeeder::class,
        ]);

        $admin = User::firstOrCreate(
            [
                'email' => 'admin@app.com',
            ],
            [
                'name' => 'admin',
                'password' => bcrypt('rahasia!'),
            ],
        );

        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web',
        ]);
        $userRole = Role::firstOrCreate([
            'name' => 'user',
            'guard_name' => 'web',
        ]);

        if ($adminRole !== null) {
            $admin->assignRole($adminRole);
        }

        if (! User::whereHas('roles', fn ($query) => $query->where('name', 'user'))->exists()) {
            $users = User::factory(5000)->create();

            $users->each(function (User $user) use ($userRole): void {
                $user->assignRole($userRole);
            });
        }
    }
}
