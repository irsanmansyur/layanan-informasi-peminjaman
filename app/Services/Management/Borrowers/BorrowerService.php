<?php

namespace App\Services\Management\Borrowers;

use App\Models\Borrower;
use App\Repositories\Contracts\BorrowerRepositoryInterface;
use Illuminate\Support\Facades\DB;

class BorrowerService
{
    public function __construct(
        private readonly BorrowerRepositoryInterface $borrowers,
    ) {}

    public function create(array $data): Borrower
    {
        return DB::transaction(function () use ($data): Borrower {
            return $this->borrowers->create([
                'name' => $data['name'],
                'total' => $data['total'],
                'status' => $data['status'],
                'borrowed_at' => $data['borrowed_at'],
                'paid_off_at' => $data['paid_off_at'] ?? null,
            ]);
        });
    }

    public function update(Borrower $borrower, array $data): Borrower
    {
        return DB::transaction(function () use ($borrower, $data): Borrower {
            $borrower->name = $data['name'];
            $borrower->total = $data['total'];
            $borrower->status = $data['status'];
            $borrower->borrowed_at = $data['borrowed_at'];
            $borrower->paid_off_at = $data['paid_off_at'] ?? null;

            $this->borrowers->save($borrower);

            return $borrower;
        });
    }

    public function delete(Borrower $borrower): void
    {
        DB::transaction(function () use ($borrower): void {
            $this->borrowers->delete($borrower);
        });
    }

    /**
     * @param  list<string>  $ids
     * @return int|null Jumlah yang dihapus, atau null jika tidak ada ID
     */
    public function bulkDestroy(array $ids): ?int
    {
        if ($ids === []) {
            return null;
        }

        DB::transaction(function () use ($ids): void {
            $this->borrowers->deleteWhereIdsIn($ids);
        });

        return \count($ids);
    }
}
