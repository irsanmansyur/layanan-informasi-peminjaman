<?php

namespace App\Services\Management\Users;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\DataTable\DataTableService;
use App\Support\DataTable\LikeSearch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserDataTableService
{
    private const MIN_LENGTH_FOR_ROLE_SEARCH = 2;

    public function __construct(
        private readonly DataTableService $dataTable,
        private readonly UserRepositoryInterface $users,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $query = $this->users->queryWithRoles();

        $this->applyOptimizedSearch($query, $request);

        $users = $this->dataTable->handle($query, $request, [
            'filters' => [
                [
                    'key' => 'role',
                    'type' => 'relation',
                    'relation' => 'roles',
                    'column' => 'name',
                    'operator' => 'ilike',
                    'all_value' => 'all',
                ],
            ],
            'sort' => [
                'key' => 'sort',
                'direction_key' => 'direction',
                'default' => ['created_at', 'desc'],
                'allowed' => ['name', 'email', 'created_at'],
                'custom' => [
                    'roles' => static function ($query, string $direction): void {
                        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

                        $query
                            ->withMin('roles as primary_role_name', 'name')
                            ->orderBy('primary_role_name', $direction);
                    },
                ],
            ],
            'per_page_key' => 'limit',
            'per_page' => 10,
            'transform' => static function (User $user): array {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name')->map(fn ($role) => ucfirst($role)),
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ];
            },
        ]);

        return response()->json([
            'users' => $users,
        ]);
    }

    /**
     * Pencarian tanpa orWhereHas berantai — memakai orWhereIn + subquery ke pivot Spatie
     * agar planner DB lebih efisien pada data besar.
     */
    private function applyOptimizedSearch(Builder $query, Request $request): void
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
        $isEmailSearch = str_contains($raw, '@');

        $query->where(function (Builder $outer) use ($pattern, $operator, $isEmailSearch, $raw): void {
            if ($isEmailSearch) {
                $outer->where('email', $operator, $pattern);

                return;
            }

            $outer
                ->where('name', $operator, $pattern)
                ->orWhere('email', $operator, $pattern);

            if (mb_strlen($raw) >= self::MIN_LENGTH_FOR_ROLE_SEARCH) {
                $outer->orWhereIn('users.id', $this->userIdsMatchingRoleName($pattern, $operator));
            }
        });
    }

    private function userIdsMatchingRoleName(string $pattern, string $operator): \Closure
    {
        $pivot = config('permission.table_names.model_has_roles', 'model_has_roles');
        $rolesTable = config('permission.table_names.roles', 'roles');
        $userClass = User::class;

        return static function ($sub) use ($pattern, $operator, $pivot, $rolesTable, $userClass): void {
            $sub->select("{$pivot}.model_id")
                ->from($pivot)
                ->join($rolesTable, "{$rolesTable}.id", '=', "{$pivot}.role_id")
                ->where("{$pivot}.model_type", '=', $userClass)
                ->where("{$rolesTable}.name", $operator, $pattern);
        };
    }
}
