<?php

namespace App\Services\Management\Informations;

use App\Models\Information;
use App\Repositories\Contracts\InformationRepositoryInterface;
use App\Services\DataTable\DataTableService;
use App\Support\DataTable\LikeSearch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InformationDataTableService
{
    public function __construct(
        private readonly DataTableService $dataTable,
        private readonly InformationRepositoryInterface $informations,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $query = $this->informations->query();

        $this->applySearch($query, $request);

        $informations = $this->dataTable->handle($query, $request, [
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
                    'title',
                    'status',
                    'start_date',
                    'end_date',
                    'created_at',
                ],
            ],
            'per_page_key' => 'limit',
            'per_page' => 10,
            'transform' => static function (Information $information): array {
                return [
                    'id' => $information->id,
                    'title' => $information->title,
                    'content' => $information->content,
                    'status' => $information->status,
                    'start_date' => $information->start_date?->toDateString(),
                    'end_date' => $information->end_date?->toDateString(),
                    'created_at' => $information->created_at,
                    'updated_at' => $information->updated_at,
                ];
            },
        ]);

        return response()->json([
            'informations' => $informations,
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
                ->where('title', $operator, $pattern)
                ->orWhere('content', $operator, $pattern)
                ->orWhere('status', $operator, $pattern);
        });
    }
}
