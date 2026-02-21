<?php

namespace App\Services\Management;

use App\Models\User;
use App\Services\DataTable\DataTableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserDataTableService
{
    public function __construct(private readonly DataTableService $dataTable)
    {
    }

    public function handle(Request $request): JsonResponse
    {
        $query = User::query()->with('roles');

        $rawSearch     = (string) $request->input('search', '');
        $isEmailSearch = $rawSearch !== '' && str_contains($rawSearch, '@');

        $searchOptions = [
            'key'       => 'search',
            'operator'  => 'ilike',
            'columns'   => $isEmailSearch ? ['email'] : ['name', 'email'],
            'relations' => $isEmailSearch ? [] : [
                'roles' => ['name'],
            ],
        ];

        $users = $this->dataTable->handle($query, $request, [
            'search'       => $searchOptions,
            'filters'      => [
                [
                    'key'       => 'role',
                    'type'      => 'relation',
                    'relation'  => 'roles',
                    'column'    => 'name',
                    'operator'  => 'ilike',
                    'all_value' => 'all',
                ],
            ],
            'sort'         => [
                'key'           => 'sort',
                'direction_key' => 'direction',
                'default'       => ['created_at', 'desc'],
                'allowed'       => ['name', 'email', 'created_at'],
                'custom'        => [
                    'roles' => static function ($query, string $direction): void {
                        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

                        $query
                            ->withMin('roles as primary_role_name', 'name')
                            ->orderBy('primary_role_name', $direction);
                    },
                ],
            ],
            'per_page_key' => 'limit',
            'per_page'     => 10,
            'transform'    => static function (User $user): array {
                return [
                    'id'         => $user->id,
                    'name'       => $user->name,
                    'email'      => $user->email,
                    'roles'      => $user->roles->pluck('name')->map(fn ($role) => ucfirst($role)),
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ];
            },
        ]);

        return response()->json([
            'users' => $users,
        ]);
    }
}

