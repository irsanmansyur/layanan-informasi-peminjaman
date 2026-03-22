<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

interface UserRepositoryInterface
{
    public function queryWithRoles(): Builder;

    public function create(array $attributes): User;

    public function save(User $user): void;

    public function delete(User $user): void;

    /**
     * @param  list<string>  $ids
     */
    public function deleteWhereIdsIn(array $ids): void;
}
