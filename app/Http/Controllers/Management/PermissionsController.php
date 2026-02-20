<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Http\Requests\Management\PermissionStoreRequest;
use App\Http\Requests\Management\PermissionUpdateRequest;
use App\Services\DataTable\DataTableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionsController extends Controller
{
    public function __construct(private readonly DataTableService $dataTable)
    {
        $this->middleware(['auth', 'verified']);
        $this->middleware('can:permissions.read')->only(['index', 'fetchData', 'show', 'permissionList']);
        $this->middleware('can:permissions.create')->only('store');
        $this->middleware('can:permissions.update')->only('update');
        $this->middleware('can:permissions.delete')->only('destroy');
    }

    public function index(Request $request): Response
    {
        return Inertia::render('management/permissions/index');
    }

    public function fetchData(Request $request): JsonResponse
    {
        try {
            $query = Permission::query();

            $permissions = $this->dataTable->handle($query, $request, [
                'search'       => [
                    'key'       => 'search',
                    'operator'  => 'ilike',
                    'columns'   => ['name', 'group', 'guard_name'],
                    'relations' => [],
                ],
                'filters'      => [
                    [
                        'key'       => 'group',
                        'type'      => 'column',
                        'column'    => 'group',
                        'operator'  => '=',
                        'all_value' => 'all',
                    ],
                    [
                        'key'       => 'guard_name',
                        'type'      => 'column',
                        'column'    => 'guard_name',
                        'operator'  => '=',
                        'all_value' => 'all',
                    ],
                ],
                'sort'         => [
                    'key'           => 'sort',
                    'direction_key' => 'direction',
                    'default'       => ['name', 'asc'],
                    'allowed'       => ['name', 'group', 'guard_name', 'created_at'],
                    'custom'        => [],
                ],
                'per_page_key' => 'limit',
                'per_page'     => 10,
                'transform'    => static function (Permission $permission): array {
                    return [
                        'id'         => $permission->id,
                        'name'       => $permission->name,
                        'group'      => $permission->group,
                        'guard_name' => $permission->guard_name,
                        'created_at' => $permission->created_at,
                        'updated_at' => $permission->updated_at,
                    ];
                },
            ]);

            return response()->json([
                'permissions' => $permissions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching permissions data',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function permissionList(): JsonResponse
    {
        try {
            $permissions = Permission::query()
                ->orderBy('group')
                ->orderBy('name')
                ->get()
                ->map(static function (Permission $permission): array {
                    return [
                        'id'         => $permission->id,
                        'name'       => $permission->name,
                        'group'      => $permission->group,
                        'guard_name' => $permission->guard_name,
                    ];
                });

            return response()->json([
                'permissions' => $permissions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching permissions list',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function store(PermissionStoreRequest $request)
    {
        $data = $request->validated();

        try {
            DB::transaction(static function () use ($data): void {
                Permission::query()->create([
                    'name'       => $data['name'],
                    'group'      => $data['group'] ?? null,
                    'guard_name' => $data['guard_name'] ?? 'web',
                ]);
            });
        } catch (\Throwable $e) {
            return back()->withErrors([
                'message' => 'Error creating permission.',
            ]);
        }

        return back();
    }

    public function show(Permission $permission): JsonResponse
    {
        return response()->json([
            'permission' => [
                'id'         => $permission->id,
                'name'       => $permission->name,
                'group'      => $permission->group,
                'guard_name' => $permission->guard_name,
                'created_at' => $permission->created_at,
                'updated_at' => $permission->updated_at,
            ],
        ]);
    }

    public function update(PermissionUpdateRequest $request, Permission $permission)
    {
        $data = $request->validated();

        try {
            DB::transaction(static function () use ($permission, $data): void {
                $permission->name = $data['name'];
                $permission->group = $data['group'] ?? null;

                if (array_key_exists('guard_name', $data)) {
                    $permission->guard_name = $data['guard_name'];
                }

                $permission->save();
            });
        } catch (\Throwable $e) {
            return back()->withErrors([
                'message' => 'Error updating permission.',
            ]);
        }

        return back();
    }

    public function destroy(Permission $permission)
    {
        try {
            DB::transaction(static function () use ($permission): void {
                $permission->delete();
            });
        } catch (\Throwable $e) {
            return back()->withErrors([
                'message' => 'Error deleting permission.',
            ]);
        }

        return back();
    }
}
