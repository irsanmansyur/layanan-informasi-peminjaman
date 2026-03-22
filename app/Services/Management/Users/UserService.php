<?php

namespace App\Services\Management\Users;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;

class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
    ) {}

    public function create(array $data): User
    {
        return DB::transaction(function () use ($data): User {
            $user = $this->users->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
            ]);

            if (! empty($data['roles'])) {
                $user->syncRoles($data['roles']);
            }

            return $user;
        });
    }

    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data): User {
            $user->name = $data['name'];
            $user->email = $data['email'];

            if (! empty($data['password'])) {
                $user->password = $data['password'];
            }

            $this->users->save($user);

            if (array_key_exists('roles', $data)) {
                $user->syncRoles($data['roles'] ?? []);
            }

            return $user;
        });
    }

    public function delete(User $user): void
    {
        DB::transaction(function () use ($user): void {
            $this->users->delete($user);
        });
    }

    /**
     * Hapus banyak user; ID yang sama dengan $excludeUserId diabaikan.
     *
     * @param  list<string>  $ids
     * @return int|null Jumlah yang dihapus, atau null jika tidak ada ID tersisa setelah filter
     */
    public function bulkDestroy(array $ids, string $excludeUserId): ?int
    {
        $filteredIds = array_values(
            array_filter(
                $ids,
                static fn (string $id): bool => $id !== $excludeUserId,
            ),
        );

        if ($filteredIds === []) {
            return null;
        }

        DB::transaction(function () use ($filteredIds): void {
            $this->users->deleteWhereIdsIn($filteredIds);
        });

        return \count($filteredIds);
    }
}
