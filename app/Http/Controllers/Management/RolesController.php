<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Http\Requests\Management\RoleStoreRequest;
use App\Http\Requests\Management\RoleUpdateRequest;
use App\Services\DataTable\DataTableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesController extends Controller
{
    public function __construct(private readonly DataTableService $dataTable)
    {
        $this->middleware(['auth', 'verified']);
        $this->middleware('can:roles.read')->only(['index', 'fetchData', 'show', 'roleList']);
        $this->middleware('can:roles.create')->only('store');
        $this->middleware('can:roles.update')->only('update');
        $this->middleware('can:roles.delete')->only('destroy');
    }

    public function index(Request $request): Response
    {
        return Inertia::render('management/roles/index');
    }

    public function fetchData(Request $request): JsonResponse
    {
        $query = Role::query()->with('permissions');

        $roles = $this->dataTable->handle($query, $request, [
            'search'       => [
                'key'       => 'search',
                'operator'  => 'ilike',
                'columns'   => ['name', 'guard_name'],
                'relations' => [
                    'permissions' => ['name'],
                ],
            ],
            'filters'      => [
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
                'allowed'       => ['name', 'guard_name', 'created_at'],
                'custom'        => [
                    'permissions' => static function ($query, string $direction): void {
                        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

                        $query
                            ->withMin('permissions as primary_permission_name', 'name')
                            ->orderBy('primary_permission_name', $direction);
                    },
                ],
            ],
            'per_page_key' => 'limit',
            'per_page'     => 10,
            'transform'    => static function (Role $role): array {
                return [
                    'id'          => $role->id,
                    'name'        => $role->name,
                    'guard_name'  => $role->guard_name,
                    'permissions' => $role->permissions->map(static function (Permission $permission): array {
                        return [
                            'id'         => $permission->id,
                            'name'       => $permission->name,
                            'group'      => $permission->group,
                            'guard_name' => $permission->guard_name,
                        ];
                    })->values(),
                    'created_at'  => $role->created_at,
                    'updated_at'  => $role->updated_at,
                ];
            },
        ]);

        return response()->json([
            'roles' => $roles,
        ]);
    }

    public function roleList(): JsonResponse
    {
        try {
            $roles = Role::query()
                ->orderBy('name')
                ->get()
                ->map(static fn (Role $role): array => [
                    'id'    => $role->id,
                    'name'  => $role->name,
                    'label' => ucfirst($role->name),
                ]);

            return response()->json([
                'roles' => $roles,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching roles list',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function store(RoleStoreRequest $request)
    {
        $data = $request->validated();

        try {
            DB::transaction(static function () use ($data): void {
                $role = Role::query()->create([
                    'name'       => $data['name'],
                    'guard_name' => $data['guard_name'] ?? 'web',
                ]);

                $permissionIds = (array) ($data['permissions'] ?? []);

                if ($permissionIds !== []) {
                    $role->syncPermissions($permissionIds);
                }

                $role->load('permissions');

            });
        } catch (\Throwable $e) {
            return back()->withErrors([
                'message' => 'Error creating role.',
            ]);
        }

        return back();
    }

    public function show(Role $role): JsonResponse
    {
        $role->load('permissions');

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
            'role'        => [
                'id'          => $role->id,
                'name'        => $role->name,
                'guard_name'  => $role->guard_name,
                'permissions' => $role->permissions->pluck('id')->values(),
            ],
            'permissions' => $permissions,
        ]);
    }

    public function update(RoleUpdateRequest $request, Role $role)
    {
        $data = $request->validated();

        try {
            DB::transaction(static function () use ($role, $data): void {
                $role->name = $data['name'];

                if (array_key_exists('guard_name', $data)) {
                    $role->guard_name = $data['guard_name'];
                }

                $role->save();

                if (array_key_exists('permissions', $data)) {
                    $permissionIds = (array) ($data['permissions'] ?? []);
                    $role->syncPermissions($permissionIds);
                }
            });
        } catch (\Throwable $e) {
            return back()->withErrors([
                'message' => 'Error updating role.',
            ]);
        }

        return back();
    }

    public function destroy(Role $role)
    {
        try {
            DB::transaction(static function () use ($role): void {
                $role->delete();
            });
        } catch (\Throwable $e) {
            return back()->withErrors([
                'message' => 'Error deleting role.',
            ]);
        }

        return back();
    }
}
