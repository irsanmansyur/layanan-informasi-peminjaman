<?php

namespace App\Services\Management\Roles;

use App\Models\Permission;
use App\Models\Role;
use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Services\DataTable\DataTableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleDataTableService
{
    public function __construct(
        private readonly DataTableService $dataTable,
        private readonly RoleRepositoryInterface $roles,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $query = $this->roles->queryWithPermissions();

        $roles = $this->dataTable->handle($query, $request, [
            'search' => [
                'key' => 'search',
                'operator' => 'ilike',
                'columns' => ['name', 'guard_name'],
                'relations' => [
                    'permissions' => ['name'],
                ],
            ],
            'filters' => [
                [
                    'key' => 'guard_name',
                    'type' => 'column',
                    'column' => 'guard_name',
                    'operator' => '=',
                    'all_value' => 'all',
                ],
            ],
            'sort' => [
                'key' => 'sort',
                'direction_key' => 'direction',
                'default' => ['name', 'asc'],
                'allowed' => ['name', 'guard_name', 'created_at'],
                'custom' => [
                    'permissions' => static function ($query, string $direction): void {
                        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

                        $query
                            ->withMin('permissions as primary_permission_name', 'name')
                            ->orderBy('primary_permission_name', $direction);
                    },
                ],
            ],
            'per_page_key' => 'limit',
            'per_page' => 10,
            'transform' => static function (Role $role): array {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'permissions' => $role->permissions->map(static function (Permission $permission): array {
                        return [
                            'id' => $permission->id,
                            'name' => $permission->name,
                            'group' => $permission->group,
                            'guard_name' => $permission->guard_name,
                        ];
                    })->values(),
                    'created_at' => $role->created_at,
                    'updated_at' => $role->updated_at,
                ];
            },
        ]);

        return response()->json([
            'roles' => $roles,
        ]);
    }
}
