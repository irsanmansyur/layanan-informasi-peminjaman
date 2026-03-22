<?php

namespace App\Services\DataTable;

use App\Support\DataTable\LikeSearch;
use Closure;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class DataTableService
{
    public function handle(Builder $query, Request $request, array $options): LengthAwarePaginator
    {
        $searchOptions = $options['search'] ?? null;
        $filters = $options['filters'] ?? [];
        $sortOptions = $options['sort'] ?? [];
        $perPageKey = $options['per_page_key'] ?? 'limit';
        $perPageDefault = $options['per_page'] ?? 10;
        $transform = $options['transform'] ?? null;

        if (is_array($searchOptions)) {
            $this->applySearch($query, $request, $searchOptions);
        }

        if (is_array($filters)) {
            $this->applyFilters($query, $request, $filters);
        }

        if (is_array($sortOptions)) {
            $this->applySorting($query, $request, $sortOptions);
        }

        $perPage = (int) $request->input($perPageKey, $perPageDefault);

        if ($perPage <= 0) {
            $perPage = $perPageDefault;
        }

        $paginator = $query->paginate($perPage)->withQueryString();

        if ($transform instanceof Closure) {
            $paginator->getCollection()->transform($transform);
        }

        return $paginator;
    }

    private function applySearch(Builder $query, Request $request, array $options): void
    {
        $key = $options['key'] ?? 'search';

        if (! $request->filled($key)) {
            return;
        }

        $term = $request->input($key);

        if ($term === null || $term === '') {
            return;
        }

        $raw = trim((string) $term);
        if ($raw === '') {
            return;
        }

        $escaped = LikeSearch::escapeWildcards($raw);
        $pattern = LikeSearch::wrapContainsPattern($escaped);

        $requestedOperator = strtolower((string) ($options['operator'] ?? 'like'));
        $operator = $requestedOperator === 'ilike'
            ? LikeSearch::caseInsensitiveOperator($query)
            : ($options['operator'] ?? 'like');

        $columns = $options['columns'] ?? [];
        $relations = $options['relations'] ?? [];

        if ($columns === [] && $relations === []) {
            return;
        }

        $query->where(function (Builder $q) use ($columns, $relations, $pattern, $operator): void {
            foreach ($columns as $column) {
                $q->orWhere($column, $operator, $pattern);
            }

            foreach ($relations as $relation => $relationColumns) {
                $q->orWhereHas($relation, function (Builder $relationQuery) use ($relationColumns, $pattern, $operator): void {
                    foreach ($relationColumns as $column) {
                        $relationQuery->orWhere($column, $operator, $pattern);
                    }
                });
            }
        });
    }

    private function applyFilters(Builder $query, Request $request, array $filters): void
    {
        foreach ($filters as $filter) {
            $key = $filter['key'] ?? null;

            if ($key === null) {
                continue;
            }

            if (! $request->filled($key)) {
                continue;
            }

            $value = $request->input($key);
            $allValue = $filter['all_value'] ?? null;

            if ($allValue !== null && $value === $allValue) {
                continue;
            }

            $type = $filter['type'] ?? 'column';

            if ($type === 'relation') {
                $relation = $filter['relation'] ?? null;
                $column = $filter['column'] ?? 'id';
                $operator = $filter['operator'] ?? '=';

                if ($relation === null) {
                    continue;
                }

                if (strtolower((string) $operator) === 'ilike') {
                    $operator = LikeSearch::caseInsensitiveOperator($query);
                }

                $query->whereHas($relation, function (Builder $relationQuery) use ($column, $operator, $value): void {
                    $relationQuery->where($column, $operator, $value);
                });
            } elseif ($type === 'custom' && isset($filter['callback']) && $filter['callback'] instanceof Closure) {
                ($filter['callback'])($query, $value, $request);
            } else {
                $column = $filter['column'] ?? $key;
                $operator = $filter['operator'] ?? '=';

                $query->where($column, $operator, $value);
            }
        }
    }

    private function applySorting(Builder $query, Request $request, array $options): void
    {
        $key = $options['key'] ?? 'sort';
        $directionKey = $options['direction_key'] ?? 'direction';
        $default = $options['default'] ?? null;
        $allowed = $options['allowed'] ?? [];
        $custom = $options['custom'] ?? [];

        if ($request->filled($key)) {
            $sort = $request->input($key);
            $direction = strtolower($request->input($directionKey, 'desc'));

            if (! in_array($direction, ['asc', 'desc'], true)) {
                $direction = 'desc';
            }

            if (isset($custom[$sort]) && $custom[$sort] instanceof Closure) {
                $custom[$sort]($query, $direction, $request);

                return;
            }

            if (in_array($sort, $allowed, true)) {
                $query->orderBy($sort, $direction);

                return;
            }
        }

        if (is_array($default) && count($default) === 2) {
            $query->orderBy($default[0], $default[1]);
        }
    }
}
