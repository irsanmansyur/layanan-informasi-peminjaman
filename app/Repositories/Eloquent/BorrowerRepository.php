<?php

namespace App\Repositories\Eloquent;

use App\Models\Borrower;
use App\Repositories\Contracts\BorrowerRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;

class BorrowerRepository implements BorrowerRepositoryInterface
{
    public function query(): Builder
    {
        return Borrower::query();
    }

    public function create(array $attributes): Borrower
    {
        return Borrower::query()->create($attributes);
    }

    public function save(Borrower $borrower): void
    {
        $borrower->save();
    }

    public function delete(Borrower $borrower): void
    {
        $borrower->delete();
    }

    public function deleteWhereIdsIn(array $ids): void
    {
        if ($ids === []) {
            return;
        }

        Borrower::query()->whereIn('id', $ids)->delete();
    }
}
