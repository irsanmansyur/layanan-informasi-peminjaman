<?php

namespace App\Repositories\Contracts;

use App\Models\Borrower;
use Illuminate\Database\Eloquent\Builder;

interface BorrowerRepositoryInterface
{
    public function query(): Builder;

    public function create(array $attributes): Borrower;

    public function save(Borrower $borrower): void;

    public function delete(Borrower $borrower): void;

    /**
     * @param  list<string>  $ids
     */
    public function deleteWhereIdsIn(array $ids): void;
}
