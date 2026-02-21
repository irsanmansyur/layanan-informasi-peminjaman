<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Http\Requests\Management\RoleStoreRequest;
use App\Http\Requests\Management\RoleUpdateRequest;
use App\Services\Management\RoleDataTableService;
use App\Services\Management\RoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesController extends Controller
{
    public function __construct(
        private readonly RoleDataTableService $roleDataTableService,
        private readonly RoleService $roleService,
    ) 
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
        return $this->roleDataTableService->handle($request);
    }

    public function roleList(): JsonResponse
    {
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
    }

    public function store(RoleStoreRequest $request)
    {
        $data = $request->validated();

        try {
            $this->roleService->create($data);
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
            $this->roleService->update($role, $data);
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
            $this->roleService->delete($role);
        } catch (\Throwable $e) {
            return back()->withErrors([
                'message' => 'Error deleting role.',
            ]);
        }

        return back();
    }
}
