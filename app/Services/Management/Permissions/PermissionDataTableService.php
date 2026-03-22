<?php

namespace App\Services\Management\Permissions;

use App\Models\Permission;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use App\Services\DataTable\DataTableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionDataTableService
{
    public function __construct(
        private readonly DataTableService $dataTable,
        private readonly PermissionRepositoryInterface $permissions,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $query = $this->permissions->query();

        $permissions = $this->dataTable->handle($query, $request, [
            'search' => [
                'key' => 'search',
                'operator' => 'ilike',
                'columns' => ['name', 'group', 'guard_name'],
                'relations' => [],
            ],
            'filters' => [
                [
                    'key' => 'group',
                    'type' => 'column',
                    'column' => 'group',
                    'operator' => '=',
                    'all_value' => 'all',
                ],
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
                'allowed' => ['name', 'group', 'guard_name', 'created_at'],
                'custom' => [],
            ],
            'per_page_key' => 'limit',
            'per_page' => 10,
            'transform' => static function (Permission $permission): array {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'group' => $permission->group,
                    'guard_name' => $permission->guard_name,
                    'created_at' => $permission->created_at,
                    'updated_at' => $permission->updated_at,
                ];
            },
        ]);

        return response()->json([
            'permissions' => $permissions,
        ]);
    }
}
