<?php

namespace App\Services\Management\Borrowers;

use App\Models\Borrower;
use App\Repositories\Contracts\BorrowerRepositoryInterface;
use App\Services\DataTable\DataTableService;
use App\Support\DataTable\LikeSearch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BorrowerDataTableService
{
    public function __construct(
        private readonly DataTableService $dataTable,
        private readonly BorrowerRepositoryInterface $borrowers,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $query = $this->borrowers->query();

        $this->applySearch($query, $request);

        $borrowers = $this->dataTable->handle($query, $request, [
            'filters' => [
                [
                    'key' => 'status',
                    'column' => 'status',
                    'operator' => '=',
                    'all_value' => 'all',
                ],
            ],
            'sort' => [
                'key' => 'sort',
                'direction_key' => 'direction',
                'default' => ['created_at', 'desc'],
                'allowed' => [
                    'name',
                    'total',
                    'status',
                    'borrowed_at',
                    'paid_off_at',
                    'created_at',
                ],
            ],
            'per_page_key' => 'limit',
            'per_page' => 10,
            'transform' => static function (Borrower $borrower): array {
                return [
                    'id' => $borrower->id,
                    'name' => $borrower->name,
                    'total' => (float) $borrower->total,
                    'status' => $borrower->status,
                    'borrowed_at' => $borrower->borrowed_at?->toDateString(),
                    'paid_off_at' => $borrower->paid_off_at?->toDateString(),
                    'created_at' => $borrower->created_at,
                    'updated_at' => $borrower->updated_at,
                ];
            },
        ]);

        return response()->json([
            'borrowers' => $borrowers,
        ]);
    }

    private function applySearch(Builder $query, Request $request): void
    {
        if (! $request->filled('search')) {
            return;
        }

        $raw = trim((string) $request->input('search', ''));
        if ($raw === '') {
            return;
        }

        $pattern = LikeSearch::wrapContainsPattern(LikeSearch::escapeWildcards($raw));
        $operator = LikeSearch::caseInsensitiveOperator($query);

        $query->where(function (Builder $outer) use ($pattern, $operator): void {
            $outer
                ->where('name', $operator, $pattern)
                ->orWhere('status', $operator, $pattern);
        });
    }
}
